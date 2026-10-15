# Chatbot usage TTL rollout checklist (infra #7)

ADR-010 and backend#77 reserve 20 messages (ten exchanges) per fixed 30-minute
Customer window. `chatbotusages` stores only the Customer `_id`, `windowStart`,
`expiresAt` and `messageCount`. Conversation text, provider payloads and tokens
must never be added to this collection or deployment evidence.

Logical window expiry is enforced by the backend using database time. Physical
deletion is asynchronous and may lag expiry; a cleanup delay must never prevent
logical renewal. The backend real-endpoint tests cover rollover independently of
TTL, including concurrent requests and old in-flight replies.

## Provision and verify each target environment

The operator must complete these steps in **both staging and production** before
rollout. No real target-environment deployment is claimed by this PR.

1. Confirm the environment and intended database name against the deployment
   inventory. Supply `MONGODB_URI` from deployment secrets with that database in
   the URI. Export `OSMS_TARGET_DATABASE` with the exact expected database name.
   The script rejects a missing name or a mismatch; it never falls back to `test`
   or selects another database silently. Do not paste the URI into issue evidence.
2. Use a dedicated provisioning job/account with collection/index creation and
   index-inspection privileges. The application runtime account need not gain
   DDL privileges. Deployments with `autoIndex` disabled still run this step.
3. Provision the single required index, then verify in a separate read-only mode:

   ```sh
   export OSMS_CHATBOT_INDEX_MODE=apply
   mongosh "$MONGODB_URI" --quiet --file scripts/chatbot-usage-index.js
   export OSMS_CHATBOT_INDEX_MODE=verify
   mongosh "$MONGODB_URI" --quiet --file scripts/chatbot-usage-index.js
   ```

   Run from the infra repository with `mongosh` installed. Inject secrets through
   the deployment runner and disable shell tracing. Verification is the default
   mode; apply is explicitly opt-in. An existing matching index is left intact;
   unrelated indexes are preserved. Any nonzero exit blocks rollout.

4. Confirm the emitted definition has exactly `{ "expiresAt": 1 }`,
   `expireAfterSeconds: 0`, no partial filter and the Customer `_id` index. If an
   incompatible index exists, arrange a reviewed migration; do not use
   `syncIndexes()`, automatic index drops or an unreviewed collection rebuild.
5. Attach environment, deployment commit, UTC verification time and redacted
   emitted index definition to the deployment record. Never attach Customer
   records, messages, credentials or tokens. A successful local/CI check is not a
   substitute for this per-environment evidence.

For Docker Compose, `chatbot-usage-index` performs apply/verify before the backend
starts. Review its exit status with `docker compose ps -a chatbot-usage-index`.
After an existing deployment is upgraded, run the one-shot job again and recreate
the backend under the normal rollout procedure; do not assume a previous
successful container run provisioned the new version's database. The local
Compose configuration uses the same configured URI; managed deployments should
inject their dedicated index-management credential into this one-shot job.

## Physical TTL smoke test

Use a **separate empty database** whose name ends in `_ttl_smoke`, with the same
MongoDB version/TTL configuration as the target. Never use a live Customer
database. Set the URI and `OSMS_TARGET_DATABASE` to that isolated database, then:

```sh
export OSMS_CHATBOT_INDEX_MODE=smoke
mongosh "$MONGODB_URI" --quiet --file scripts/chatbot-usage-index.js
```

This provisions/verifies the index, refuses a nonempty usage collection, inserts
one synthetic ObjectId/timestamps/count record, and waits up to 180 seconds for
MongoDB TTL to delete it. No conversation text or Customer account is created.
On failure it cleans up only its synthetic record; it never drops a collection
or database. The polling deadline bounds the test and does not promise immediate
physical deletion at `expiresAt`. Record a successful result in the deployment
evidence. On timeout, investigate TTL configuration/load before rollout.

## Customer deletion

Normal Mongoose Customer deletion hooks remove matching usage records. Raw driver,
shell and bulk deletion bypass those hooks. An administrative deletion procedure
must capture the authorized exact Customer IDs and remove the corresponding
`chatbotusages._id` records as part of the same reviewed transaction, with the
existing Customer deletion and dependent-record policy. Verify no matching usage
records remain without copying account data into logs. This index script neither
deletes real Customers nor performs an unbounded orphan cleanup.

## Automated validation

`node --test tests/chatbot-usage-index.test.cjs` checks target/mode guards, safe
errors, idempotent creation, preservation of unrelated indexes, incompatible
definitions, and synthetic smoke cleanup/timeout. GitHub Actions also runs the
actual mongosh script against MongoDB 8.0, including physical TTL cleanup, and
validates Compose configuration. No external Customer database is used by CI.

References: [infra#7](https://github.com/darshana-opticals-osms/infra/issues/7),
[backend#78](https://github.com/darshana-opticals-osms/backend/pull/78),
[ADR amendment](https://github.com/darshana-opticals-osms/documents/pull/37),
[frontend#52](https://github.com/darshana-opticals-osms/frontend/issues/52).
