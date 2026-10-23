---
title: Version Upgrades and Database Migrations
---

# Version Upgrades and Database Migrations

App images and database structure are two separate tracks: changing `DC3_IMAGE_TAG` pulls new images but never touches the database. This page covers the second track — how the schema moves between versions, and how to deal with the most common post-upgrade startup failure (schema fingerprint mismatch).

> You are here: a running stack needs to move to a newer version. Images and deployment modes are covered in [Deployment Modes and Image Registries](./usage) and [Production Deployment](./deployment); this page is about the upgrade itself.

## Two mechanisms to understand first

### initdb runs exactly once, on an empty database

The first time the db stack comes up, the postgres entrypoint runs the scripts in `dc3/dependencies/postgres/initdb/` and creates every schema and table (see the seed-data table in [Deployment Modes and Image Registries](./usage)). Those scripts never run again — the volume is no longer empty, and neither restarts nor image changes trigger them. An existing database therefore does not pick up new-table structure automatically.

### Schema changes go through migrations, run by hand

The numbered SQL files under `dc3/dependencies/postgres/migrations/` are the schema changes between versions. There is **no automatic migration runner** — you apply them yourself:

```bash
# from the iot-dc3/ checkout, one file at a time (numbering is the order)
docker exec -i dc3-postgres psql -U dc3 -d dc3 \
  -v ON_ERROR_STOP=1 < dc3/dependencies/postgres/migrations/01-menu-icon-backfill.sql
```

Every file is idempotent (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, or old-value guards), so re-running is safe; running them out of order is pointless. Each file's header comment says what it does and whether it rewrites the fingerprint.

## The schema fingerprint gate

On startup, every center (auth / manager / data / agentic / single) compares the stored `public.dc3_schema_fingerprint.ddl_hash` against the fingerprint it expects, and **refuses to start** on a mismatch — a startup exception, not just a readiness flag. The expected value is the hash of the initdb DDL carried by the image (injected via `DC3_SCHEMA_FINGERPRINT`).

The point of the gate: "pulled new images, forgot the migration" becomes a clear startup error instead of weird runtime behavior.

| Error | Meaning | Fix |
|--------|---------|-----|
| `schema fingerprint mismatch: expected …, actual …` | the database DDL version doesn't match the image | old database: apply the missing migrations in order; database newer than image: you pulled the tag down — raise it back |
| `dc3_schema_fingerprint row is missing` | the database wasn't built by initdb, or the row was deleted | check whether the volume was tampered with; if so, restore from backup |
| still mismatched after running migrations | the DDL-changing migration didn't write the fingerprint back | check whether the migration's fingerprint-rewrite section actually ran (02/03/04 embed it) |

Migrations that change DDL (e.g. `03-agentic-check-columns.sql`) rewrite the stored fingerprint in the same transaction; data-only migrations (e.g. `05-agentic-permission-resources.sql`) deliberately leave it alone.

## The standard upgrade path

1. **Back up.** pg_dump / pg_dumpall commands and schema scope are in the [FAQ](../community/faq).
2. **Check which migrations ship in this version.** List the files under the upstream
   `dc3/dependencies/postgres/migrations/` numbered above the last one you applied — the directory itself is the only
   index there is; don't count on digging them out of the changelog (a migration doesn't always get its own entry in
   the release notes).
3. **Apply the migrations** in numbering order (command above). Migrations first, then start the centers, is the least roundabout order — but the reverse also works: centers refuse to start on a fingerprint mismatch, and a restart after the migrations clears it.
4. **Switch the image tag.** Set `DC3_IMAGE_TAG` to the target version in the root `.env` and bring the stack back with `make up STACK=app`.
5. **Verify.** `make ps STACK=app` until every center is ready (ready means the fingerprint check passed), then log into the console and confirm point values are still there.

::: warning Don't skip the backup
Migrations are idempotent, but ALTERs have no rollback segment. On a large database, rehearse a backup restore before touching production.
:::

## FAQ

- **After an upgrade a center won't start and logs schema fingerprint mismatch?** See the gate table above — nine times out of ten, a migration was skipped.
- **The initdb scripts changed; should the old database re-run initdb?** No. initdb serves empty databases only; everything on an existing database goes through migrations. Even a comment-only initdb edit moves the hash, and a resync migration (e.g. `02-schema-fingerprint-resync.sql`) follows it.
- **What is the compose default for `DC3_SCHEMA_FINGERPRINT`?** The SHA-256 of the current initdb set. The upstream repo's `make validate-schema-fingerprint` keeps it in sync across 8 distribution points; if you never edit initdb, you never touch it.
- **Do driver services check the fingerprint?** No. The check lives in the centers that connect to the database; drivers don't connect.

## Further reading

- [Changelog](../development/changelog) — commits per version; search `migration` to find schema changes
- [Database Schema Reference](../development/schema-reference) — a one-page inventory of every schema and table
- [FAQ](../community/faq) — backup commands and restore scope
