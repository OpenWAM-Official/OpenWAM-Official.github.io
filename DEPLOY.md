# Deploying

`.github/workflows/deploy.yml` builds the static export and publishes it to
GitHub Pages on every push to `main`. It will fail at the deploy step until
Pages is enabled for the repository with **Source: GitHub Actions**.

## Custom domain

There is deliberately no `CNAME` file here: an empty repository claims no
custom domain, which is what you want until there is one to point at.

To use a domain of your own, add `public/CNAME` containing just the hostname,
e.g.

    openwam.org

and point that host's DNS at GitHub Pages. Without the file the site serves from
`https://<user>.github.io/<repo>/`.
