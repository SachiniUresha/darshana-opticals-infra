const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const script = fs.readFileSync(
  path.join(__dirname, "../../scripts/chatbot-usage-index.js"),
  "utf8",
);

function run(db, env, overrides = {}) {
  const output = [];
  const completion = vm.runInNewContext(script, {
    db,
    process: { env },
    print: (line) => output.push(line),
    quit: (code) => {
      throw new Error(`exit ${code}: ${output.at(-1)}`);
    },
    sleep: () => Promise.resolve(),
    ObjectId: () => "synthetic-id",
    Date,
    ...overrides,
  });
  return { completion, output };
}
module.exports = { run };
