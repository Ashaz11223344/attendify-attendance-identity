import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get notifications for current user
export const getMyNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      return [];
    }

    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userProfile._id))
      .order("desc");

    if (args.unreadOnly) {
      query = query.filter((q) => q.eq(q.field("isRead"), false));
    }

    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || notification.userId !== userProfile._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }

    return unreadNotifications.length;
  },
});

// Send notification (admin only)
export const sendNotification = mutation({
  args: {
    userId: v.id("userProfiles"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("attendance"),
      v.literal("enrollment"),
      v.literal("announcement"),
      v.literal("system"),
      v.literal("message")
    ),
    actionUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", currentUserId))
      .unique();

    if (!currentProfile || currentProfile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      actionUrl: args.actionUrl,
      relatedId: args.metadata?.relatedId,
      timestamp: Date.now(),
    });

    return notificationId;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", profile._id))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return unreadNotifications.length;
  },
});

// Create notification (internal)
export const createNotification = internalMutation({
  args: {
    userId: v.id("userProfiles"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("attendance"),
      v.literal("enrollment"),
      v.literal("announcement"),
      v.literal("system"),
      v.literal("message")
    ),
    actionUrl: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      isRead: false,
      actionUrl: args.actionUrl,
      relatedId: args.relatedId,
      timestamp: Date.now(),
    });
  },
});
