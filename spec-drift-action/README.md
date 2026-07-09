# Cadmo spec-drift action

A reusable composite GitHub Action that runs [Cadmo](https://github.com/tiagotorres91/cadmo)'s
zero-dependency **spec-drift** guard against your pull request or push: if code changes but the
spec that documents it doesn't change in the same diff, the check flags it (DRIFT), and — for
specs you've stamped as reviewed — flags code that moved since the last review (SUSPECT).

The action ships in the Cadmo repo alongside `tools/spec-drift.mjs` and simply invokes that
script, so there is **nothing to install** and **no runtime dependencies** beyond Node.

## Usage

```yaml
name: spec-drift
on:
  pull_request:
  push:
    branches: [main]
jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0            # REQUIRED — the check diffs against a base ref
      - uses: tiagotorres91/cadmo/spec-drift-action@v0.4.0
```

That's the whole thing. The action derives the base ref the same way Cadmo's own workflow does
(`origin/<base_ref>` on `pull_request`, the push before-sha with a `HEAD~1` fallback on `push`),
sets up Node, and runs the drift check.

### fetch-depth: 0 is required

The guard works by diffing your branch against a base ref (`git diff <base>...HEAD`). A shallow
checkout (the default `fetch-depth: 1`) has no history to diff against, so the check fails with an
operational error. Always check out with `fetch-depth: 0` **before** this step.

## Inputs

| Input          | Default  | Description |
|----------------|----------|-------------|
| `base`         | *(derived)* | Git ref to diff against. Leave empty to derive it like Cadmo's workflow: `origin/<base_ref>` on `pull_request`; the push before-sha (falling back to `HEAD~1`) on `push`. Set it explicitly (e.g. `origin/main`) to override. |
| `fail-level`   | `warn`   | `warn` logs a workflow annotation but keeps the job green — the default, matching a client's continuous-delivery flow. `fail` exits non-zero when a spec drifts. Operational errors (bad base ref, shallow checkout) **always** fail regardless of this setting. |
| `node-version` | `20`     | Node.js version used to run the drift check. |

### Enforcing instead of warning

```yaml
      - uses: tiagotorres91/cadmo/spec-drift-action@v0.4.0
        with:
          fail-level: fail
```

### Pinning a base ref

```yaml
      - uses: tiagotorres91/cadmo/spec-drift-action@v0.4.0
        with:
          base: origin/main
```

## How the check works

See [`tools/spec-drift.mjs`](../tools/spec-drift.mjs) for the full contract. In short: any `.md`
file with a `watches:` list in its front matter is a spec; if a watched file changes in the diff
and the spec doesn't, that's DRIFT. Specs that also carry a `reviewed:` hash get the stricter
SUSPECT check. The escape hatch is audited, not silent — see the script header.

## License

Part of the Cadmo project. See the repository [LICENSE](../LICENSE).
