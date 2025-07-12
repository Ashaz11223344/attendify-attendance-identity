import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Enhanced face recognition with automatic processing
export const recognizeFace = action({
  args: {
    imageBlob: v.any(), // Blob data
    subjectId: v.id("subjects"),
    confidenceThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    matches: any[];
    allMatches?: any[];
    threshold?: number;
  }> => {
    // Simulate advanced face recognition processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get enrolled students for the subject
    const enrolledStudents: any[] = await ctx.runQuery(api.subjects.getEnrolledStudents, {
      subjectId: args.subjectId
    });

    // Filter students with face data
    const studentsWithFaceData: any[] = enrolledStudents.filter((student: any) => 
      student.faceDataVerified && student.faceEncodingData
    );

    if (studentsWithFaceData.length === 0) {
      return {
        success: false,
        message: "No students with face data found for this subject",
        matches: []
      };
    }

    // Simulate face matching with realistic confidence scores
    const matches = [];
    const threshold = args.confidenceThreshold || 0.93;

    // Simulate recognition results - in real implementation, this would use actual face recognition
    for (const student of studentsWithFaceData) {
      // Simulate varying confidence levels based on realistic scenarios
      const baseConfidence = Math.random();
      let confidence = 0;

      // Simulate different recognition scenarios
      if (baseConfidence > 0.8) {
        // High confidence match (93-98%)
        confidence = 0.93 + (Math.random() * 0.05);
      } else if (baseConfidence > 0.6) {
        // Medium confidence match (85-92%)
        confidence = 0.85 + (Math.random() * 0.07);
      } else if (baseConfidence > 0.4) {
        // Low confidence match (70-84%)
        confidence = 0.70 + (Math.random() * 0.14);
      } else {
        // Very low confidence (50-69%)
        confidence = 0.50 + (Math.random() * 0.19);
      }

      // Only include matches above minimum threshold
      if (confidence >= 0.70) {
        matches.push({
          studentId: student._id,
          confidence: confidence,
          livenessScore: 0.85 + (Math.random() * 0.15), // Simulate liveness detection
          faceQuality: 0.80 + (Math.random() * 0.20), // Simulate face quality assessment
          timestamp: Date.now()
        });
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    // Only return the best match if it meets the threshold
    const bestMatch: any = matches[0];
    const success: boolean = bestMatch && bestMatch.confidence >= threshold;

    return {
      success,
      message: success 
        ? `Student recognized with ${Math.round(bestMatch.confidence * 100)}% confidence`
        : matches.length > 0 
          ? `Best match: ${Math.round(bestMatch.confidence * 100)}% confidence (below ${Math.round(threshold * 100)}% threshold)`
          : "No face matches found",
      matches: success ? [bestMatch] : [],
      allMatches: matches, // For debugging/analysis
      threshold: threshold
    };
  },
});

// Process automatic face recognition for attendance
export const processAutoFaceRecognition = mutation({
  args: {
    sessionId: v.id("attendanceSessions"),
    studentId: v.id("userProfiles"),
    capturedImageId: v.id("_storage"),
    confidence: v.number(),
    livenessScore: v.number(),
    faceQuality: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || userProfile.role !== "teacher") {
      throw new Error("Only teachers can process face recognition");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.teacherId !== userProfile._id) {
      throw new Error("You don't have permission to process attendance for this session");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Enhanced confidence threshold for automatic recognition
    const CONFIDENCE_THRESHOLD = 0.93;
    const LIVENESS_THRESHOLD = 0.80;
    const QUALITY_THRESHOLD = 0.75;

    const isHighConfidence = args.confidence >= CONFIDENCE_THRESHOLD;
    const isLivenessGood = args.livenessScore >= LIVENESS_THRESHOLD;
    const isQualityGood = !args.faceQuality || args.faceQuality >= QUALITY_THRESHOLD;

    // Log the face recognition attempt with enhanced data
    await ctx.db.insert("faceRecognitionLogs", {
      sessionId: args.sessionId,
      capturedImageId: args.capturedImageId,
      studentId: args.studentId,
      recognitionResult: {
        success: isHighConfidence && isLivenessGood && isQualityGood,
        confidence: args.confidence,
        livenessScore: args.livenessScore,
        faceQuality: args.faceQuality || 0.85,
        autoProcessed: true,
        thresholds: {
          confidence: CONFIDENCE_THRESHOLD,
          liveness: LIVENESS_THRESHOLD,
          quality: QUALITY_THRESHOLD
        }
      },
      processingTime: Date.now(),
      timestamp: Date.now(),
    });

    // Automatic attendance marking for high-confidence recognitions
    if (isHighConfidence && isLivenessGood && isQualityGood) {
      // Check if attendance already exists
      const existingAttendance = await ctx.db
        .query("attendance")
        .withIndex("by_student_and_date", (q) => 
          q.eq("studentId", args.studentId)
        )
        .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
        .first();

      const attendanceData = {
        status: "present" as const,
        checkInTime: Date.now(),
        attendanceMode: "face_scan" as const,
        faceRecognitionData: {
          confidence: args.confidence,
          livenessScore: args.livenessScore,
          faceQuality: args.faceQuality || 0.85,
          capturedImageId: args.capturedImageId,
          processingTime: Date.now(),
          autoProcessed: true
        },
      };

      if (existingAttendance) {
        // Update existing attendance
        await ctx.db.patch(existingAttendance._id, attendanceData);
      } else {
        // Create new attendance record
        await ctx.db.insert("attendance", {
          studentId: args.studentId,
          teacherId: session.teacherId,
          subjectId: session.subjectId,
          sessionId: args.sessionId,
          date: Date.now(),
          ...attendanceData,
          parentNotified: false,
        });
      }

      return { 
        success: true, 
        message: `${student.name} automatically marked present`,
        confidence: args.confidence,
        autoProcessed: true
      };
    } else {
      // Provide detailed feedback for failed recognition
      let reason = "Recognition failed: ";
      const reasons = [];
      
      if (!isHighConfidence) {
        reasons.push(`Confidence ${Math.round(args.confidence * 100)}% < ${Math.round(CONFIDENCE_THRESHOLD * 100)}%`);
      }
      if (!isLivenessGood) {
        reasons.push(`Liveness ${Math.round(args.livenessScore * 100)}% < ${Math.round(LIVENESS_THRESHOLD * 100)}%`);
      }
      if (!isQualityGood) {
        reasons.push(`Quality ${Math.round((args.faceQuality || 0) * 100)}% < ${Math.round(QUALITY_THRESHOLD * 100)}%`);
      }
      
      reason += reasons.join(", ");

      return { 
        success: false, 
        message: reason,
        confidence: args.confidence,
        autoProcessed: false,
        thresholds: {
          confidence: CONFIDENCE_THRESHOLD,
          liveness: LIVENESS_THRESHOLD,
          quality: QUALITY_THRESHOLD
        }
      };
    }
  },
});

// Get face recognition logs for a session with enhanced filtering
export const getSessionFaceLogs = query({
  args: {
    sessionId: v.id("attendanceSessions"),
    includeFailures: v.optional(v.boolean()),
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

    if (!userProfile || userProfile.role !== "teacher") {
      return [];
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.teacherId !== userProfile._id) {
      return [];
    }

    let logs = await ctx.db
      .query("faceRecognitionLogs")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Filter out failures unless specifically requested
    if (!args.includeFailures) {
      logs = logs.filter(log => log.recognitionResult.success);
    }

    // Enrich with student data and sort by timestamp
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const student = log.studentId ? await ctx.db.get(log.studentId) : null;
        return {
          ...log,
          student,
        };
      })
    );

    return enrichedLogs.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Setup face data for a student with enhanced validation
export const setupStudentFaceData = mutation({
  args: {
    studentId: v.id("userProfiles"),
    facePhotoId: v.id("_storage"),
    faceEncodingData: v.string(),
    faceQualityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Enhanced permission checking
    const isStudent = userProfile.role === "student" && userProfile._id === args.studentId;
    const isTeacherOrAdmin = ["teacher", "admin"].includes(userProfile.role);

    if (!isStudent && !isTeacherOrAdmin) {
      throw new Error("Permission denied");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Validate face quality if provided
    const qualityScore = args.faceQualityScore || 0.85;
    if (qualityScore < 0.75) {
      throw new Error("Face photo quality is too low for reliable recognition");
    }

    // Update student profile with enhanced face data
    await ctx.db.patch(args.studentId, {
      facePhotoId: args.facePhotoId,
      faceEncodingData: args.faceEncodingData,
      faceQualityScore: qualityScore,
      faceDataSetupAt: Date.now(),
      faceDataVerified: true,
      faceDataSetupBy: userProfile._id,
    });

    return { 
      success: true, 
      message: "Face data setup completed successfully",
      qualityScore: qualityScore
    };
  },
});

// Get students with face data setup with enhanced filtering
export const getStudentsWithFaceData = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    includeQualityScores: v.optional(v.boolean()),
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

    if (!userProfile || !["teacher", "admin"].includes(userProfile.role)) {
      return [];
    }

    let students;
    if (args.subjectId) {
      // Get enrolled students for specific subject
      const enrollments = await ctx.db
        .query("subjectEnrollments")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const studentIds = enrollments.map(e => e.studentId);
      students = await Promise.all(
        studentIds.map(id => ctx.db.get(id))
      );
      students = students.filter(Boolean);
    } else {
      // Get all students
      students = await ctx.db
        .query("userProfiles")
        .withIndex("by_role", (q) => q.eq("role", "student"))
        .collect();
    }

    // Filter students with face data and enhance with quality information
    const studentsWithFaceData = students
      .filter((student: any) => 
        student && student.faceDataVerified && student.faceEncodingData
      )
      .map((student: any) => ({
        ...student,
        faceQualityScore: student.faceQualityScore || 0.85,
        faceDataAge: student.faceDataSetupAt ? Date.now() - student.faceDataSetupAt : 0,
        isQualityGood: (student.faceQualityScore || 0.85) >= 0.80,
      }));

    return studentsWithFaceData;
  },
});

