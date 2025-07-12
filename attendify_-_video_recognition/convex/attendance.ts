import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Helper function to get user profile
async function getUserProfile(ctx: any, userId: any) {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first();
}

// Get student's attendance records
export const getStudentAttendance = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    let query = ctx.db.query("attendance").withIndex("by_student", (q) => 
      q.eq("studentId", userProfile._id)
    );

    if (args.subjectId) {
      query = query.filter((q) => q.eq(q.field("subjectId"), args.subjectId));
    }

    if (args.startDate !== undefined) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }

    if (args.endDate !== undefined) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    const attendance = await query.collect();

    const enrichedAttendance = await Promise.all(
      attendance.map(async (record) => {
        const session = await ctx.db.get(record.sessionId);
        const subject = session ? await ctx.db.get(session.subjectId) : null;
        
        return {
          ...record,
          session,
          subject,
          subjectName: subject?.name || "Unknown Subject",
          sessionName: session?.sessionName || "Unknown Session",
          date: session?.date || record.date,
        };
      })
    );

    return enrichedAttendance.sort((a, b) => b.date - a.date);
  },
});

// Get detailed attendance report
export const getDetailedAttendanceReport = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    dateRange: v.union(v.literal("week"), v.literal("month"), v.literal("semester")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    const now = Date.now();
    let startDate: number;
    
    switch (args.dateRange) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case "semester":
        startDate = now - (120 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = now - (30 * 24 * 60 * 60 * 1000);
    }

    let query = ctx.db.query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", userProfile._id))
      .filter((q) => q.gte(q.field("date"), startDate));

    if (args.subjectId) {
      query = query.filter((q) => q.eq(q.field("subjectId"), args.subjectId));
    }

    const attendance = await query.collect();

    const enrichedAttendance = await Promise.all(
      attendance.map(async (record) => {
        const session = await ctx.db.get(record.sessionId);
        const subject = session ? await ctx.db.get(session.subjectId) : null;
        
        return {
          ...record,
          session,
          subject,
          subjectName: subject?.name || "Unknown Subject",
          sessionName: session?.sessionName || "Unknown Session",
          date: session?.date || record.date,
        };
      })
    );

    return enrichedAttendance.sort((a, b) => b.date - a.date);
  },
});

// Get leaderboard data
export const getLeaderboard = query({
  args: {
    timeframe: v.union(v.literal("week"), v.literal("month"), v.literal("semester")),
    category: v.union(v.literal("attendance"), v.literal("punctuality"), v.literal("consistency")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    let startDate: number;
    
    switch (args.timeframe) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case "semester":
        startDate = now - (120 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = now - (30 * 24 * 60 * 60 * 1000);
    }

    const students = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    const leaderboardData = await Promise.all(
      students.map(async (student) => {
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .filter((q) => q.gte(q.field("date"), startDate))
          .collect();

        const totalClasses = attendance.length;
        let score = 0;

        if (totalClasses > 0) {
          switch (args.category) {
            case "attendance":
              const presentAndLate = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
              score = Math.round((presentAndLate / totalClasses) * 100);
              break;
            case "punctuality":
              const onTime = attendance.filter(a => a.status === 'present').length;
              score = Math.round((onTime / totalClasses) * 100);
              break;
            case "consistency":
              const recentAttendance = attendance.slice(-10);
              const recentPresent = recentAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
              score = recentAttendance.length > 0 ? Math.round((recentPresent / recentAttendance.length) * 100) : 0;
              break;
          }
        }

        return {
          userId: student._id,
          name: student.name,
          studentId: student.studentId,
          department: student.department,
          profilePicture: student.profilePicture,
          score,
          totalClasses,
        };
      })
    );

    return leaderboardData
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  },
});

// Get recent sessions
export const getRecentSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    let sessions;
    
    if (userProfile.role === "teacher") {
      sessions = await ctx.db
        .query("attendanceSessions")
        .withIndex("by_teacher", (q) => q.eq("teacherId", userProfile._id))
        .order("desc")
        .take(10);
    } else if (userProfile.role === "admin") {
      sessions = await ctx.db
        .query("attendanceSessions")
        .order("desc")
        .take(10);
    } else {
      const enrollments = await ctx.db
        .query("subjectEnrollments")
        .withIndex("by_student", (q) => q.eq("studentId", userProfile._id))
        .collect();
      
      const subjectIds = enrollments.map(e => e.subjectId);
      
      if (subjectIds.length === 0) {
        return [];
      }
      
      sessions = await ctx.db
        .query("attendanceSessions")
        .filter((q) => {
          let filter = q.eq(q.field("subjectId"), subjectIds[0]);
          for (let i = 1; i < subjectIds.length; i++) {
            filter = q.or(filter, q.eq(q.field("subjectId"), subjectIds[i]));
          }
          return filter;
        })
        .order("desc")
        .take(10);
    }

    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const subject = await ctx.db.get(session.subjectId);
        return {
          ...session,
          subject,
          status: session.isActive ? "active" : "completed",
        };
      })
    );

    return enrichedSessions;
  },
});

