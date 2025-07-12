"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import * as nodemailer from "nodemailer";

// Send parent notification email for attendance
export const sendParentNotificationEmail = action({
  args: {
    parentEmail: v.string(),
    studentName: v.string(),
    subjectName: v.string(),
    sessionName: v.string(),
    teacherName: v.string(),
    status: v.string(),
    date: v.string(),
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

      const statusEmojis = {
        present: '✅',
        late: '⏰',
        absent: '❌',
        on_leave: '📋'
      };

      const statusColors = {
        present: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        late: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        absent: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        on_leave: { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' },
      };

      const emoji = statusEmojis[args.status as keyof typeof statusEmojis] || '📚';
      const colors = statusColors[args.status as keyof typeof statusColors] || statusColors.present;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📚 Attendify - Attendance Notification</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your child's attendance update</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: ${colors.text}; margin: 0 0 10px 0; font-size: 18px;">
                ${emoji} Attendance Status: ${args.status.toUpperCase().replace('_', ' ')}
              </h2>
              <p style="color: ${colors.text}; margin: 0; line-height: 1.6;">
                Your child <strong>${args.studentName}</strong> has been marked as <strong>${args.status.replace('_', ' ')}</strong> for today's class.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Class Details</h3>
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
            
            ${args.status === 'absent' ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important:</strong> If your child was supposed to be in class today, please contact the teacher or school administration to clarify the absence.
              </p>
            </div>
            ` : ''}
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1976d2;">
                <strong>📞 Need Help?</strong> If you have any questions about this attendance record, please contact your child's teacher or the school administration.
              </p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This is an automated notification sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify School System" <attendifysupp@gmail.com>',
        to: args.parentEmail,
        subject: `🚨 Attendance Alert: ${args.studentName} - ${args.subjectName} (${args.status.replace('_', ' ').toUpperCase()})`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Parent notification email sent successfully'
      };
    } catch (error) {
      console.error('Parent notification email error:', error);
      throw new Error(`Failed to send parent notification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send leave request notification to teacher
export const sendLeaveRequestNotificationEmail = action({
  args: {
    to: v.string(),
    studentName: v.string(),
    teacherName: v.string(),
    subjectName: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    description: v.string(),
    submittedAt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Attendify - Leave Request Notification</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">New leave request requires your attention</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: #856404; margin: 0 0 10px 0; font-size: 18px;">
                📝 New Leave Request Submitted
              </h2>
              <p style="color: #856404; margin: 0; line-height: 1.6;">
                Dear <strong>${args.teacherName}</strong>, a student has submitted a leave request that requires your review.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Leave Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Student:</td><td style="padding: 8px 0; color: #333;">${args.studentName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td><td style="padding: 8px 0; color: #333;">${args.subjectName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Start Date:</td><td style="padding: 8px 0; color: #333;">${args.startDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">End Date:</td><td style="padding: 8px 0; color: #333;">${args.endDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Reason:</td><td style="padding: 8px 0; color: #333;">${args.reason}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Submitted:</td><td style="padding: 8px 0; color: #333;">${args.submittedAt}</td></tr>
                ${args.description ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666; vertical-align: top;">Description:</td><td style="padding: 8px 0; color: #333;">${args.description}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1976d2;">
                <strong>⏰ Action Required:</strong> Please log into the Attendify system to review and approve/reject this leave request.
              </p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This notification was sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify Leave System" <attendifysupp@gmail.com>',
        to: args.to,
        subject: `📋 Leave Request: ${args.studentName} - ${args.subjectName} (${args.startDate} to ${args.endDate})`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Leave request notification sent successfully'
      };
    } catch (error) {
      console.error('Leave request notification error:', error);
      throw new Error(`Failed to send leave request notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send leave request notification to parent
export const sendLeaveRequestParentNotificationEmail = action({
  args: {
    to: v.string(),
    studentName: v.string(),
    subjectName: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    description: v.string(),
    submittedAt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Attendify - Leave Request Confirmation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Leave request submitted successfully</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: #155724; margin: 0 0 10px 0; font-size: 18px;">
                ✅ Leave Request Submitted
              </h2>
              <p style="color: #155724; margin: 0; line-height: 1.6;">
                Your child <strong>${args.studentName}</strong>'s leave request has been successfully submitted and is now pending teacher approval.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Leave Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Student:</td><td style="padding: 8px 0; color: #333;">${args.studentName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td><td style="padding: 8px 0; color: #333;">${args.subjectName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Start Date:</td><td style="padding: 8px 0; color: #333;">${args.startDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">End Date:</td><td style="padding: 8px 0; color: #333;">${args.endDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Reason:</td><td style="padding: 8px 0; color: #333;">${args.reason}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Submitted:</td><td style="padding: 8px 0; color: #333;">${args.submittedAt}</td></tr>
                ${args.description ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666; vertical-align: top;">Description:</td><td style="padding: 8px 0; color: #333;">${args.description}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1976d2;">
                <strong>📧 Next Steps:</strong> You will receive another email notification once the teacher reviews and responds to this leave request.
              </p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This confirmation was sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify Leave System" <attendifysupp@gmail.com>',
        to: args.to,
        subject: `📋 Leave Request Submitted: ${args.studentName} - ${args.subjectName}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Parent leave request confirmation sent successfully'
      };
    } catch (error) {
      console.error('Parent leave request confirmation error:', error);
      throw new Error(`Failed to send parent leave request confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send leave request review notification
export const sendLeaveRequestReviewNotificationEmail = action({
  args: {
    to: v.string(),
    studentName: v.string(),
    subjectName: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.string(),
    status: v.string(),
    reviewerName: v.string(),
    reviewNotes: v.string(),
    reviewedAt: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const statusColors = {
        approved: { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✅' },
        rejected: { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '❌' },
      };

      const colors = statusColors[args.status as keyof typeof statusColors] || statusColors.approved;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Attendify - Leave Request Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your leave request has been reviewed</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
              <h2 style="color: ${colors.text}; margin: 0 0 10px 0; font-size: 18px;">
                ${colors.icon} Leave Request ${args.status.toUpperCase()}
              </h2>
              <p style="color: ${colors.text}; margin: 0; line-height: 1.6;">
                Your child <strong>${args.studentName}</strong>'s leave request has been <strong>${args.status}</strong> by ${args.reviewerName}.
              </p>
            </div>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Leave Request Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Student:</td><td style="padding: 8px 0; color: #333;">${args.studentName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td><td style="padding: 8px 0; color: #333;">${args.subjectName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Start Date:</td><td style="padding: 8px 0; color: #333;">${args.startDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">End Date:</td><td style="padding: 8px 0; color: #333;">${args.endDate}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Reason:</td><td style="padding: 8px 0; color: #333;">${args.reason}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Status:</td><td style="padding: 8px 0; color: #333;"><strong>${args.status.toUpperCase()}</strong></td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Reviewed By:</td><td style="padding: 8px 0; color: #333;">${args.reviewerName}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Reviewed On:</td><td style="padding: 8px 0; color: #333;">${args.reviewedAt}</td></tr>
                ${args.reviewNotes ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666; vertical-align: top;">Review Notes:</td><td style="padding: 8px 0; color: #333;">${args.reviewNotes}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1976d2;">
                <strong>📞 Questions?</strong> If you have any questions about this decision, please contact your child's teacher or the school administration.
              </p>
            </div>
          </div>
          
          <div style="background: #6c757d; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">© 2024 Attendify - Smart Attendance Management System</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">This notification was sent on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: '"Attendify Leave System" <attendifysupp@gmail.com>',
        to: args.to,
        subject: `📋 Leave Request ${args.status.toUpperCase()}: ${args.studentName} - ${args.subjectName}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Leave request review notification sent successfully'
      };
    } catch (error) {
      console.error('Leave request review notification error:', error);
      throw new Error(`Failed to send leave request review notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Test email connectivity
export const testEmailConnectivity = action({
  args: { testEmail: v.string() },
  handler: async (ctx, args) => {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      await transporter.verify();
      
      const info = await transporter.sendMail({
        from: '"Attendify Test" <attendifysupp@gmail.com>',
        to: args.testEmail,
        subject: '🔧 Attendify Email Test',
        html: '<h1>✅ Email system working!</h1><p>Test sent at: ' + new Date().toLocaleString() + '</p>',
      });
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email test failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

// Send bulk notification emails
export const sendBulkNotificationEmails = action({
  args: {
    recipients: v.array(v.object({
      email: v.string(),
      name: v.string(),
    })),
    subject: v.string(),
    message: v.string(),
    type: v.optional(v.union(v.literal("info"), v.literal("warning"), v.literal("success"), v.literal("error"))),
  },
  handler: async (ctx, args) => {
    try {
      // Create Gmail transporter for BULK NOTIFICATIONS
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'attendifysupp@gmail.com',
          pass: 'zyipxefvurxymteo'
        }
      });

      const typeColors = {
        info: { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2', icon: 'ℹ️' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404', icon: '⚠️' },
        success: { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '✅' },
        error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '❌' },
      };

      const colors = typeColors[args.type || 'info'];

      const results = [];
      
      for (const recipient of args.recipients) {
        try {
          const personalizedHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🔔 Attendify Notification</h1>
              </div>
              
              <div style="padding: 30px; background: white;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 16px;">Dear ${recipient.name},</p>
                
                <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
                  <h2 style="color: ${colors.text}; margin: 0 0 10px 0; font-size: 18px;">
                    ${colors.icon} ${args.subject}
                  </h2>
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
            to: recipient.email,
            subject: args.subject,
            html: personalizedHtml,
          };

          const info = await transporter.sendMail(mailOptions);
          
          results.push({ 
            email: recipient.email, 
            name: recipient.name,
            success: true, 
            messageId: info.messageId 
          });
        } catch (error) {
          console.error(`Email sending error for ${recipient.email}:`, error);
          results.push({ 
            email: recipient.email, 
            name: recipient.name,
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      return {
        success: successCount > 0,
        results,
        message: `Sent ${successCount} of ${totalCount} emails successfully`,
        successCount,
        totalCount
      };
    } catch (error) {
      console.error('Bulk notification email error:', error);
      throw new Error(`Failed to send bulk notification emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Send immediate notification
export const sendImmediateNotification = action({
  args: { to: v.string(), subject: v.string(), message: v.string() },
  handler: async (ctx, args) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'attendifysupp@gmail.com', pass: 'zyipxefvurxymteo' }
    });

    const info = await transporter.sendMail({
      from: '"Attendify Alert" <attendifysupp@gmail.com>',
      to: args.to,
      subject: args.subject,
      html: `<h3>🚨 ${args.subject}</h3><p>${args.message}</p><small>Sent: ${new Date().toLocaleString()}</small>`,
    });
    
    return { success: true, messageId: info.messageId };
  },
});
