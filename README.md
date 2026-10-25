# Kids Play

A home-built drawing app for Carrie (5) and Covey (2). It's a vanilla HTML/CSS/JS web app that you add to the iPad home screen. It has no framework, no build step, no server code and no accounts, and it works offline after the first open. The full plan is in [PLAN.md](PLAN.md).

## Run it

```bash
python3 -m http.server 8123
```

Open `http://localhost:8123` on the Mac. To try it on the iPad, use `http://<your-mac-ip>:8123` on the same Wi-Fi (`ipconfig getifaddr en0` gives the IP).

Note: the iPad only turns on offline mode for **https** sites (or localhost), so plain Wi-Fi testing won't work offline.

## Live site

The app is published on GitHub Pages from the `main` branch of `tzong-code/kids-play`: https://tzong-code.github.io/kids-play/

To install it on the iPad:

1. Open that URL in Safari.
2. Tap Share › Add to Home Screen.
3. Open it once from the home screen while on Wi-Fi.

`PLAN.md` is kept out of the repo (see `.gitignore`) because it has the girls' full names.

## Releasing an update

1. Change the code.
2. Bump `CACHE` in `sw.js` (for example `kids-play-v2`) and `VERSION` in `js/app.js`.
3. If you added files, add them to `FILES` in `sw.js`.
4. Commit and `git push`. GitHub Pages republishes within a minute or two.
5. On the iPad, open the app once on Wi-Fi, then close it and reopen it.

## Where things live

| File | What it does |
| --- | --- |
| `js/app.js` | Profile picker, each girl's home, parent gate (hold ⚙️ 2 s, then a sum), parent settings |
| `js/profiles.js` | Age presets: palette, brushes, tools, page set, stamps. Add a child or bump an age here |
| `js/canvas.js` | Drawing engine: brushes, pressure, palm rejection, flood fill, stamps, undo/redo, export |
| `js/storage.js` | IndexedDB: drawings (PNG blobs) and settings |
| `js/art.js` | Hand-drawn SVG art: the mascots (Carrie's white cat, Covey's mermaid), tool icons, home-tile pictures, castle and ocean scenes |
| `js/sound.js` | Synthesised sounds (Web Audio) and spoken labels (built-in voice), with no audio files |
| `js/ui.js` | DOM helpers: hold-to-activate, two-tap confirm, share to Photos |
| `js/registry.js` | The list of games shown on the home screen |
| `games/draw/` | Free draw (`index.js`), colouring pages (`colour.js`), the shared editor (`editor.js`) |
| `games/gallery/` | Saved drawings |
| `assets/pages/pages.js` | 60 colouring pages as inline SVG (20 toddler, 40 age-5) |
| `assets/art/stickers.js` | 54 cartoon stickers (12 mermaid, 12 princess, 30 shared), used as stamps and avatar choices |
| `assets/fonts/` | Fredoka (rounded font, SIL Open Font License), bundled so it works offline |

## Look and feel

The "Chunky Toy" style (thick ink outlines, solid base shadows, glossy highlights, springy presses) was designed in Superdesign. Its design system lives in `.superdesign/design-system.md`, which is kept out of git. The project's drafts are on the Superdesign canvas. To change a colour, edit the tokens at the top of `css/app.css`. Each tool button's colour comes from its `data-tool` attribute.

## Adding a game

1. Create `games/<id>/index.js` that exports `{ id, name, icon, ages, mount(container, profile, app, params) }`.
   - `mount` builds the screen inside `container` and can return a cleanup function.
   - `app` gives you `home()`, `open(id, params)`, `sound`, `speak(text)`, `storage`, `exitButton()` (the hold-to-leave mascot) and `label(text)` (empty for the toddler).
2. Import it in `js/registry.js` and add it to `GAMES`.
3. Add its files to `FILES` in `sw.js` and bump `CACHE`.

## Grown-up gestures

- **Leave a child's world:** hold the mascot in the top-left corner for 2 seconds.
- **Settings:** on the picker, hold ⚙️ for 2 seconds, then answer the sum. From there you can change mascots and delete drawings.
- **Save one of Covey's drawings to Photos:** in her gallery, hold a picture for 2 seconds.
- **Keep Covey inside the app:** turn on Guided Access (Settings › Accessibility › Guided Access), then triple-click the side button while the app is open.
