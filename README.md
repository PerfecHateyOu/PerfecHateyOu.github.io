# Bill — portfolio

Personal site for Williams Morency Debe (Bill), GitHub [PerfecHateyOu](https://github.com/PerfecHateyOu). It is a static site meant for GitHub Pages at [https://perfechateyou.github.io/](https://perfechateyou.github.io/).

No build step. HTML, CSS, and JavaScript are served from the repository root.

## Add a project

Edit the `window.PROJECTS` array in [`js/projects.js`](js/projects.js). Append an object. The array order is the order on the page (hero index, project cards, and the short list in About).

The tech-stack section is generated from every project's `stack`, so you do not maintain a second list.

| Field | Required | What to put |
| --- | --- | --- |
| `id` | yes | Unique kebab-case. Becomes the card's anchor (`#your-id`). |
| `title` | yes | Name shown on the card. |
| `created` | yes | Display date, for example `October 2026`. |
| `blurb` | yes | One or two factual sentences. |
| `points` | yes | Array of short factual bullets. Use `[]` if you have none. |
| `tags` | no | Small labels such as `Public repo` or `v1.2`. |
| `stack` | yes | Array of `{ name, group }`. Groups used now: `Languages`, `Interface`, `Backend`, `Platform`. A new group name is shown automatically. |
| `accent` | no | `lime` (default), `amber`, `pink`, or `blue`. Color of the card's top rule. |
| `source` | no | `public` or `private`. Private hides nothing by itself; it only changes the label. Omit `repo` when the source must not be linked. |
| `image` | no | Path such as `assets/projects/my-shot.jpg`, or `null` for a generated placeholder. |
| `imageAlt` | when `image` is set | Describe the picture. Say so if it is an illustration rather than a screenshot. |
| `imageKind` | no | `capture` (default) or `illustration`. Changes the badge on the image. |
| `imagePosition` | no | CSS object-position, usually `top` or `center`. |
| `live` | no | Public URL, or `null`. |
| `repo` | no | Public repository URL, or `null`. Leave `null` for a private repo. |
| `note` | no | One sentence under the buttons, for example when there is no live URL. |

Put new screenshots in `assets/projects/`.

`assets/projects/wdiii-tech-vault.jpg` and `assets/projects/last-local.jpg` are screenshots of the live sites. `assets/projects/sca.svg` is an illustration, not a screenshot: Sound Core Adventure's README does not list a public URL.

## Preview locally

From the repository root:

```bash
python3 -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173). Root-relative links on the 404 page expect this kind of server, not a `file://` open of `index.html`.

## Enable GitHub Pages

This repository is the user site `PerfecHateyOu.github.io`. The pages are already at the root of `main`. Nothing has to be built.

1. On GitHub, open this repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to **`/ (root)`**.
5. Save.

After the deployment finishes, the site is at [https://perfechateyou.github.io/](https://perfechateyou.github.io/). The first publish often takes about a minute. A [`.nojekyll`](.nojekyll) file is in the root so Pages serves these files as-is and does not run Jekyll.

If Pages was previously set to **GitHub Actions**, switch **Source** to **Deploy from a branch** as above. This repo does not ship a workflow to build or deploy the site.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | Page structure, about copy, contact link |
| `404.html` | GitHub Pages 404 |
| `css/styles.css` | Layout, theme, motion |
| `js/projects.js` | Project data |
| `js/main.js` | Renders projects and the stack, nav, typing, grid |
| `assets/` | Avatar, favicon, project images |
