# fdgl

To install dependencies:

```bash
bun install
```

To run individual projects (such as the server) in development mode (locally):

```bash
cd apps/server
bun run dev
```

## Clientside handler outline

- Gets updates on reports and revocations through `/reports` and filtering by `?updatedSince`
  - Takes an action if the player is not banned yet
  - Untakes an action if a revocation comes in and the player has no actions against them
  - Basically a "diffing tool" -> give before and after, result the actions that should be
  	taken and actions that should be undone
- Various database adapters (namely kysely and JSON "database" eventually)
	that can be dropped-in as replacement data stores

A todolist outline for the project

- [ ] Authentication
- [ ] Community management
- [ ] Figuring out the community configs? Do we store them in the backend or where?
- [ ] Outline for a clientside handler
