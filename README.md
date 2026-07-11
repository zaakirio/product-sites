# product-sites

Static landing pages for the foundry product family, served at `<product>.zaakir.io`, plus the family map at `foundry.zaakir.io`.
One nginx image serves the Foundry map and all seven product sites, routed by Host header (`nginx.conf`).
Built to `ghcr.io/zaakirio/product-sites` by the GitHub Actions workflow on push; deployed by ArgoCD from `ikarza-gitops-infra/apps/product-sites`.
Design system in `shared/site.css` (each site vendors a copy in its `assets/`).
Quench departs deliberately: its own `quench.css` plus a WebGL water/ember scene (`quench-bg.js`), same family voice.
Every number on these pages comes from the product's real README or eval artifacts; if a page and its repo disagree, the repo wins.
