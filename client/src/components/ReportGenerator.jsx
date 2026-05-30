import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { getMonthlyReport } from '../api/attendanceApi';
import { getStudentPerformanceReport } from '../api/reportApi';
import { FileText, Download, Loader2 } from 'lucide-react';

const ReportGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('attendance');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const handleDownload = async () => {
        setLoading(true);
        try {
            const doc = new jsPDF();
            const dateStr = `${month}-${year}`;
            
            if (reportType === 'attendance') {
                const res = await getMonthlyReport('', month, year); // Empty string for all courses in this alias/placeholder
                const data = res.data;
                
                doc.setFontSize(18);
                doc.text(`Monthly Attendance Report (${dateStr})`, 14, 22);
                doc.setFontSize(11);
                
                let y = 35;
                if (!data || data.length === 0) {
                    doc.text("No attendance data found for this period.", 14, y);
                } else {
                    data.forEach((student, index) => {
                        doc.text(`${index + 1}. ${student.studentName || 'Student'} - Status: ${student.statusCount?.Present || 0} Present, ${student.statusCount?.Absent || 0} Absent`, 14, y);
                        y += 10;
                        if (y > 280) {
                            doc.addPage();
                            y = 20;
                        }
                    });
                }
                doc.save(`Attendance_Report_${dateStr}.pdf`);
            } else {
                const res = await getStudentPerformanceReport('');
                const data = res.data;

                doc.setFontSize(18);
                doc.text(`Student Performance Report`, 14, 22);
                doc.setFontSize(11);

                let y = 35;
                if (!data || data.length === 0) {
                    doc.text("No performance data found.", 14, y);
                } else {
                    data.forEach((enrol, index) => {
                        doc.text(`${index + 1}. ${enrol.student} (${enrol.email})`, 14, y);
                        doc.text(`    Course: ${enrol.course} | Progress: ${enrol.progress}% | Grade: ${enrol.grade}% (${enrol.submissionsCount} submissions)`, 14, y + 6);
                        y += 14;
                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                    });
                }
                doc.save(`Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            }
        } catch (err) {
            console.error('Error generating report:', err);
            alert("Failed to generate report. Make sure you have the required permissions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mt-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Export Reports Toolkit
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                   <select 
                       className="w-full text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500"
                       value={reportType}
                       onChange={e => setReportType(e.target.value)}
                   >
                       <option value="attendance">Monthly Attendance PDF</option>
                       <option value="performance">Student Performance PDF</option>
                   </select>
                </div>
                
                {reportType === 'attendance' && (
                    <>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Month (1-12)</label>
                           <input 
                               type="number" min="1" max="12"
                               className="w-full text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500"
                               value={month}
                               onChange={e => setMonth(e.target.value)}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                           <input 
                               type="number" min="2020" max="2100"
                               className="w-full text-sm border-slate-300 rounded-lg py-2 focus:ring-indigo-500 focus:border-indigo-500"
                               value={year}
                               onChange={e => setYear(e.target.value)}
                           />
                        </div>
                    </>
                )}
                
                <div className={reportType === 'performance' ? 'md:col-span-3 text-right' : ''}>
                    <button 
                        onClick={handleDownload}
                        disabled={loading}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Generate PDF Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
