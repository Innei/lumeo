# lumeo

> Image zoom and multi-image lightbox — a modern TypeScript fork of
> [medium-zoom](https://github.com/francoischalifour/medium-zoom), extended
> with album navigation, keyboard control, touch gestures, and a thumbnail
> strip.

<p align="center">
  <a href="https://www.npmjs.com/package/lumeo"><img alt="npm" src="https://img.shields.io/npm/v/lumeo?style=flat-square&color=33A6B8"></a>
  <a href="https://github.com/Innei/lumeo/actions/workflows/ci.yml"><img alt="ci" src="https://img.shields.io/github/actions/workflow/status/Innei/lumeo/ci.yml?style=flat-square&label=ci"></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/npm/l/lumeo?style=flat-square&color=111"></a>
</p>

```bash
pnpm add lumeo
```

```ts
import mediumZoom from 'lumeo'
import 'lumeo/style.css'

mediumZoom('img[data-zoomable]')
```

Full README and API: [`packages/lumeo/README.md`](./packages/lumeo/README.md).

## Repository layout

```
lumeo/
├── packages/
│   └── lumeo/        # the library (publishes to npm as `lumeo`)
└── apps/
    └── demo/         # Vite + React showcase
```

## Develop

```bash
pnpm install            # install everything

pnpm dev:lib            # watch-build the library
pnpm dev                # start the demo (Vite, http://localhost:5180)

pnpm test               # run library tests
pnpm typecheck          # typecheck all packages
pnpm build              # production library build
pnpm build:demo         # production demo build
```

## Release

`packages/lumeo/package.json` is the only package published to npm. To cut a
release:

```bash
# 1. bump packages/lumeo/package.json#version
# 2. commit + tag
git commit -am "release: v0.2.0"
git tag v0.2.0
git push --follow-tags
```

The `Publish` workflow in `.github/workflows/publish.yml` builds and tests the
library, then publishes with npm Trusted Publishing (OIDC). It uses a
GitHub-hosted runner, Node 24 and npm 11.21.0. No `NPM_TOKEN` secret is used;
npm generates provenance automatically for the public package and repository.

Before releasing, open the `lumeo` package's npm settings and configure a GitHub
Actions trusted publisher with these exact values:

| Field                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Package              | `lumeo`                                                |
| Organization or user | `Innei`                                                |
| Repository           | `lumeo`                                                |
| Workflow filename    | `publish.yml`                                          |
| Environment name     | Leave empty; the job does not use a GitHub environment |
| Allowed action       | Allow direct publishing with `npm publish`             |

The workflow filename is case-sensitive and must omit `.github/workflows/`.
The package's `repository.url` is `git+https://github.com/Innei/lumeo.git` and
its monorepo directory is `packages/lumeo`.

Tag pushes publish only when the tag exactly matches `v` plus the package
version. Manual runs default to `dry-run: true`, which checks the package
without uploading a release. To publish manually, select the matching version
tag and explicitly set `dry-run: false`.

A dry-run verifies packaging, not npm's OIDC authorization. The first actual
publish validates the trusted publisher. npm currently requires that first
publish within two days of creating the publisher, so configure it close to
the intended release. See the [npm trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/)
for setup and authentication requirements.

## Credits

Built on top of François Chalifour's
[medium-zoom](https://github.com/francoischalifour/medium-zoom). See
[`NOTICE`](./NOTICE) for full attribution.

## License

MIT
