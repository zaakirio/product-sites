# product-sites

Static landing pages for the foundry product family, served at `<product>.zaakir.io`, plus the family map at `foundry.zaakir.io`.
One nginx image serves the Foundry map and all seven product sites, routed by Host header (`nginx.conf`), plus `vellichor.ikarza.com`.
A push to `main` runs `.woodpecker.yml`, which builds and pushes `ghcr.io/zaakirio/product-sites:<commit-sha>`.
Tags are commit-SHA only, with no `latest`. Argo CD Image Updater watches `ghcr.io/zaakirio/product-sites` for 40-hex tags (`newest-build`), commits the new SHA to `ikarza-gitops-infra/apps/product-sites/.argocd-source-product-sites.yaml`, and ArgoCD rolls it out, so a push deploys itself once the image is published.
Every number on these pages comes from the product's real README or eval artifacts; if a page and its repo disagree, the repo wins.

## Design system

`shared/site.css` is the family spine: breadcrumb, section rhythm, feature ledger, terminal frames, footer.
Each site vendors a copy in its `assets/`.

`shared/scene.css` plus `shared/scene.js` are the scene layer, loaded after `site.css` by the sites that have a bespoke hero.
Every product owns one photographic scene, and the scenes are stations of the same forge in process order, so no two pages share a background while the suite still reads as one fleet:

```
bellows   forced air over an ember bed
crucible  molten convection, seen from above
ingot     the pour into a mould, cooling bands
anvil     sparks off struck iron
quench    hot steel entering water
assay     the fire-assay cupel, gold bead separating
flux      one filament wetting a joint
foundry   the whole floor, six stations at different temperatures
```

Scenes live at `<site>/assets/scene.jpg` (landscape) and `scene-tall.jpg` (portrait, for narrow viewports), generated with `gpt-image-2` as text-free plates.
`scene.js` uploads the plate as a WebGL texture and animates it: heat-shimmer UV warp, ember flicker, flow down a pour, additive spark particles.
Every effect is masked by the plate's own luminance, so only what is actually hot moves and cold iron stays still. That masking is what keeps it reading as real footage rather than a filter.

Half-resolution render, paused when hidden or scrolled out of view, one static frame under `prefers-reduced-motion`, no dependencies.
If WebGL is missing or the texture fails, `scene.js` removes the canvas and the same plate is already showing as a CSS background.

### Adding a scene to a site

1. Drop `scene.jpg` and `scene-tall.jpg` into `<site>/assets/`.
2. Link `assets/scene.css` after `assets/site.css`, and `assets/scene.js` deferred before `</body>`.
3. Declare the plate **in the page's own `<style>`**, not in `scene.css`:
   ```css
   .hero.scene { background-image: url("assets/scene.jpg"); }
   @media (max-width: 720px) { .hero.scene { background-image: url("assets/scene-tall.jpg"); } }
   ```
   A relative `url()` inside a custom property resolves against `scene.css`'s own directory, silently producing `assets/assets/scene.jpg`. Declaring it in the page keeps the path document-relative.
4. Add `class="hero scene"` and, as its first child,
   `<canvas class="scene" data-mode="<product>" data-wide="assets/scene.jpg" data-tall="assets/scene-tall.jpg" aria-hidden="true"></canvas>`.
   `data-mode` selects the shader: `crucible`, `ingot`, `anvil`, or `assay`.
5. Set `data-subject="left"` on `.hero.scene` only when the plate's bright subject sits on the left, which flips the legibility scrim. Check it against a screenshot: the gradient must shield the copy, never the photograph.

Quench predates this layer and keeps its own `quench.css` plus a fully procedural WebGL water/ember scene (`quench-bg.js`), same family voice.

## Status

Rebuilt on the scene layer, both orientations: `anvil`, `crucible`, `ingot`, `assay`.
Still on the original datasheet hero: `bellows`, `flux`, `foundry`. `quench` has its own bespoke build.

All eight now carry `canonical`, `og:*`, `twitter:card`, a `favicon.svg` and a 1200x630 `og.jpg`
captured from the site's own live hero, so shared links render a real preview card.

Two known defects in the sites that have not been redesigned yet:
`foundry` collapses badly below ~720px (the orbit labels clip off-canvas and the product nav
disappears entirely, leaving no way to reach a product), and its cool blue palette does not match
the family's warm charcoal and ember.
`flux` wraps its `$0.0684 / $0.0064` stats cell onto two lines at 1440px, knocking that row out of
vertical alignment.