// Generate upload URL for face photos
export const generateFacePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Enhanced face photo processing with quality assessment
export const processFacePhoto = action({
  args: {
    studentId: v.id("userProfiles"),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Simulate enhanced face processing with quality assessment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate face quality analysis
    const qualityScore = 0.75 + (Math.random() * 0.25); // 75-100%
    const hasMultipleFaces = Math.random() < 0.1; // 10% chance of multiple faces
    const isBlurry = Math.random() < 0.15; // 15% chance of blur
    const isPoorLighting = Math.random() < 0.2; // 20% chance of poor lighting

    if (hasMultipleFaces) {
      throw new Error("Multiple faces detected. Please ensure only one person is in the photo.");
    }

    if (isBlurry) {
      throw new Error("Image is too blurry. Please take a clearer photo.");
    }

    if (isPoorLighting) {
      throw new Error("Poor lighting conditions. Please take photo in better lighting.");
    }

    if (qualityScore < 0.75) {
      throw new Error("Face photo quality is insufficient for reliable recognition.");
    }

    // Generate enhanced face encoding with quality metadata
    const mockFaceEncoding = JSON.stringify({
      encoding: new Array(128).fill(0).map(() => Math.random()),
      timestamp: Date.now(),
      confidence: 0.95,
      qualityScore: qualityScore,
      processingVersion: "2.0",
      features: {
        eyeDistance: Math.random() * 0.1 + 0.1,
        faceAngle: Math.random() * 10 - 5,
        illumination: Math.random() * 0.3 + 0.7,
        sharpness: qualityScore
      }
    });

    await ctx.runMutation(api.faceRecognition.setupStudentFaceData, {
      studentId: args.studentId,
      facePhotoId: args.imageStorageId,
      faceEncodingData: mockFaceEncoding,
      faceQualityScore: qualityScore,
    });

    return { 
      success: true, 
      message: "Face data processed successfully",
      qualityScore: qualityScore,
      qualityGrade: qualityScore >= 0.90 ? "Excellent" : 
                   qualityScore >= 0.85 ? "Very Good" :
                   qualityScore >= 0.80 ? "Good" : "Acceptable"
    };
  },
});

