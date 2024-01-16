import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAll,
  getAllOrThrow,
  getOneFrom,
  getOneFromOrThrow,
  getManyFrom,
  getManyVia,
  getManyViaOrThrow,
} from "convex-helpers/server/relationships";
import { asyncMap } from "convex-helpers";

export const relationshipTest = mutation({
  args: {},
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: "test",
      tokenIdentifier: "test123",
    });
    await ctx.db.insert("users", { name: "test2", tokenIdentifier: "test456" });
    const user2 = await getOneFromOrThrow(
      ctx.db,
      "users",
      "tokenIdentifier",
      "test456"
    );
    const userIds = [userId, user2._id];

    const sessionId = await ctx.db.insert("sessions", {
      user: userId,
      room: "test",
      updated: 0,
      data: {},
    });
    const sessionId2 = await ctx.db.insert("sessions", {
      user: userId,
      room: "test",
      updated: 0,
      data: {},
    });

    await ctx.db.insert("join_table_example", {
      userId,
      sessionId: sessionId2,
    });
    await ctx.db.insert("join_table_example", {
      userId,
      sessionId,
    });
    await ctx.db.insert("join_table_example", {
      userId: user2._id,
      sessionId,
    });
    const edges = await getManyFrom(
      ctx.db,
      "join_table_example",
      "userId",
      userId
    );
    assertLength(edges, 2);
    const sessions = await getManyVia(
      ctx.db,
      "join_table_example",
      "sessionId",
      "userId",
      userId
    );
    assertLength(sessions, 2);
    const sessions2 = await getManyViaOrThrow(
      ctx.db,
      "join_table_example",
      "sessionId",
      "userId",
      user2._id
    );
    assertLength(sessions2, 1);
    // const userSessions = await ctx.db.query("join_table_example").collect();
    // const userIds = userSessions.map((edge) => edge.userId);
    (await getAllOrThrow(ctx.db, userIds)).map(assertNotNull);

    // Now let's delete one and see if everything behaves as we expect
    await ctx.db.delete(user2._id);
    assertNull(await getOneFrom(ctx.db, "users", "tokenIdentifier", "test456"));
    assertHasNull(await getAll(ctx.db, userIds));
    try {
      await getAllOrThrow(ctx.db, userIds);
    } catch {
      console.log("Successfully caught missing userId");
    }

    await ctx.db.delete(sessionId2);
    assertHasNull(
      await getManyVia(
        ctx.db,
        "join_table_example",
        "sessionId",
        "userId",
        userId
      )
    );
    try {
      await getManyViaOrThrow(
        ctx.db,
        "join_table_example",
        "sessionId",
        "userId",
        userId
      );
    } catch {
      console.log("Successfully caught missing sessionId");
    }
    await asyncMap(edges, (edge) => ctx.db.delete(edge._id));
    await asyncMap(
      await getManyFrom(ctx.db, "join_table_example", "userId", user2._id),
      (edge) => ctx.db.delete(edge._id)
    );
    await ctx.db.delete(sessionId);

    // Testing custom index names
    const presenceId = await ctx.db.insert("presence", {
      user: userId,
      room: "",
      updated: 0,
      data: {},
    });
    assertNotNull(
      (await getOneFromOrThrow(ctx.db, "presence", "user_room", userId, "user"))
        .user
    );
    assertNotNull(
      await getOneFrom(ctx.db, "presence", "user_room", userId, "user")
    );
    (await getManyFrom(ctx.db, "presence", "user_room", userId, "user")).map(
      assertNotNull
    );
    await ctx.db.delete(presenceId);

    const file = await ctx.db.system.query("_storage").first();
    if (!file) throw new Error("No storage id found - upload something");
    const edgeId = await ctx.db.insert("join_storage_example", {
      userId,
      storageId: file._id,
    });

    (
      await getManyVia(
        ctx.db,
        "join_storage_example",
        "storageId",
        "userId_storageId",
        userId,
        "userId"
      )
    ).map(assertNotNull);
    (
      await getManyViaOrThrow(
        ctx.db,
        "join_storage_example",
        "storageId",
        "userId_storageId",
        userId,
        "userId"
      )
    ).map(assertNotNull);
    await ctx.db.delete(userId);
    await ctx.db.delete(edgeId);

    return true;
  },
});

export const joinTableExample = query({
  args: { userId: v.id("users"), sid: v.id("_storage") },
  handler: async (ctx, args) => {
    const sessions = await getManyVia(
      ctx.db,
      "join_table_example",
      "sessionId",
      "userId",
      args.userId
    );
    const files = await getManyVia(
      ctx.db,
      "join_storage_example",
      "storageId",
      "userId_storageId",
      args.userId,
      "userId"
    );
    const users = await getManyVia(
      ctx.db,
      "join_storage_example",
      "userId",
      "storageId",
      args.sid
    );
    return { sessions, files, users };
  },
});

function assert(value: boolean) {
  if (!value) {
    throw new Error("Assertion failed");
  }
}
function assertLength(list: any[], length: number) {
  if (list.length !== length) {
    throw new Error(`Expected length ${length}, got ${list.length}`);
  }
}
function assertHasNull(value: any[]) {
  if (value.findIndex((v) => v === null) === -1) {
    throw new Error("Expected to find null");
  }
}
function assertNull(value: any) {
  if (value !== null) {
    throw new Error(`Expected null, got ${value}`);
  }
}

function assertNotNull(value: any) {
  if (value === null) {
    throw new Error(`Expected not null, got ${value}`);
  }
}