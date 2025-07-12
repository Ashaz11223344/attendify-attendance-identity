import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Helper function to get user profile
async function getUserProfile(ctx: any, userId: any) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();
}

// Submit leave request
export const submitLeaveRequest = mutation({
  args: {
    subjectId: v.optional(v.id("subjects")),
    teacherId: v.optional(v.id("userProfiles")),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "student") {
      throw new Error("Only students can submit leave requests");
    }

    const leaveRequestId = await ctx.db.insert("leaveRequests", {
      studentId: userProfile._id,
      subjectId: args.subjectId,
      teacherId: args.teacherId,
      startDate: args.startDate,
      endDate: args.endDate,
      reason: args.reason,
      description: args.description,
      status: "pending",
      submittedAt: Date.now(),
      parentNotified: false,
      teacherNotified: false,
    });

    // Schedule email notifications (immediate delivery)
    try {
      await ctx.scheduler.runAfter(0, api.leaveRequests.sendLeaveRequestNotifications, {
        leaveRequestId,
      });
    } catch (error) {
      console.error("Failed to schedule leave request notifications:", error);
      // Continue execution even if notification scheduling fails
    }

    return leaveRequestId;
  },
});

// Send leave request notifications
export const sendLeaveRequestNotifications = action({
  args: {
    leaveRequestId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    try {
      const leaveRequest = await ctx.runQuery(api.leaveRequests.getLeaveRequestById, {
        leaveRequestId: args.leaveRequestId,
      });

      if (!leaveRequest) {
        console.error("Leave request not found:", args.leaveRequestId);
        return;
      }

      const student = await ctx.runQuery(api.userProfiles.getUserProfileById, {
        profileId: leaveRequest.studentId,
      });

      if (!student) {
        console.error("Student not found:", leaveRequest.studentId);
        return;
      }

    // Send email to teacher if specified
    if (leaveRequest.teacherId) {
      const teacher = await ctx.runQuery(api.userProfiles.getUserProfileById, {
        profileId: leaveRequest.teacherId,
      });

      if (teacher) {
        try {
          console.log(`Sending leave request notification to teacher: ${teacher.email || teacher.name}`);
          await ctx.runAction(api.emailService.sendLeaveRequestNotificationEmail, {
            to: teacher.email || `${teacher.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            studentName: student.name,
            teacherName: teacher.name,
            subjectName: leaveRequest.subject?.name || "General",
            startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
            endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
            reason: leaveRequest.reason,
            description: leaveRequest.description || "",
            submittedAt: new Date(leaveRequest.submittedAt).toLocaleString(),
          });

          await ctx.runMutation(api.leaveRequests.updateLeaveRequestNotificationStatus, {
            leaveRequestId: args.leaveRequestId,
            field: "teacherNotified",
            value: true,
          });
          console.log(`Successfully sent leave request notification to teacher: ${teacher.name}`);
        } catch (error) {
          console.error("Failed to send teacher notification:", error);
        }
      }
    }

      // Send email to parent
      if (student.parentEmail && student.parentEmail.trim()) {
        try {
          console.log(`Sending leave request confirmation to parent: ${student.parentEmail}`);
          await ctx.runAction(api.emailService.sendLeaveRequestParentNotificationEmail, {
          to: student.parentEmail,
          studentName: student.name,
          subjectName: leaveRequest.subject?.name || "General",
          startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
          endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
          reason: leaveRequest.reason,
          description: leaveRequest.description || "",
          submittedAt: new Date(leaveRequest.submittedAt).toLocaleString(),
        });

        await ctx.runMutation(api.leaveRequests.updateLeaveRequestNotificationStatus, {
          leaveRequestId: args.leaveRequestId,
          field: "parentNotified",
          value: true,
        });
        console.log(`Successfully sent leave request confirmation to parent: ${student.parentEmail}`);
      } catch (error) {
        console.error("Failed to send parent notification:", error);
      }
    } else {
      console.log(`No parent email found for student: ${student.name}`);
    }
    } catch (error) {
      console.error("Error in sendLeaveRequestNotifications:", error);
      throw error;
    }
  },
});

// Update notification status
export const updateLeaveRequestNotificationStatus = mutation({
  args: {
    leaveRequestId: v.id("leaveRequests"),
    field: v.union(v.literal("parentNotified"), v.literal("teacherNotified")),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leaveRequestId, {
      [args.field]: args.value,
    });
  },
});

// Get leave request by ID
export const getLeaveRequestById = query({
  args: {
    leaveRequestId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    const leaveRequest = await ctx.db.get(args.leaveRequestId);
    if (!leaveRequest) return null;

    const subject = leaveRequest.subjectId ? await ctx.db.get(leaveRequest.subjectId) : null;
    const teacher = leaveRequest.teacherId ? await ctx.db.get(leaveRequest.teacherId) : null;

    return {
      ...leaveRequest,
      subject,
      teacher,
    };
  },
});

// Get student's leave requests
export const getMyLeaveRequests = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) return [];

    const leaveRequests = await ctx.db
      .query("leaveRequests")
      .withIndex("by_student", (q) => q.eq("studentId", userProfile._id))
      .order("desc")
      .take(args.limit || 50);

    const enrichedRequests = await Promise.all(
      leaveRequests.map(async (request) => {
        const subject = request.subjectId ? await ctx.db.get(request.subjectId) : null;
        const teacher = request.teacherId ? await ctx.db.get(request.teacherId) : null;

        return {
          ...request,
          subject,
          teacher,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get leave requests for teacher
export const getLeaveRequestsForTeacher = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "teacher") return [];

    let query = ctx.db
      .query("leaveRequests")
      .withIndex("by_teacher", (q) => q.eq("teacherId", userProfile._id))
      .order("desc");

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const leaveRequests = await query.take(args.limit || 50);

    const enrichedRequests = await Promise.all(
      leaveRequests.map(async (request) => {
        const student = await ctx.db.get(request.studentId);
        const subject = request.subjectId ? await ctx.db.get(request.subjectId) : null;

        return {
          ...request,
          student,
          subject,
        };
      })
    );

    return enrichedRequests;
  },
});

// Review leave request (approve/reject)
export const reviewLeaveRequest = mutation({
  args: {
    leaveRequestId: v.id("leaveRequests"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || (userProfile.role !== "teacher" && userProfile.role !== "admin")) {
      throw new Error("Only teachers and admins can review leave requests");
    }

    const leaveRequest = await ctx.db.get(args.leaveRequestId);
    if (!leaveRequest) throw new Error("Leave request not found");

    // Check if teacher is authorized to review this request
    if (userProfile.role === "teacher" && leaveRequest.teacherId !== userProfile._id) {
      throw new Error("You can only review leave requests assigned to you");
    }

    await ctx.db.patch(args.leaveRequestId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: userProfile._id,
      reviewNotes: args.reviewNotes,
    });

    // Schedule notification emails (immediate delivery)
    try {
      await ctx.scheduler.runAfter(0, api.leaveRequests.sendLeaveRequestReviewNotifications, {
        leaveRequestId: args.leaveRequestId,
      });
    } catch (error) {
      console.error("Failed to schedule leave request review notifications:", error);
      // Continue execution even if notification scheduling fails
    }

    return args.leaveRequestId;
  },
});

// Send leave request review notifications
export const sendLeaveRequestReviewNotifications = action({
  args: {
    leaveRequestId: v.id("leaveRequests"),
  },
  handler: async (ctx, args) => {
    try {
      const leaveRequest = await ctx.runQuery(api.leaveRequests.getLeaveRequestById, {
        leaveRequestId: args.leaveRequestId,
      });

      if (!leaveRequest) {
        console.error("Leave request not found:", args.leaveRequestId);
        return;
      }

    const student = await ctx.runQuery(api.userProfiles.getUserProfileById, {
      profileId: leaveRequest.studentId,
    });

    const reviewer = leaveRequest.reviewedBy 
      ? await ctx.runQuery(api.userProfiles.getUserProfileById, {
          profileId: leaveRequest.reviewedBy,
        })
      : null;

      if (!student) {
        console.error("Student not found:", leaveRequest.studentId);
        return;
      }

      // Send email to parent
      if (student.parentEmail && student.parentEmail.trim()) {
        try {
          console.log(`Sending leave request review notification to parent: ${student.parentEmail}`);
          await ctx.runAction(api.emailService.sendLeaveRequestReviewNotificationEmail, {
          to: student.parentEmail,
          studentName: student.name,
          subjectName: leaveRequest.subject?.name || "General",
          startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
          endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
          reason: leaveRequest.reason,
          status: leaveRequest.status,
          reviewerName: reviewer?.name || "Administrator",
          reviewNotes: leaveRequest.reviewNotes || "",
          reviewedAt: new Date(leaveRequest.reviewedAt || Date.now()).toLocaleString(),
        });
        console.log(`Successfully sent leave request review notification to parent: ${student.parentEmail}`);
      } catch (error) {
        console.error("Failed to send review notification:", error);
      }
    } else {
      console.log(`No parent email found for student: ${student.name}`);
    }
    } catch (error) {
      console.error("Error in sendLeaveRequestReviewNotifications:", error);
      throw error;
    }
  },
});