// Get face recognition statistics for admin/teacher dashboard
export const getFaceRecognitionStats = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (!userProfile || !["teacher", "admin"].includes(userProfile.role)) {
      return null;
    }

    // Get face recognition logs
    let logs = await ctx.db.query("faceRecognitionLogs").collect();

    // Filter by subject if specified
    if (args.subjectId) {
      const sessions = await ctx.db
        .query("attendanceSessions")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect();
      
      const sessionIds = sessions.map(s => s._id);
      logs = logs.filter(log => sessionIds.includes(log.sessionId));
    }

    // Filter by date range
    if (args.startDate) {
      logs = logs.filter(log => log.timestamp >= args.startDate!);
    }
    if (args.endDate) {
      logs = logs.filter(log => log.timestamp <= args.endDate!);
    }

    const totalAttempts = logs.length;
    const successfulRecognitions = logs.filter(log => log.recognitionResult.success).length;
    const autoProcessed = logs.filter(log => log.recognitionResult.autoProcessed === true).length;
    
    const confidenceScores = logs
      .filter(log => log.recognitionResult.confidence !== undefined)
      .map(log => log.recognitionResult.confidence!)
      .filter((conf): conf is number => conf !== undefined);
    
    const avgConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length 
      : 0;

    const livenessScores = logs
      .filter(log => log.recognitionResult.livenessScore !== undefined)
      .map(log => log.recognitionResult.livenessScore!)
      .filter((score): score is number => score !== undefined);
    
    const avgLiveness = livenessScores.length > 0
      ? livenessScores.reduce((sum, score) => sum + score, 0) / livenessScores.length
      : 0;

    return {
      totalAttempts,
      successfulRecognitions,
      autoProcessed,
      successRate: totalAttempts > 0 ? (successfulRecognitions / totalAttempts) * 100 : 0,
      autoProcessingRate: totalAttempts > 0 ? (autoProcessed / totalAttempts) * 100 : 0,
      avgConfidence: avgConfidence * 100,
      avgLiveness: avgLiveness * 100,
      dateRange: {
        start: args.startDate,
        end: args.endDate
      }
    };
  },
});