// Create attendance session
export const createAttendanceSession = mutation({
  args: {
    subjectId: v.id("subjects"),
    sessionName: v.string(),
    attendanceMode: v.union(v.literal("manual"), v.literal("face_scan")),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile || userProfile.role !== "teacher") {
      throw new Error("Only teachers can create attendance sessions");
    }

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) throw new Error("Subject not found");

    if (subject.teacherId !== userProfile._id) {
      throw new Error("You can only create sessions for your subjects");
    }

    const sessionId = await ctx.db.insert("attendanceSessions", {
      subjectId: args.subjectId,
      teacherId: userProfile._id,
      sessionName: args.sessionName,
      date: Date.now(),
      startTime: Date.now(),
      attendanceMode: args.attendanceMode,
      isActive: true,
      location: args.location,
    });

    return sessionId;
  },
});

// End attendance session
export const endAttendanceSession = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    if (userProfile.role !== "teacher" || session.teacherId !== userProfile._id) {
      throw new Error("Only the session teacher can end the session");
    }

    await ctx.db.patch(args.sessionId, {
      isActive: false,
      endTime: Date.now(),
    });

    return args.sessionId;
  },
});

// Get active sessions
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    if (userProfile.role !== "teacher") {
      throw new Error("Only teachers can view active sessions");
    }

    const sessions = await ctx.db
      .query("attendanceSessions")
      .withIndex("by_teacher", (q) => q.eq("teacherId", userProfile._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const subject = await ctx.db.get(session.subjectId);
        return {
          ...session,
          subject,
          status: "active",
        };
      })
    );

    return enrichedSessions;
  },
});

// Mark attendance
export const markAttendance = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
    studentId: v.id("userProfiles"),
    status: v.union(v.literal("present"), v.literal("absent"), v.literal("late"), v.literal("on_leave")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userProfile = await getUserProfile(ctx, userId);
    if (!userProfile) throw new Error("User profile not found");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const isTeacher = userProfile.role === "teacher" && session.teacherId === userProfile._id;
    const isStudent = userProfile.role === "student" && args.studentId === userProfile._id;
    
    if (!isTeacher && !isStudent) {
      throw new Error("Not authorized to mark attendance for this session");
    }

    // Check if attendance already exists
    const existingAttendance = await ctx.db
      .query("attendance")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .first();

    let attendanceId;
    if (existingAttendance) {
      await ctx.db.patch(existingAttendance._id, {
        status: args.status,
        notes: args.notes,
      });
      attendanceId = existingAttendance._id;
    } else {
      attendanceId = await ctx.db.insert("attendance", {
        sessionId: args.sessionId,
        studentId: args.studentId,
        teacherId: userProfile._id,
        subjectId: session.subjectId,
        date: Date.now(),
        status: args.status,
        attendanceMode: session.attendanceMode,
        notes: args.notes,
        parentNotified: false,
      });
    }

    // Send email notification for all attendance statuses (immediate notification)
    try {
      await ctx.scheduler.runAfter(0, api.attendanceNotifications.sendAttendanceNotificationEmail, {
        attendanceId,
      });
    } catch (error) {
      console.error("Failed to schedule attendance notification:", error);
      // Continue execution even if notification fails
    }

    return attendanceId;
  },
});

// Mark manual attendance (alias for markAttendance)
export const markManualAttendance = markAttendance;

// Get attendance session
export const getAttendanceSession = query({
  args: {
    sessionId: v.id("attendanceSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const subject = await ctx.db.get(session.subjectId);
    
    return {
      ...session,
      subject,
    };
  },
});

// Get enrolled students for a session
export const getEnrolledStudents = query({
  args: {
    sessionId: v.id("attendanceSessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    const enrollments = await ctx.db
      .query("subjectEnrollments")
      .withIndex("by_subject", (q) => q.eq("subjectId", session.subjectId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const student = await ctx.db.get(enrollment.studentId);
        return student;
      })
    );

    return students.filter(Boolean);
  },
});
