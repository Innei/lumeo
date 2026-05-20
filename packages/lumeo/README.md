# lumeo

Image zoom and multi-image lightbox. A modern TypeScript fork of
[medium-zoom](https://github.com/francoischalifour/medium-zoom), extended with
album navigation, keyboard control, touch gestures, and a thumbnail strip.

- **Tiny, zero-dep.** Pure DOM API, no React/Vue lock-in.
- **Album-aware.** Attach a group of `<img>` and get prev/next, keyboard
  navigation, swipe gestures, and a thumbnail strip — all for free.
- **Themable via CSS variables.** Drop in your own tokens, switch dark mode by
  rebinding `--lumeo-overlay-bg`.
- **TypeScript-first.** Full types out of the box.

## Install

```bash
pnpm add lumeo
# or: npm i lumeo / yarn add lumeo
```

## Usage

```ts
import mediumZoom from 'lumeo'
import 'lumeo/style.css'

const zoom = mediumZoom()
zoom.attach('img[data-zoomable]')
```

The CSS export is required — vanilla-extract is zero-runtime, so the static
stylesheet must be linked once by the consuming application.

### Album mode

Pass a group of images and lumeo wires up navigation automatically:

```ts
const album = mediumZoom('.gallery img', {
  background: 'var(--lumeo-overlay-bg)',
})
```

Open any image and use:

- **← / →** to step through
- **Esc** to close
- **Swipe** on touch devices
- The **thumbnail strip** at the bottom

### Theming

The package declares static defaults on `:root`, which you can rebind in your
app's stylesheet — including under `.dark` for a dark-mode override:

```css
:root {
  --lumeo-overlay-bg: #ffffff;
  --lumeo-ink: rgba(0, 0, 0, 0.85);
  --lumeo-ink-subtle: rgba(0, 0, 0, 0.55);
  --lumeo-accent: #33a6b8;
  --lumeo-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
}

.dark {
  --lumeo-overlay-bg: #0b0b0d;
  --lumeo-ink: rgba(255, 255, 255, 0.92);
  --lumeo-ink-subtle: rgba(255, 255, 255, 0.55);
  --lumeo-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
}
```

> Load the package CSS **before** your overrides so cascade order favours your
> theme.

## API

`mediumZoom(selector?, options?) → Zoom`

Returns a `Zoom` instance with:

| Method | Description |
| --- | --- |
| `attach(...selectors)` | Bind images. |
| `detach(...selectors)` | Unbind. |
| `open({ target? })` | Open at a specific target. |
| `close()` | Close. |
| `toggle({ target? })` | Open or close. |
| `update(options)` | Patch options at runtime. |
| `clone(options?)` | Create a sibling instance with merged options. |
| `getImages()` / `getZoomedImage()` / `getOptions()` | Introspect. |
| `on(type, listener)` / `off(type, listener)` | Listen to `medium-zoom:*` events. |

### Events

Custom events dispatched on the active image:

- `medium-zoom:open` / `medium-zoom:opened`
- `medium-zoom:close` / `medium-zoom:closed`
- `medium-zoom:update`
- `medium-zoom:detach`

The `medium-zoom:` prefix is preserved for drop-in compatibility with the
original package.

## Credits

Built on top of François Chalifour's [medium-zoom](https://github.com/francoischalifour/medium-zoom).
See `NOTICE` for full attribution.

## License

MIT
