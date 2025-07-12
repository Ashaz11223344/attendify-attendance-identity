import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("teacher"), v.literal("student")),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    studentId: v.optional(v.string()),
    teacherId: v.optional(v.string()),
    department: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
    parentPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    profilePicture: v.optional(v.id("_storage")),
    profilePictureId: v.optional(v.id("_storage")),
    createdAt: v.optional(v.number()),
    emailVerified: v.optional(v.boolean()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("userProfiles")),
    rejectionReason: v.optional(v.string()),
    // Face recognition fields
    faceEncodingData: v.optional(v.string()),
    facePhotoId: v.optional(v.id("_storage")),
    faceDataSetupAt: v.optional(v.number()),
    faceDataVerified: v.optional(v.boolean()),
    faceQualityScore: v.optional(v.number()),
    faceDataSetupBy: v.optional(v.id("userProfiles")),
    // 2FA fields
    twoFactorEnabled: v.optional(v.boolean()),
    otpSecret: v.optional(v.string()),
    otpLastSent: v.optional(v.number()),
    otpCode: v.optional(v.string()),
    otpExpiresAt: v.optional(v.number()),
  })
    .index("by_user_id", ["userId"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_student_id", ["studentId"]),

  // ...rest unchanged...
  subjects: defineTable({
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    teacherId: v.id("userProfiles"),
    department: v.optional(v.string()),
    credits: v.optional(v.number()),
    semester: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_code", ["code"])
    .index("by_department", ["department"]),

  subjectEnrollments: defineTable({
    subjectId: v.id("subjects"),
    studentId: v.id("userProfiles"),
    enrolledAt: v.number(),
    enrolledBy: v.optional(v.id("userProfiles")),
    isActive: v.boolean(),
  })
    .index("by_subject", ["subjectId"])
    .index("by_student", ["studentId"])
    .index("by_subject_and_student", ["subjectId", "studentId"])
    .index("by_subject_and_active", ["subjectId", "isActive"]),

  attendanceSessions: defineTable({
    subjectId: v.id("subjects"),
    teacherId: v.id("userProfiles"),
    sessionName: v.string(),
    date: v.number(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    location: v.optional(v.string()),
    attendanceMode: v.union(v.literal("manual"), v.literal("face_scan")),
    isActive: v.boolean(),
    faceRecognitionSettings: v.optional(v.object({
      confidenceThreshold: v.number(),
      livenessThreshold: v.number(),
      maxAttempts: v.optional(v.number()),
      maxAttemptsPerSession: v.optional(v.number()),
      allowMultipleAttempts: v.optional(v.boolean()),
    })),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_subject", ["subjectId"])
    .index("by_date", ["date"])
    .index("by_teacher_and_active", ["teacherId", "isActive"]),

  attendance: defineTable({
    studentId: v.id("userProfiles"),
    teacherId: v.id("userProfiles"),
    subjectId: v.id("subjects"),
    sessionId: v.id("attendanceSessions"),
    date: v.number(),
    status: v.union(
      v.literal("present"), 
      v.literal("absent"), 
      v.literal("late"), 
      v.literal("on_leave")
    ),
    checkInTime: v.optional(v.number()),
    checkOutTime: v.optional(v.number()),
    attendanceMode: v.union(v.literal("manual"), v.literal("face_scan")),
    faceRecognitionData: v.optional(v.object({
      confidence: v.number(),
      livenessScore: v.optional(v.number()),
      capturedImageId: v.optional(v.id("_storage")),
      processingTime: v.number(),
      autoProcessed: v.optional(v.boolean()),
      faceQuality: v.optional(v.number()),
    })),
    notes: v.optional(v.string()),
    parentNotified: v.boolean(),
    parentNotificationSentAt: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_subject", ["subjectId"])
    .index("by_session", ["sessionId"])
    .index("by_student_and_date", ["studentId", "date"])
    .index("by_date", ["date"]),

  faceRecognitionLogs: defineTable({
    sessionId: v.id("attendanceSessions"),
    capturedImageId: v.id("_storage"),
    studentId: v.optional(v.id("userProfiles")),
    recognitionResult: v.object({
      success: v.boolean(),
      confidence: v.optional(v.number()),
      livenessScore: v.optional(v.number()),
      faceQuality: v.optional(v.number()),
      autoProcessed: v.optional(v.boolean()),
      thresholds: v.optional(v.object({
        confidence: v.number(),
        liveness: v.number(),
        quality: v.number(),
      })),
      errorMessage: v.optional(v.string()),
    }),
    processingTime: v.number(),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"]),

  notifications: defineTable({
    userId: v.id("userProfiles"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("attendance"),
      v.literal("enrollment"),
      v.literal("announcement"),
      v.literal("system"),
      v.literal("message"),
      v.literal("leave_request")
    ),
    isRead: v.optional(v.boolean()),
    read: v.optional(v.boolean()),
    timestamp: v.number(),
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_read", ["userId", "isRead"]),

  leaveRequests: defineTable({
    studentId: v.id("userProfiles"),
    subjectId: v.optional(v.id("subjects")),
    teacherId: v.optional(v.id("userProfiles")),
    startDate: v.number(),
    endDate: v.number(),
    reason: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("userProfiles")),
    reviewNotes: v.optional(v.string()),
    attachments: v.optional(v.array(v.id("_storage"))),
    parentNotified: v.optional(v.boolean()),
    teacherNotified: v.optional(v.boolean()),
  })
    .index("by_student", ["studentId"])
    .index("by_teacher", ["teacherId"])
    .index("by_subject", ["subjectId"])
    .index("by_status", ["status"])
    .index("by_submitted_date", ["submittedAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
