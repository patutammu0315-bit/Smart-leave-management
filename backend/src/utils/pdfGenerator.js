const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generateLeavePDF(leave, res = null) {
  return new Promise(async (resolve, reject) => {
    try {
      const fromDate = new Date(leave.from_date);
      const toDate = new Date(leave.to_date);
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      let buffers = [];

      if (res) {
        doc.pipe(res);
      } else {
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
      }

      // __dirname is backend/src/utils
      const logoPath = path.join(__dirname, '../../../legacy_flask_app/static/ifet-banner-logo.png');

      // Page Border
      doc.rect(20, 20, 555.28, 801.89).lineWidth(0.5).stroke('black');

      const fontRegular = 'Times-Roman';
      const fontBold = 'Times-Bold';

      // Header Banner
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 30, { width: 495 });
      }
      
      doc.font(fontRegular).fontSize(10).text('Villupuram – 605108, Tamil Nadu', 0, 95, { align: 'center' });

      doc.moveDown(2);

      const title = leave.status === 'Approved' ? 'LEAVE APPROVAL LETTER' : 'LEAVE REQUEST LETTER';
      doc.font(fontBold).fontSize(14).text(title, 0, 125, { align: 'center', underline: true });
      
      doc.moveDown(2);

      let currentY = 160;
      
      // Date & Ref No
      const refNo = leave.approval_reference_no || `REF-${leave.id}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
      doc.font(fontBold).fontSize(11).text('Date:', 50, currentY);
      doc.font(fontRegular).text(new Date().toLocaleDateString(), 90, currentY);
      
      doc.font(fontBold).text('Ref No:', 350, currentY);
      doc.font(fontRegular).text(refNo, 400, currentY);
      
      currentY += 25;
      
      function drawSection(sectionTitle, data, y) {
        doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).stroke('black');
        y += 10;
        doc.font(fontBold).fontSize(12).text(sectionTitle, 50, y);
        y += 20;
        
        data.forEach(item => {
          doc.font(fontBold).fontSize(11).text(item.label + ':', 50, y);
          doc.font(fontRegular).text(item.value, 180, y);
          y += 18;
        });
        return y + 10;
      }

      // 3. Student Information
      const studentData = [
        { label: 'Student Name', value: leave.student.name || 'N/A' },
        { label: 'Register Number', value: leave.student.student_id || 'N/A' },
        { label: 'Department', value: leave.department },
        { label: 'Year/Semester', value: 'N/A' }
      ];
      currentY = drawSection('3. Student Information', studentData, currentY);

      // 4. Mentor Information
      const mentorData = [
        { label: 'Mentor Name', value: leave.approved_by || 'Not Assigned' },
        { label: 'Department', value: leave.department }
      ];
      currentY = drawSection('4. Mentor Information', mentorData, currentY);

      // 5. Leave Details
      const leaveData = [
        { label: 'Leave From', value: leave.from_date },
        { label: 'Leave To', value: leave.to_date },
        { label: 'Number of Days', value: `${diffDays}` },
        { label: 'Reason', value: leave.reason }
      ];
      currentY = drawSection('5. Leave Details', leaveData, currentY);

      // 6. Approval Status
      doc.moveTo(50, currentY).lineTo(545, currentY).lineWidth(0.5).stroke('black');
      currentY += 10;
      doc.font(fontBold).fontSize(12).text('6. Approval Status', 50, currentY);
      currentY += 20;
      
      doc.font(fontBold).fontSize(11).text('Status:', 50, currentY);
      doc.font(fontRegular).text(leave.status.toUpperCase(), 180, currentY);
      currentY += 25;

      // 7. Remarks
      if (leave.remarks && leave.remarks.trim() !== '') {
          doc.moveTo(50, currentY).lineTo(545, currentY).lineWidth(0.5).stroke('black');
          currentY += 10;
          doc.font(fontBold).fontSize(12).text('7. Remarks', 50, currentY);
          currentY += 20;
          doc.font(fontRegular).fontSize(11).text(leave.remarks, 50, currentY, { width: 495 });
          currentY += 40;
      } else {
          currentY += 10;
      }

      // Bottom signatures and QR Code
      currentY = 740;
      doc.moveTo(50, currentY - 30).lineTo(545, currentY - 30).lineWidth(0.5).stroke('black');
      
      doc.font(fontBold).fontSize(10);
      doc.text('Mentor Signature', 50, currentY);
      doc.text('HOD Signature', 250, currentY);
      doc.text('Principal Signature', 430, currentY);
      
      // QR Code
      if (leave.approval_reference_no && leave.status === 'Approved') {
        const verificationUrl = `http://localhost:5000/api/public/verify-leave/${leave.approval_reference_no}`;
        const qrDataUrl = await QRCode.toDataURL(verificationUrl);
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        doc.image(imgBuffer, 460, 610, { width: 80 });
        doc.fontSize(8).font(fontRegular).text('Scan to Verify', 470, 695);
      }

      doc.end();

      if (res) {
        resolve(); // resolve early for streaming
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateLeavePDF };
