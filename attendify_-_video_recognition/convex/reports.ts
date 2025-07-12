import { v } from "convex/values";
import { query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Generate attendance report data
export const generateAttendanceReport = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    studentId: v.optional(v.id("userProfiles")),
    reportType: v.union(v.literal("summary"), v.literal("detailed"), v.literal("student_wise"), v.literal("subject_wise")),
  },
  handler: async (ctx, args) => {
    // Build query filters
    let attendanceQuery = ctx.db.query("attendance");
    
    // Apply filters
    if (args.startDate) {
      const startTimestamp = new Date(args.startDate).getTime();
      attendanceQuery = attendanceQuery.filter((q) => q.gte(q.field("date"), startTimestamp));
    }
    
    if (args.endDate) {
      const endTimestamp = new Date(args.endDate).getTime();
      attendanceQuery = attendanceQuery.filter((q) => q.lte(q.field("date"), endTimestamp));
    }

    const attendanceRecords = await attendanceQuery.collect();
    
    // Get related data
    const sessions = await ctx.db.query("attendanceSessions").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const profiles = await ctx.db.query("userProfiles").collect();
    
    // Create lookup maps
    const sessionMap = new Map(sessions.map(s => [s._id, s]));
    const subjectMap = new Map(subjects.map(s => [s._id, s]));
    const profileMap = new Map(profiles.map(p => [p._id, p]));
    
    // Filter records based on criteria
    let filteredRecords = attendanceRecords.filter(record => {
      const session = sessionMap.get(record.sessionId);
      if (!session) return false;
      
      if (args.subjectId && session.subjectId !== args.subjectId) return false;
      if (args.studentId && record.studentId !== args.studentId) return false;
      
      return true;
    });

    // Generate report based on type
    switch (args.reportType) {
      case "summary":
        return generateSummaryReport(filteredRecords, sessionMap, subjectMap, profileMap);
      case "detailed":
        return generateDetailedReport(filteredRecords, sessionMap, subjectMap, profileMap);
      case "student_wise":
        return generateStudentWiseReport(filteredRecords, sessionMap, subjectMap, profileMap);
      case "subject_wise":
        return generateSubjectWiseReport(filteredRecords, sessionMap, subjectMap, profileMap);
      default:
        return generateSummaryReport(filteredRecords, sessionMap, subjectMap, profileMap);
    }
  },
});

// Helper functions for different report types
function generateSummaryReport(records: any[], sessionMap: Map<any, any>, subjectMap: Map<any, any>, profileMap: Map<any, any>) {
  const totalSessions = new Set(records.map(r => r.sessionId)).size;
  const totalStudents = new Set(records.map(r => r.studentId)).size;
  const presentCount = records.filter(r => r.status === "present").length;
  const lateCount = records.filter(r => r.status === "late").length;
  const onLeaveCount = records.filter(r => r.status === "on_leave").length;
  
  const attendanceRate = totalSessions > 0 ? ((presentCount + lateCount) / records.length * 100) : 0;
  
  return {
    type: "summary",
    data: {
      totalSessions,
      totalStudents,
      totalRecords: records.length,
      presentCount,
      lateCount,
      onLeaveCount,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
    },
    generatedAt: new Date().toISOString(),
  };
}

function generateDetailedReport(records: any[], sessionMap: Map<any, any>, subjectMap: Map<any, any>, profileMap: Map<any, any>) {
  const detailedData = records.map(record => {
    const session = sessionMap.get(record.sessionId);
    const subject = session ? subjectMap.get(session.subjectId) : null;
    const student = profileMap.get(record.studentId);
    
    return {
      studentId: record.studentId,
      studentName: student?.name || "Unknown",
      studentNumber: student?.studentId || "N/A",
      subjectCode: subject?.code || "N/A",
      subjectName: subject?.name || "Unknown",
      sessionName: session?.sessionName || "Unknown",
      date: session ? new Date(session.date).toLocaleDateString() : "Unknown",
      time: session ? new Date(session.date).toLocaleTimeString() : "Unknown",
      status: record.status,
      attendanceMode: record.attendanceMode || "manual",
      confidence: record.faceRecognitionData?.confidence || null,
      timestamp: new Date(record.date).toLocaleString(),
    };
  });

  return {
    type: "detailed",
    data: detailedData,
    generatedAt: new Date().toISOString(),
  };
}

function generateStudentWiseReport(records: any[], sessionMap: Map<any, any>, subjectMap: Map<any, any>, profileMap: Map<any, any>) {
  const studentStats = new Map();
  
  records.forEach(record => {
    const student = profileMap.get(record.studentId);
    const session = sessionMap.get(record.sessionId);
    const subject = session ? subjectMap.get(session.subjectId) : null;
    
    if (!studentStats.has(record.studentId)) {
      studentStats.set(record.studentId, {
        studentId: record.studentId,
        studentName: student?.name || "Unknown",
        studentNumber: student?.studentId || "N/A",
        department: student?.department || "N/A",
        totalSessions: 0,
        presentCount: 0,
        lateCount: 0,
        onLeaveCount: 0,
        subjects: new Set(),
      });
    }
    
    const stats = studentStats.get(record.studentId);
    stats.totalSessions++;
    if (record.status === "present") stats.presentCount++;
    else if (record.status === "late") stats.lateCount++;
    else if (record.status === "on_leave") stats.onLeaveCount++;
    
    if (subject) stats.subjects.add(subject.name);
  });
  
  const studentData = Array.from(studentStats.values()).map(stats => ({
    ...stats,
    subjects: Array.from(stats.subjects).join(", "),
    attendanceRate: stats.totalSessions > 0 ? 
      Math.round(((stats.presentCount + stats.lateCount) / stats.totalSessions) * 10000) / 100 : 0,
  }));

  return {
    type: "student_wise",
    data: studentData,
    generatedAt: new Date().toISOString(),
  };
}

