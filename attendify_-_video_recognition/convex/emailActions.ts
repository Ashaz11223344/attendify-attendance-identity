"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import * as nodemailer from "nodemailer";

// Send report email with attachment using dedicated reports email
export const sendReportEmail = action({
  args: {
    recipients: v.array(v.string()),
    subject: v.string(),
    message: v.string(),
    reportData: v.any(),
    fileContent: v.string(),
    fileName: v.string(),
    fileFormat: v.union(v.literal("csv"), v.literal("excel")),
  },
  handler: async (ctx, args) => {
    try {
      // Create Gmail transporter for REPORTS
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifyreports@gmail.com',
          pass: 'eovfyypejjetdqdn'
        }
      });

      const reportSummary = generateReportSummaryHTML(args.reportData);
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📊 Attendify Reports</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Attendance Report Generated</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: #1976d2; margin: 0 0 10px 0; font-size: 20px;">📈 Report Summary</h2>
              <p style="color: #1976d2; margin: 0;">Your requested attendance report has been generated and is attached to this email.</p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Report Details</h3>
              ${reportSummary}
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Custom Message</h3>
              <p style="color: #666; line-height: 1.6; margin: 0;">${args.message}</p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                <strong>📎 Attachment:</strong> The detailed report is attached as a ${args.fileFormat.toUpperCase()} file: <strong>${args.fileName}</strong>
              </p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const results = [];
      
      for (const recipient of args.recipients) {
        try {
          const mailOptions = {
            from: '"Attendify Reports" <attendifyreports@gmail.com>',
            to: recipient,
            subject: args.subject,
            html: emailHtml,
            attachments: [
              {
                filename: args.fileName,
                content: Buffer.from(args.fileContent, 'utf-8'),
                contentType: args.fileFormat === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              },
            ],
          };

          const info = await transporter.sendMail(mailOptions);
          
          results.push({ 
            email: recipient, 
            success: true, 
            messageId: info.messageId 
          });
        } catch (error) {
          console.error('Email sending error:', error);
          results.push({ 
            email: recipient, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === 0) {
        throw new Error(`Failed to send emails to all recipients: ${results.map(r => r.error).join(', ')}`);
      }
      
      return {
        success: true,
        results,
        message: `Sent ${successCount} of ${totalCount} emails successfully`,
      };
    } catch (error) {
      console.error('Email action error:', error);
      throw new Error(`Failed to send report emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send notification email using support email
export const sendNotificationEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    message: v.string(),
    type: v.optional(v.union(v.literal("info"), v.literal("warning"), v.literal("success"), v.literal("error"))),
  },
  handler: async (ctx, args) => {
    try {
      // Create Gmail transporter for NOTIFICATIONS/SUPPORT
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const typeColors = {
        info: { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
      };

      const colors = typeColors[args.type || 'info'];

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Attendify Notification</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: ${colors.text}; margin: 0 0 10px 0; font-size: 18px;">${args.subject}</h2>
              <p style="color: ${colors.text}; margin: 0; line-height: 1.6;">${args.message}</p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify System" <attendifysupp@gmail.com>',
        to: args.to,
        subject: args.subject,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Notification email error:', error);
      throw new Error(`Failed to send notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send attendance notification email using support email
export const sendAttendanceNotificationEmail = action({
  args: {
    to: v.string(),
    studentName: v.string(),
    subjectName: v.string(),
    status: v.string(),
    date: v.string(),
    sessionName: v.string(),
    teacherName: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Create Gmail transporter for ATTENDANCE NOTIFICATIONS
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const statusColors = {
        present: { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✅' },
        late: { bg: '#fff3cd', border: '#ffc107', text: '#856404', icon: '⏰' },
        absent: { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '❌' },
        on_leave: { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2', icon: '📋' },
      };

      const statusInfo = statusColors[args.status as keyof typeof statusColors] || statusColors.present;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📚 Attendify Attendance Update</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: ${statusInfo.bg}; border-left: 4px solid ${statusInfo.border}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: ${statusInfo.text}; margin: 0 0 10px 0; font-size: 18px;">
                ${statusInfo.icon} Attendance Status: ${args.status.toUpperCase().replace('_', ' ')}
              </h2>
              <p style="color: ${statusInfo.text}; margin: 0; line-height: 1.6;">
                ${args.studentName} has been marked as <strong>${args.status.replace('_', ' ')}</strong> for ${args.subjectName}.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Session Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Student:</td><td style="padding: 8px 0; color: #333;">${args.studentName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td><td style="padding: 8px 0; color: #333;">${args.subjectName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Session:</td><td style="padding: 8px 0; color: #333;">${args.sessionName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Teacher:</td><td style="padding: 8px 0; color: #333;">${args.teacherName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Date:</td><td style="padding: 8px 0; color: #333;">${args.date}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Status:</td><td style="padding: 8px 0; color: #333;">${args.status.replace('_', ' ').toUpperCase()}</td></tr>
                ${args.notes ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Notes:</td><td style="padding: 8px 0; color: #333;">${args.notes}</td></tr>` : ''}
              </table>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify Attendance" <attendifysupp@gmail.com>',
        to: args.to,
        subject: `Attendance Update: ${args.studentName} - ${args.subjectName}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Attendance notification email sent successfully'
      };
    } catch (error) {
      console.error('Attendance notification email error:', error);
      throw new Error(`Failed to send attendance notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Helper function to generate report summary HTML
function generateReportSummaryHTML(reportData: any): string {
  const data = reportData.data;
  
  switch (reportData.type) {
    case "summary":
      return `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Report Type:</td><td style="padding: 8px 0; color: #333;">Summary Report</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Sessions:</td><td style="padding: 8px 0; color: #333;">${data.totalSessions}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Students:</td><td style="padding: 8px 0; color: #333;">${data.totalStudents}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Records:</td><td style="padding: 8px 0; color: #333;">${data.totalRecords}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Present:</td><td style="padding: 8px 0; color: #333;">${data.presentCount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Late:</td><td style="padding: 8px 0; color: #333;">${data.lateCount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">On Leave:</td><td style="padding: 8px 0; color: #333;">${data.onLeaveCount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Attendance Rate:</td><td style="padding: 8px 0; color: #333;">${data.attendanceRate}%</td></tr>
        </table>
      `;
    case "detailed":
      return `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Report Type:</td><td style="padding: 8px 0; color: #333;">Detailed Report</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Records:</td><td style="padding: 8px 0; color: #333;">${data.length}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Date Range:</td><td style="padding: 8px 0; color: #333;">All available data</td></tr>
        </table>
      `;
    case "student_wise":
      return `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Report Type:</td><td style="padding: 8px 0; color: #333;">Student-wise Report</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Students:</td><td style="padding: 8px 0; color: #333;">${data.length}</td></tr>
        </table>
      `;
    case "subject_wise":
      return `
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Report Type:</td><td style="padding: 8px 0; color: #333;">Subject-wise Report</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Total Subjects:</td><td style="padding: 8px 0; color: #333;">${data.length}</td></tr>
        </table>
      `;
    default:
      return `<p>Report generated successfully</p>`;
  }
}
