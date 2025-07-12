import { v } from "convex/values";
import { action, query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

// Send attendance notification email
export const sendAttendanceNotificationEmail = action({
  args: {
    attendanceId: v.id("attendance"),
  },
  handler: async (ctx, args) => {
    const attendance = await ctx.runQuery(api.attendanceNotifications.getAttendanceById, {
      attendanceId: args.attendanceId,
    });

    if (!attendance) {
      console.error("Attendance record not found:", args.attendanceId);
      return;
    }

    const student = await ctx.runQuery(api.userProfiles.getUserProfileById, {
      profileId: attendance.studentId,
    });

    const teacher = await ctx.runQuery(api.userProfiles.getUserProfileById, {
      profileId: attendance.teacherId,
    });

    const session = await ctx.runQuery(api.attendance.getAttendanceSession, {
      sessionId: attendance.sessionId,
    });

    if (!student) {
      console.error("Student not found:", attendance.studentId);
      return;
    }

    if (!teacher) {
      console.error("Teacher not found:", attendance.teacherId);
      return;
    }

    if (!session) {
      console.error("Session not found:", attendance.sessionId);
      return;
    }

    // Send email to parent if available
    if (student.parentEmail && student.parentEmail.trim()) {
      try {
        await ctx.runAction(api.emailService.sendParentNotificationEmail, {
          parentEmail: student.parentEmail,
          studentName: student.name,
          subjectName: session.subject?.name || "Unknown Subject",
          sessionName: session.sessionName,
          teacherName: teacher.name,
          status: attendance.status,
          date: new Date(attendance.date).toLocaleDateString(),
          notes: attendance.notes || "",
        });

        // Mark as notified
        await ctx.runMutation(api.attendanceNotifications.markParentNotified, {
          attendanceId: args.attendanceId,
        });
      } catch (error) {
        console.error("Failed to send parent notification:", error);
      }
    }

    // Send notification to teacher for absent students
    if (attendance.status === "absent" && teacher.email && teacher.email.trim()) {
      try {
        await ctx.runAction(api.emailService.sendBulkNotificationEmails, {
          recipients: [{
            email: teacher.email,
            name: teacher.name,
          }],
          subject: `Student Absence Alert: ${student.name}`,
          message: `${student.name} was marked as absent for ${session.sessionName} in ${session.subject?.name || "Unknown Subject"} on ${new Date(attendance.date).toLocaleDateString()}.${attendance.notes ? ` Notes: ${attendance.notes}` : ""}`,
          type: "warning",
        });
      } catch (error) {
        console.error("Failed to send teacher notification:", error);
      }
    }
  },
});

// Get attendance by ID
export const getAttendanceById = query({
  args: {
    attendanceId: v.id("attendance"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.attendanceId);
  },
});

// Mark parent as notified
export const markParentNotified = mutation({
  args: {
    attendanceId: v.id("attendance"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.attendanceId, {
      parentNotified: true,
      parentNotificationSentAt: Date.now(),
    });
  },
});
