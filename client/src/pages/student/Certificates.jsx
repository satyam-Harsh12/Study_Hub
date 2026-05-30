import React, { useEffect, useState } from 'react';
import { getMyCertificates } from '../../api/certificateApi';
import { Award, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await getMyCertificates();
      setCertificates(res.data || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (cert) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [842, 595] // A4 landscape in pixels
    });

    const pageWidth = 842;
    const pageHeight = 595;

    // Background gradient effect (simulated with rectangles)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Decorative top gradient bar
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 15, pageWidth, 10, 'F');

    // Main border - double line effect
    doc.setDrawColor(79, 70, 229); // indigo-600
    doc.setLineWidth(4);
    doc.rect(40, 50, pageWidth - 80, pageHeight - 100);

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(1);
    doc.rect(50, 60, pageWidth - 100, pageHeight - 120);

    // Corner decorations
    const drawCornerDecoration = (x, y, rotation) => {
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(2);
      const size = 30;
      // Save the current transformation
      doc.saveGraphicsState();
      // Translate and rotate
      doc.setLineCap('round');
      // Draw decorative corner lines
      doc.line(x, y, x + size, y);
      doc.line(x, y, x, y + size);
      doc.restoreGraphicsState();
    };

    drawCornerDecoration(60, 70, 0);
    drawCornerDecoration(pageWidth - 60, 70, 90);
    drawCornerDecoration(60, pageHeight - 70, 270);
    drawCornerDecoration(pageWidth - 60, pageHeight - 70, 180);

    // Award seal/badge (decorative circle)
    doc.setFillColor(254, 243, 199); // amber-100
    doc.circle(pageWidth / 2, 140, 35, 'F');
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.setLineWidth(3);
    doc.circle(pageWidth / 2, 140, 35);

    // Inner circle
    doc.setFillColor(251, 191, 36); // amber-400
    doc.circle(pageWidth / 2, 140, 25, 'F');

    // Award icon (star simulation with text)
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('★', pageWidth / 2, 148, { align: 'center' });

    // Title
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE', pageWidth / 2, 220, { align: 'center' });

    doc.setFontSize(28);
    doc.setFont('helvetica', 'normal');
    doc.text('OF COMPLETION', pageWidth / 2, 250, { align: 'center' });

    // Decorative line
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 100, 265, pageWidth / 2 + 100, 265);

    // Body text
    doc.setFontSize(16);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('This is to certify that', pageWidth / 2, 295, { align: 'center' });

    // Student name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(cert.student?.name || 'Student Name', pageWidth / 2, 330, { align: 'center' });

    // Underline for name
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    const nameWidth = doc.getTextWidth(cert.student?.name || 'Student Name');
    doc.line(pageWidth / 2 - nameWidth / 2 - 20, 335, pageWidth / 2 + nameWidth / 2 + 20, 335);

    // Course completion text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('has successfully completed the course', pageWidth / 2, 365, { align: 'center' });

    // Course title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(cert.course?.title || 'Course Title', pageWidth / 2, 400, { align: 'center' });

    // Issue date
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      `Issued on ${new Date(cert.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`,
      pageWidth / 2,
      435,
      { align: 'center' }
    );

    // Instructor signature section
    const instructorName = cert.course?.instructor?.name || 'Instructor';
    const signatureY = 490;

    // Signature line
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 120, signatureY, pageWidth / 2 + 120, signatureY);

    // Signature (handwritten style simulation)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(instructorName, pageWidth / 2, signatureY - 8, { align: 'center' });

    // Instructor title
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Course Instructor', pageWidth / 2, signatureY + 15, { align: 'center' });

    // Certificate ID (bottom)
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Certificate ID: ${cert.certificateId}`,
      pageWidth / 2,
      pageHeight - 25,
      { align: 'center' }
    );

    // Footer branding
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text('Training Center • E-Learning Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    const fileName = `${cert.course?.title?.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`;
    doc.save(fileName);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your awards...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Award className="text-indigo-600 w-8 h-8" />
          My Certificates
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Celebrating your educational achievements and milestones.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
          <Award className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <h3 className="text-slate-400 font-medium">No certificates earned yet.</h3>
          <p className="text-slate-300 text-xs mt-1">Complete courses with 100% progress to get certified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={120} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
                  <ShieldCheck size={14} />
                  Verified Credential
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate pr-12">
                  {cert.course?.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                  <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                  <span>ID: {cert.certificateId}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF(cert)}
                    className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates;