function generateSubjectWiseReport(records: any[], sessionMap: Map<any, any>, subjectMap: Map<any, any>, profileMap: Map<any, any>) {
  const subjectStats = new Map();
  
  records.forEach(record => {
    const session = sessionMap.get(record.sessionId);
    const subject = session ? subjectMap.get(session.subjectId) : null;
    
    if (!subject) return;
    
    if (!subjectStats.has(subject._id)) {
      subjectStats.set(subject._id, {
        subjectId: subject._id,
        subjectCode: subject.code,
        subjectName: subject.name,
        department: subject.department || "N/A",
        totalSessions: new Set(),
        totalStudents: new Set(),
        presentCount: 0,
        lateCount: 0,
        onLeaveCount: 0,
      });
    }
    
    const stats = subjectStats.get(subject._id);
    stats.totalSessions.add(record.sessionId);
    stats.totalStudents.add(record.studentId);
    
    if (record.status === "present") stats.presentCount++;
    else if (record.status === "late") stats.lateCount++;
    else if (record.status === "on_leave") stats.onLeaveCount++;
  });
  
  const subjectData = Array.from(subjectStats.values()).map(stats => ({
    ...stats,
    totalSessions: stats.totalSessions.size,
    totalStudents: stats.totalStudents.size,
    totalRecords: stats.presentCount + stats.lateCount + stats.onLeaveCount,
    attendanceRate: (stats.presentCount + stats.lateCount + stats.onLeaveCount) > 0 ? 
      Math.round(((stats.presentCount + stats.lateCount) / (stats.presentCount + stats.lateCount + stats.onLeaveCount)) * 10000) / 100 : 0,
  }));

  return {
    type: "subject_wise",
    data: subjectData,
    generatedAt: new Date().toISOString(),
  };
}

// Generate and send report via email
export const generateAndEmailReport = action({
  args: {
    reportConfig: v.object({
      subjectId: v.optional(v.id("subjects")),
      startDate: v.optional(v.string()),
      endDate: v.optional(v.string()),
      studentId: v.optional(v.id("userProfiles")),
      reportType: v.union(v.literal("summary"), v.literal("detailed"), v.literal("student_wise"), v.literal("subject_wise")),
    }),
    emailConfig: v.object({
      recipients: v.array(v.string()),
      subject: v.string(),
      message: v.string(),
      format: v.union(v.literal("csv"), v.literal("excel")),
    }),
  },
  handler: async (ctx, args): Promise<any> => {
    try {
      // Generate the report
      const reportData: any = await ctx.runQuery(api.reports.generateAttendanceReport, args.reportConfig);
      
      // Generate the file content
      const fileContent: string = args.emailConfig.format === "csv" 
        ? generateCSV(reportData)
        : generateExcel(reportData);
      
      // Create filename
      const fileName = `attendance_report_${reportData.type}_${new Date().toISOString().split('T')[0]}.${args.emailConfig.format}`;
      
      // Send email with attachment
      const result: any = await ctx.runAction(api.emailActions.sendReportEmail, {
        recipients: args.emailConfig.recipients,
        subject: args.emailConfig.subject,
        message: args.emailConfig.message,
        reportData: reportData,
        fileContent: fileContent,
        fileName: fileName,
        fileFormat: args.emailConfig.format,
      });
      
      return result;
    } catch (error) {
      console.error("Report generation and email failed:", error);
      throw new Error(`Failed to generate and send report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Helper function to generate CSV content
function generateCSV(reportData: any): string {
  if (!reportData.data) {
    return "No data available";
  }

  // Handle different report types
  let data: any[] = [];
  
  if (reportData.type === "summary") {
    // For summary reports, convert the summary object to an array
    data = [reportData.data];
  } else if (Array.isArray(reportData.data)) {
    data = reportData.data;
  } else {
    data = [reportData.data];
  }

  if (data.length === 0) {
    return "No data available";
  }

  const headers = Object.keys(data[0]);
  
  let csv = headers.join(",") + "\n";
  
  data.forEach((row: any) => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return "";
      }
      // Convert to string and escape commas and quotes in CSV
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csv += values.join(",") + "\n";
  });
  
  return csv;
}

// Helper function to generate Excel content (simplified CSV for now)
function generateExcel(reportData: any): string {
  // For simplicity, we'll use CSV format
  // In a real implementation, you'd use a library like xlsx
  return generateCSV(reportData);
}
