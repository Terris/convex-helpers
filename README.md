# convex-helpers

A collection of useful code to complement the official packages.

## `convex-helpers` npm package

In the [packages](./packages/) directory there's the [convex-helpers](./packages/convex-helpers/)
directory, so you can `npm install convex-helpers@latest`.

It doesn't have all of the below features, but the ones it has can be used directly,
rather than copying the code from this repo.

See the [README](./packages/convex-helpers/README.md) for more details on:

1. Customizing Functions (customQuery, customMutation, customAction).
1. Relationship utilities to navigate database references.
1. Row-Level Security (to be used with Custom Functions).
1. Zod validation for function arguments and schemas.

## Server-Persisted Session Data

See the [guide on Stack](https://stack.convex.dev/sessions-wrappers-as-middleware) for tips on how to set up and use Sessions.

To use sessions, you'll need the files:

- [withSession.ts](./convex/lib/withSession.ts) on the server-side to give you function wrappers like `mutation(withSession(...))`.
- [sessions.ts](./convex/sessions.ts) on the server-side as a place to write your custom session creation logic.
- [useServerSession.ts](./src/hooks/useServerSession.ts) on the client-side to give you hooks like `useSessionMutation(...)`.
- You'll need to define a table in your [`convex/schema.ts`](./convex/schema.ts) for whatever your session data looks like. Here we just use `s.any()`.

## Authentication: withUser

See the [Stack post on withUser](https://stack.convex.dev/wrappers-as-middleware-authentication)

Use the [withUser](./convex/lib/withUser.ts) wrappers in your functions to easily look up a user.
You'll need to add an entry in your schema similar to [convex/schema.ts](./convex/schema.ts).

## Migrations: Data mutations

See the [Stack post on migrations](https://stack.convex.dev/migrating-data-with-mutations)
and the [migration primer Stack post](https://stack.convex.dev/intro-to-migrations).

Use the [migration](./convex/lib/migrations.ts) wrapper to define a function to
run over a given table.
It generates an internalMutation to migrate a batch of documents.

Run the mutation to test it out, then run it over the whole table with the
[runMigration](./convex/lib/migrations.ts) action.

## HTTP Endpoints: Using Hono for advanced functionality

See the [guide on Stack](https://stack.convex.dev/hono-with-convex) for tips on using Hono for HTTP endpoints.

To use Hono, you'll need the file [honoWithConvex.ts](./convex/lib/honoWithConvex.ts).

## Throttling client-side requests by Single-Flighting

See the [Stack post on single-flighting](https://stack.convex.dev/throttling-requests-by-single-flighting) for info on a technique to limit client requests.

You'll need the [useSingleFlight.ts](./src/hooks/useSingleFlight.ts) file, or [useLatestValue.ts](./src/hooks/useLatestValue.ts) utilities.

## Stable query results via useStableQuery

If you're fine getting stale results from queries when parameters change, check out the [Stack post on useStableQuery](https://stack.convex.dev/help-my-app-is-overreacting).

You'll need the [useStableQuery.ts](./src/hooks/useStableQuery.ts) file.

## Presence

See the [Stack post on implementing presence](https://stack.convex.dev/presence-with-convex) for details on how to implement presence in your app.

Related files:

- [presence.ts](./convex/presence.ts) for server-side presence functions. Intended to be modified for your application.
- [usePresence.ts](./src/hooks/usePresence.ts) for client-side React hooks. Modify to match your server API.
- (optional)[useTypingIndicator.ts](./src/hooks/useTypingIndicator.ts) for specifically doing typing indicator presence.
- (optional)[Facepile.tsx](./src/components/Facepile.tsx) for showing a facepile based on presence data. Intended to be used as an example to extend.
