# product-sites

Static landing pages for the foundry product family, served at `<product>.zaakir.io`.
One nginx image serves all eight sites, routed by Host header (`nginx.conf`).
Built to `ghcr.io/zaakirio/product-sites` by the GitHub Actions workflow on push; deployed by ArgoCD from `ikarza-gitops-infra/apps/product-sites`.
Design system in `shared/site.css` (each site vendors a copy in its `assets/`).
Every number on these pages comes from the product's real README or eval artifacts; if a page and its repo disagree, the repo wins.
