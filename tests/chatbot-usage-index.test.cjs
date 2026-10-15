const { test } = require("node:test");
const assert = require("node:assert/strict");
const { run } = require("./helpers/mongosh.cjs");

const primary = { name: "_id_", key: { _id: 1 } };
const ttl = {
  name: "expiresAt_1",
  key: { expiresAt: 1 },
  expireAfterSeconds: 0,
};
function fixture(initial = [primary], database = "osms-test") {
  let indexes = [...initial],
    creates = 0,
    inserts = 0,
    deletes = 0;
  const usage = {
    getIndexes: async () => indexes,
    createIndex: async (key, options) => {
      creates++;
      indexes.push({ name: "expiresAt_1", key, ...options });
    },
    countDocuments: async () => 0,
    insertOne: async () => {
      inserts++;
    },
    findOne: async () => null,
    deleteOne: async () => {
      deletes++;
    },
  };
  return {
    db: { getName: () => database, getCollection: () => usage },
    usage,
    counts: () => ({ creates, inserts, deletes }),
    env: { OSMS_TARGET_DATABASE: database },
  };
}

test("verify fails closed on missing index without changing the database", async () => {
  const f = fixture();
  await assert.rejects(run(f.db, f.env).completion, /index is missing/);
  assert.equal(f.counts().creates, 0);
});
test("apply is idempotent and preserves unrelated indexes", async () => {
  const f = fixture([primary, { name: "unrelated", key: { windowStart: 1 } }]);
  const env = { ...f.env, OSMS_CHATBOT_INDEX_MODE: "apply" };
  await run(f.db, env).completion;
  await run(f.db, env).completion;
  const verified = run(f.db, f.env);
  await verified.completion;
  assert.equal(f.counts().creates, 1);
  assert.equal((await f.usage.getIndexes()).length, 3);
  assert.match(verified.output[0], /"expireAfterSeconds":0/);
});
test("wrong or missing explicit database and invalid mode fail before index access", async () => {
  const f = fixture();
  for (const env of [
    {},
    { OSMS_TARGET_DATABASE: "another" },
    { ...f.env, OSMS_CHATBOT_INDEX_MODE: "drop" },
  ]) {
    await assert.rejects(run(f.db, env).completion, /exit 1/);
  }
  assert.equal(f.counts().creates, 0);
});
test("incompatible or partial expiry indexes require manual migration", async () => {
  for (const bad of [undefined, 60, -1]) {
    const f = fixture([primary, { ...ttl, expireAfterSeconds: bad }]);
    await assert.rejects(
      run(f.db, { ...f.env, OSMS_CHATBOT_INDEX_MODE: "apply" }).completion,
      /incompatible/,
    );
    assert.equal(f.counts().creates, 0);
  }
  const partial = fixture([
    primary,
    { ...ttl, partialFilterExpression: { messageCount: 20 } },
  ]);
  await assert.rejects(run(partial.db, partial.env).completion, /incompatible/);
});
test("storage/permission errors do not print connection secrets", async () => {
  const f = fixture();
  f.usage.getIndexes = async () => {
    throw new Error("mongodb://private:secret@host");
  };
  const result = run(f.db, f.env);
  await assert.rejects(result.completion, /deployment permissions/);
  assert.ok(result.output.every((line) => !line.includes("secret")));
});
test("apply can create the missing collection but verify rejects missing namespace", async () => {
  const f = fixture();
  const original = f.usage.getIndexes;
  let absent = true;
  f.usage.getIndexes = async () => {
    if (absent) {
      absent = false;
      throw { code: 26 };
    }
    return original();
  };
  await run(f.db, { ...f.env, OSMS_CHATBOT_INDEX_MODE: "apply" }).completion;
  assert.equal(f.counts().creates, 1);
});
test("smoke refuses live database names and nonempty collections", async () => {
  const f = fixture([primary, ttl]);
  await assert.rejects(
    run(f.db, { ...f.env, OSMS_CHATBOT_INDEX_MODE: "smoke" }).completion,
    /isolated/,
  );
  const isolated = fixture([primary, ttl], "osms_ttl_smoke");
  isolated.usage.countDocuments = async () => 1;
  await assert.rejects(
    run(isolated.db, { ...isolated.env, OSMS_CHATBOT_INDEX_MODE: "smoke" })
      .completion,
    /empty isolated/,
  );
  assert.equal(isolated.counts().inserts, 0);
});
test("smoke uses only a synthetic record and cleans up on success", async () => {
  const f = fixture([primary, ttl], "osms_ttl_smoke");
  await run(f.db, { ...f.env, OSMS_CHATBOT_INDEX_MODE: "smoke" }).completion;
  assert.deepEqual(f.counts(), { creates: 0, inserts: 1, deletes: 1 });
});
test("smoke times out safely and still removes only its synthetic record", async () => {
  const f = fixture([primary, ttl], "osms_ttl_smoke");
  f.usage.findOne = async () => ({ _id: "synthetic-id" });
  let now = 0;
  class Clock extends Date {
    static now() {
      now += 100000;
      return now;
    }
  }
  await assert.rejects(
    run(f.db, { ...f.env, OSMS_CHATBOT_INDEX_MODE: "smoke" }, { Date: Clock })
      .completion,
    /180 seconds/,
  );
  assert.equal(f.counts().deletes, 1);
});
