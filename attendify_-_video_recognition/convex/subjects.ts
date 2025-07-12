import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create subject (admin only)
export const createSubject = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    teacherId: v.optional(v.id("userProfiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Check if subject code already exists
    const existingSubject = await ctx.db
      .query("subjects")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existingSubject) {
      throw new Error("Subject code already exists");
    }

    // Validate teacher if provided
    if (args.teacherId) {
      const teacher = await ctx.db.get(args.teacherId);
      if (!teacher || teacher.role !== "teacher" || teacher.status !== "approved") {
        throw new Error("Invalid teacher selected");
      }
    }

    const subjectId = await ctx.db.insert("subjects", {
      name: args.name,
      code: args.code,
      description: args.description,
      teacherId: args.teacherId!,
      department: args.department,
      isActive: true,
      createdAt: Date.now(),
    });

    return subjectId;
  },
});

// Update subject (admin only)
export const updateSubject = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    department: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) throw new Error("Subject not found");

    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.department !== undefined) updateData.department = args.department;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.subjectId, updateData);
    return args.subjectId;
  },
});

// Assign teacher to subject (admin only)
export const assignTeacher = mutation({
  args: {
    subjectId: v.id("subjects"),
    teacherId: v.optional(v.id("userProfiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const subject = await ctx.db.get(args.subjectId);
    if (!subject) throw new Error("Subject not found");

    // Validate teacher if provided
    if (args.teacherId) {
      const teacher = await ctx.db.get(args.teacherId);
      if (!teacher || teacher.role !== "teacher" || teacher.status !== "approved") {
        throw new Error("Invalid teacher selected");
      }
    }

    await ctx.db.patch(args.subjectId, {
      teacherId: args.teacherId,
    });

    // Create notification for teacher if assigned
    if (args.teacherId) {
      await ctx.db.insert("notifications", {
        userId: args.teacherId,
        title: "Subject Assigned",
        message: `You have been assigned to teach ${subject.name} (${subject.code}).`,
        type: "system",
        isRead: false,
        timestamp: Date.now(),
      });
    }

    return args.subjectId;
  },
});

// Get subjects for current user
export const getMySubjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) throw new Error("Profile not found");

    if (profile.role === "admin") {
      // Admin can see all subjects
      return await ctx.db.query("subjects").collect();
    } else if (profile.role === "teacher") {
      // Teacher can see their assigned subjects
      return await ctx.db
        .query("subjects")
        .withIndex("by_teacher", (q) => q.eq("teacherId", profile._id))
        .collect();
    } else if (profile.role === "student") {
      // Student can see enrolled subjects
      const enrollments = await ctx.db
        .query("subjectEnrollments")
        .withIndex("by_student", (q) => q.eq("studentId", profile._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const subjects = [];
      for (const enrollment of enrollments) {
        const subject = await ctx.db.get(enrollment.subjectId);
        if (subject) {
          subjects.push(subject);
        }
      }
      return subjects;
    }

    return [];
  },
});

// Enroll student in subject (admin only)
export const enrollStudent = mutation({
  args: {
    studentId: v.id("userProfiles"),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify student exists and is approved
    const student = await ctx.db.get(args.studentId);
    if (!student || student.role !== "student" || student.status !== "approved") {
      throw new Error("Student not found or not approved");
    }

    // Verify subject exists
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) throw new Error("Subject not found");

    // Check if already enrolled
    const existingEnrollment = await ctx.db
      .query("subjectEnrollments")
      .withIndex("by_subject_and_student", (q) => 
        q.eq("subjectId", args.subjectId).eq("studentId", args.studentId)
      )
      .first();

    if (existingEnrollment) {
      if (existingEnrollment.isActive) {
        throw new Error("Student is already enrolled in this subject");
      } else {
        // Reactivate enrollment
        await ctx.db.patch(existingEnrollment._id, {
          isActive: true,
          enrolledAt: Date.now(),
        });
        return existingEnrollment._id;
      }
    }

    const enrollmentId = await ctx.db.insert("subjectEnrollments", {
      studentId: args.studentId,
      subjectId: args.subjectId,
      enrolledAt: Date.now(),
      enrolledBy: profile._id,
      isActive: true,
    });

    // Create notification for student
    await ctx.db.insert("notifications", {
      userId: student._id,
      title: "Enrolled in Subject",
      message: `You have been enrolled in ${subject.name} (${subject.code}).`,
      type: "enrollment",
      isRead: false,
      timestamp: Date.now(),
    });

    return enrollmentId;
  },
});

// Get enrolled students for a subject (admin only)
export const getEnrolledStudents = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      throw new Error("Admin or teacher access required");
    }

    const enrollments = await ctx.db
      .query("subjectEnrollments")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const students = [];
    for (const enrollment of enrollments) {
      const student = await ctx.db.get(enrollment.studentId);
      if (student) {
        students.push({
          ...student,
          enrollmentId: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
        });
      }
    }

    return students;
  },
});

// Remove student from subject (admin only)
export const removeStudentFromSubject = mutation({
  args: {
    enrollmentId: v.id("subjectEnrollments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const enrollment = await ctx.db.get(args.enrollmentId);
    if (!enrollment) throw new Error("Enrollment not found");

    await ctx.db.patch(args.enrollmentId, {
      isActive: false,
    });

    // Create notification for student
    const student = await ctx.db.get(enrollment.studentId);
    const subject = await ctx.db.get(enrollment.subjectId);
    
    if (student && subject) {
      await ctx.db.insert("notifications", {
        userId: student._id,
        title: "Removed from Subject",
        message: `You have been removed from ${subject.name} (${subject.code}).`,
        type: "system",
        isRead: false,
        timestamp: Date.now(),
      });
    }

    return args.enrollmentId;
  },
});

// Get all subjects (admin only)
export const getAllSubjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile || profile.role !== "admin") {
      throw new Error("Admin access required");
    }

    const subjects = await ctx.db.query("subjects").collect();
    
    // Get teacher details for each subject
    const subjectsWithTeachers = await Promise.all(
      subjects.map(async (subject) => {
        const teacher = subject.teacherId ? await ctx.db.get(subject.teacherId) : null;
        return {
          ...subject,
          teacher,
        };
      })
    );

    return subjectsWithTeachers;
  },
});
