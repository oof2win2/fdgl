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

- [ ] build core+backend interoperable auth system
- [ ] core: add processing of notifs from a R2 queue about uploaded files
- [ ] core: add merging of communities into one
- [ ] add a notif type for merged communities + categories
- [ ] add a notif for deleted communities + categories
- [ ] core?: add caching of notifs for the past ~30m with a DO
- [ ] build the clientside handler
- [ ] build the community discord bot