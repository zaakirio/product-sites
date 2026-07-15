FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY foundry  /srv/sites/foundry
COPY anvil    /srv/sites/anvil
COPY quench   /srv/sites/quench
COPY assay    /srv/sites/assay
COPY bellows  /srv/sites/bellows
COPY ingot    /srv/sites/ingot
COPY crucible /srv/sites/crucible
COPY flux     /srv/sites/flux
COPY vellichor /srv/sites/vellichor
