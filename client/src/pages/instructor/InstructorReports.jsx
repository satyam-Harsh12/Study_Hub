import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getInstructorPerformance } from '../../api/reportApi.js';
import ReportGenerator from '../../components/ReportGenerator.jsx';

const InstructorReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getInstructorPerformance();
        setData(res.data);
      } catch (err) {
        console.error('Error fetching instructor stats:', err);
        setError('Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { distribution, assessment, attendance, overview } = data;

  const COLORS = ['#94a3b8', '#60a5fa', '#818cf8', '#34d399']; // Colors for progress distribution

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtitle && <span className="text-xs text-slate-400 font-normal">{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>
          <p className="text-slate-500">Track student progress, assessment results, and engagement.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          icon={Users}
          color="bg-indigo-600"
          subtitle="Across all your courses"
        />
        <StatCard
          title="Avg Assessment Score"
          value={`${assessment?.avg || 0}%`}
          icon={TrendingUp}
          color="bg-emerald-600"
          subtitle={`Pass Rate: ${assessment?.passRate || 0}%`}
        />
        <StatCard
          title="Total Submissions"
          value={assessment?.total || 0}
          icon={BookOpen}
          color="bg-amber-600"
          subtitle="Graded assessments"
        />
        <StatCard
          title="Active Courses"
          value={overview?.totalCourses || 0}
          icon={Clock}
          color="bg-cyan-600"
          subtitle="Currently teaching"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Progress Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Student Progress Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Students" radius={[0, 4, 4, 0]} barSize={30}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-400 mt-2">
            Distribution of students based on course completion percentage.
          </div>
        </div>

        {/* Assessment & Pass Rate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Assessment Performance
          </h3>
          <div className="flex items-center justify-center h-[260px]">
            {/* Simple visualization for Pass/Fail if no per-course breakdown available yet in this endpoint */}
            <div className="text-center space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  <circle
                    cx="80" cy="80" r="70"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (assessment?.passRate || 0)) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-slate-800">{assessment?.passRate}%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Pass Rate</span>
                </div>
              </div>
              <div className="flex gap-8 justify-center mt-4">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{assessment?.avg}%</div>
                  <div className="text-xs text-slate-500">Avg Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{assessment?.total}</div>
                  <div className="text-xs text-slate-500">Submissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Attendance Summary (Live Sessions)
          </h3>
          <div className="h-[250px] w-full flex items-center justify-center gap-10">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendance}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] space-y-4">
              <p className="text-sm text-slate-600">
                This chart provides a summary of attendance status for scheduled live sessions.
                Ensure to mark attendance daily to keep this data accurate.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {attendance.map((a) => (
                  <div key={a.name} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase">{a.name}</div>
                    <div className="text-xl font-bold" style={{ color: a.color }}>{a.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PDF Export Section */}
      <ReportGenerator />
    </div>
  );
};

export default InstructorReports;
