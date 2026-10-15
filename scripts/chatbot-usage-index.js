// Run with mongosh --file. Uses the selected database, never an implicit fallback.
async function checkChatbotUsageIndex() {
  function fail(message) {
    const error = new Error(message);
    error.deploymentCheck = true;
    throw error;
  }

  const expected = process.env.OSMS_TARGET_DATABASE;
  const mode = process.env.OSMS_CHATBOT_INDEX_MODE || "verify";
  if (!expected || db.getName() !== expected) {
    fail(
      "OSMS_TARGET_DATABASE must exactly match the database selected by the connection URI.",
    );
  }
  if (!["verify", "apply", "smoke"].includes(mode))
    fail("Index mode must be verify, apply or smoke.");
  if (mode === "smoke" && !expected.endsWith("_ttl_smoke")) {
    fail("Smoke mode requires an isolated database name ending in _ttl_smoke.");
  }

  const usage = db.getCollection("chatbotusages");
  let indexes;
  try {
    indexes = await usage.getIndexes();
  } catch (error) {
    if (error.code !== 26) throw error;
    indexes = [];
  }
  const expiryKey = (index) =>
    Object.keys(index.key).length === 1 && index.key.expiresAt === 1;
  const validTTL = (index) =>
    expiryKey(index) &&
    index.expireAfterSeconds !== undefined &&
    Number(index.expireAfterSeconds) === 0 &&
    !index.partialFilterExpression &&
    !index.unique;
  if (indexes.some((index) => expiryKey(index) && !validTTL(index))) {
    fail(
      "An incompatible expiresAt index exists. Arrange a reviewed migration; no index was dropped.",
    );
  }
  if (!indexes.some(validTTL)) {
    if (mode === "verify")
      fail(
        "Required expiresAt TTL index is missing. Run the approved apply step before rollout.",
      );
    await usage.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  }
  indexes = await usage.getIndexes();
  const ttl = indexes.find(validTTL);
  const primary = indexes.find(
    (index) => Object.keys(index.key).length === 1 && index.key._id === 1,
  );
  if (!ttl || !primary)
    fail("TTL or unique Customer _id index verification failed.");
  print(
    JSON.stringify({
      database: expected,
      collection: "chatbotusages",
      index: ttl.name,
      key: ttl.key,
      expireAfterSeconds: Number(ttl.expireAfterSeconds),
      customerKey: primary.key,
    }),
  );

  if (mode !== "smoke") return;
  if ((await usage.countDocuments({})) !== 0)
    fail("Smoke mode requires an empty isolated usage collection.");
  const id = ObjectId();
  try {
    await usage.insertOne({
      _id: id,
      windowStart: new Date(Date.now() - 1860000),
      expiresAt: new Date(Date.now() - 60000),
      messageCount: 2,
    });
    const deadline = Date.now() + 180000;
    while (await usage.findOne({ _id: id })) {
      if (Date.now() >= deadline)
        fail(
          "Expired synthetic usage was not removed within 180 seconds; inspect TTL operation before rollout.",
        );
      await sleep(1000);
    }
    print("Expired synthetic usage was removed by MongoDB TTL cleanup.");
  } finally {
    // Remove only this synthetic record on failure; never drop a collection/database.
    await usage.deleteOne({ _id: id });
  }
}

checkChatbotUsageIndex().catch((error) => {
  print(
    error.deploymentCheck
      ? error.message
      : "Chatbot TTL check failed. Verify database availability, index definition and deployment permissions.",
  );
  quit(1);
});
