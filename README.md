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

The `Publish` workflow runs on tag push, builds, tests, and publishes to npm
with provenance. Configure an `NPM_TOKEN` repo secret first.

## Credits

Built on top of François Chalifour's
[medium-zoom](https://github.com/francoischalifour/medium-zoom). See
[`NOTICE`](./NOTICE) for full attribution.

## License

MIT
