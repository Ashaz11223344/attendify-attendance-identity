import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to get user profile by user ID
async function getUserProfile(ctx: any, userId: any) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();
}

// Get current user's profile
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getUserProfile(ctx, userId);
    return profile;
  },
});

// Get user profile by ID
export const getUserProfileById = query({
  args: { profileId: v.id("userProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db.get(args.profileId);
    return profile;
  },
});

// Create or update user profile
export const createOrUpdateProfile = mutation({
  args: {
    name: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    studentId: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existingProfile = await getUserProfile(ctx, userId);

    const profileData = {
      userId,
      name: args.name,
      email: user.email || "",
      role: args.role,
      studentId: args.studentId,
      department: args.department,
      phoneNumber: args.phoneNumber,
      parentEmail: args.parentEmail,
      status: "pending" as const,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      const profileId = await ctx.db.insert("userProfiles", profileData);
      return profileId;
    }
  },
});

// Update profile
export const updateProfile = mutation({
  args: {
    name: v.string(),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getUserProfile(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      name: args.name,
      department: args.department,
      phoneNumber: args.phoneNumber,
      parentEmail: args.parentEmail,
    });

    return profile._id;
  },
});

// Generate upload URL for profile picture
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Update profile picture
export const updateProfilePicture = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getUserProfile(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    // Delete old profile picture if it exists
    if (profile.profilePicture) {
      try {
        await ctx.storage.delete(profile.profilePicture);
      } catch (error) {
        console.warn("Failed to delete old profile picture:", error);
      }
    }

    await ctx.db.patch(profile._id, {
      profilePicture: args.storageId,
    });

    return profile._id;
  },
});

// Remove profile picture
export const removeProfilePicture = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await getUserProfile(ctx, userId);
    if (!profile) throw new Error("Profile not found");

    // Delete the profile picture from storage
    if (profile.profilePicture) {
      try {
        await ctx.storage.delete(profile.profilePicture);
      } catch (error) {
        console.warn("Failed to delete profile picture:", error);
      }
    }

    await ctx.db.patch(profile._id, {
      profilePicture: undefined,
    });

    return profile._id;
  },
});

// Get all user profiles (admin only)
export const getAllUserProfiles = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    role: v.optional(v.union(v.literal("student"), v.literal("teacher"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("userProfiles");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    const profiles = await query.collect();
    return profiles.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Update user status (admin only)
export const updateUserStatus = mutation({
  args: {
    profileId: v.id("userProfiles"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.profileId, {
      status: args.status,
    });

    return args.profileId;
  },
});

// Get students by status
export const getStudentsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "teacher")) {
      throw new Error("Admin or teacher access required");
    }

    const students = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();

    return students.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get approved students
export const getApprovedStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const students = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return students.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get teachers
export const getTeachers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const teachers = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return teachers.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Delete user profile (admin only)
export const deleteUserProfile = mutation({
  args: {
    profileId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const profileToDelete = await ctx.db.get(args.profileId);
    if (!profileToDelete) throw new Error("Profile not found");

    // Delete profile picture if it exists
    if (profileToDelete.profilePicture) {
      try {
        await ctx.storage.delete(profileToDelete.profilePicture);
      } catch (error) {
        console.warn("Failed to delete profile picture:", error);
      }
    }

    await ctx.db.delete(args.profileId);
    return args.profileId;
  },
});

// Aliases for backward compatibility
export const createProfile = createOrUpdateProfile;
export const deleteProfile = deleteUserProfile;
export const getAllProfiles = getAllUserProfiles;
export const updateProfileStatus = updateUserStatus;
export const getProfileById = getUserProfileById;

// Create first admin profile
export const createFirstAdminProfile = mutation({
  args: {
    name: v.string(),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if any admin users exist
    const existingAdmins = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (existingAdmins.length > 0) {
      throw new Error("Admin users already exist");
    }

    const existingProfile = await getUserProfile(ctx, userId);

    const profileData = {
      userId,
      name: args.name,
      email: user.email || "",
      role: "admin" as const,
      department: args.department,
      phoneNumber: args.phoneNumber,
      status: "approved" as const,
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      const profileId = await ctx.db.insert("userProfiles", profileData);
      return profileId;
    }
  },
});

// Check if admin users exist
export const hasAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    return admins.length > 0;
  },
});

// Get profile picture URL
export const getProfilePictureUrl = query({
  args: { profilePictureId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.profilePictureId);
  },
});

// Get all users (with filters)
export const getAllUsers = query({
  args: {
    role: v.optional(v.union(v.literal("student"), v.literal("teacher"), v.literal("admin"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "admin") {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("userProfiles");

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const profiles = await query.collect();
    const sorted = profiles.sort((a, b) => b._creationTime - a._creationTime);
    
    if (args.limit) {
      return sorted.slice(0, args.limit);
    }
    
    return sorted;
  },
});

// Get all students
export const getAllStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const students = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    return students.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// List students with filters
export const listStudents = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "teacher")) {
      throw new Error("Admin or teacher access required");
    }

    let query = ctx.db.query("userProfiles").withIndex("by_role", (q) => q.eq("role", "student"));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const students = await query.collect();
    return students.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Search profiles
export const searchProfiles = query({
  args: {
    query: v.string(),
    role: v.optional(v.union(v.literal("student"), v.literal("teacher"), v.literal("admin"))),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || (userProfile.role !== "admin" && userProfile.role !== "teacher")) {
      throw new Error("Admin or teacher access required");
    }

    let query = ctx.db.query("userProfiles");

    if (args.role) {
      query = query.filter((q) => q.eq(q.field("role"), args.role));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const profiles = await query.collect();
    
    // Filter by search query
    const searchTerm = args.query.toLowerCase();
    const filtered = profiles.filter(profile => 
      profile.name.toLowerCase().includes(searchTerm) ||
      (profile.email && profile.email.toLowerCase().includes(searchTerm)) ||
      (profile.studentId && profile.studentId.toLowerCase().includes(searchTerm)) ||
      (profile.department && profile.department.toLowerCase().includes(searchTerm))
    );

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },
});

// Get my students (for teachers)
export const getMyStudents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "teacher") {
      throw new Error("Teacher access required");
    }

    // Get subjects taught by this teacher
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_teacher", (q) => q.eq("teacherId", userProfile._id))
      .collect();

    if (subjects.length === 0) {
      return [];
    }

    // Get all enrollments for these subjects
    const allEnrollments = [];
    for (const subject of subjects) {
      const enrollments = await ctx.db
        .query("subjectEnrollments")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      allEnrollments.push(...enrollments);
    }

    // Get unique student IDs
    const studentIds = [...new Set(allEnrollments.map(e => e.studentId))];

    // Get student profiles
    const students = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await ctx.db.get(studentId);
        return student;
      })
    );

    return students.filter(Boolean).sort((a, b) => a!.name.localeCompare(b!.name));
  },
});
