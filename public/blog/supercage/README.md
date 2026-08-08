# supercage demos (site-media)

Upload into the **site-media** bucket with these exact object keys:

## Images — `images/blog/supercage/`
- `phase1-whoami.png`
- `phase1-desktop.png`
- `phase2-ui.png`
- `phase3-root.png`
- `phase3-desktop-safe.png`

## Videos — `videos/blog/supercage/`
- `phase4-success.mp4`
- `phase4-block.mp4`

Served via `/api/media/...` (see `mediaUrl()` in the note page).

Optional local staging (then `npm run upload:media`):

```text
public/assets/images/blog/supercage/<file>
public/assets/videos/blog/supercage/<file>
```
