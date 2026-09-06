# Deploying

`.github/workflows/deploy.yml` builds the static export and publishes it to
GitHub Pages on every push to `main`.

Enable it once, under **Settings → Pages → Build and deployment**, with
**Source: GitHub Actions**. After that the workflow does the rest; the deployed
URL appears on the run and in the repository's Environments.

## The base path

This repository is named `OpenWAM-Official.github.io`, so Pages serves it at
the organisation root — `https://openwam-official.github.io/` — with no
sub-path. The machinery below still exists because a differently-named repo
would be served from `/<repo>/` instead. The workflow passes that prefix to the build as
`NEXT_PUBLIC_BASE_PATH`, which feeds both Next's own `basePath` and the
`asset()` helper in `src/lib/asset.ts` that every reference to a file in
`public/` goes through. Locally the variable is unset, so `npm run dev` and
`npm run build` serve from the root as before.

To check a subpath build without pushing:

```bash
NEXT_PUBLIC_BASE_PATH=/some-repo npm run build
```

## Custom domain

There is deliberately no `CNAME` file: an empty repository claims no custom
domain, which is what you want until there is one to point at.

To use your own, add `public/CNAME` containing just the hostname, e.g.

    openwam.org

and point that host's DNS at GitHub Pages. A custom domain serves from its
root, so drop the base path at the same time — set `NEXT_PUBLIC_BASE_PATH` to
an empty string in the workflow, or the prefix will be applied twice.
