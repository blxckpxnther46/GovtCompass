# TODO - Monorepo setup for GovtCompass

- [ ] Decide monorepo approach: npm workspaces (recommended)
- [ ] Update root package.json to use workspaces and unify tooling scripts
- [ ] Ensure `concurrently` is only needed at root (keep as root devDependency)
- [ ] Update/verify client/package.json and server/package.json scripts remain compatible
- [ ] Remove/ignore existing root package-lock/client/server lockfiles (or keep but document)
- [ ] Run clean install using root: `npm install`
- [ ] Test dev workflow: `npm run dev` (should start both client + server)
- [ ] Document final commands in README.md (or add monorepo section)

