import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import UpdatePassword from './pages/auth/UpdatePassword.jsx';
import CompleteProfile from './pages/auth/CompleteProfile.jsx';
import CourseList from './pages/courses/CourseList.jsx';
import CourseDetail from './pages/courses/CourseDetail.jsx';
import CourseContent from './pages/courses/CourseContent.jsx';

import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';
import InstructorDashboard from './pages/dashboard/InstructorDashboard.jsx';
import StudentDashboardOverview from './pages/dashboard/StudentDashboard.jsx';

import AdminCourses from './pages/admin/AdminCourses.jsx';
import AdminStudents from './pages/admin/AdminStudents.jsx';
import AdminInstructors from './pages/admin/AdminInstructors.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminNotifications from './pages/admin/AdminNotifications.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import AdminEnrollments from './pages/admin/AdminEnrollments.jsx';
import AdminSchedule from './pages/admin/AdminSchedule.jsx';
import AdminSiteManagement from './pages/admin/AdminSiteManagement.jsx';
import AdminTeam from './pages/admin/AdminTeam.jsx';

import InstructorCourses from './pages/instructor/InstructorCourses.jsx';
import InstructorSchedule from './pages/instructor/InstructorSchedule.jsx';
import InstructorAssessments from './pages/instructor/InstructorAssessments.jsx';
import InstructorReports from './pages/instructor/InstructorReports.jsx';

import MyCourses from './pages/student/MyCourses.jsx';
import StudentAssessments from './pages/student/StudentAssessments.jsx';
import Certificates from './pages/student/Certificates.jsx';
import StudentPayments from './pages/student/StudentPayments.jsx';
import Profile from './pages/profile/Profile.jsx';

import Checkout from './pages/payment/Checkout.jsx';
import MockGateway from './pages/payment/MockGateway.jsx';
import PaymentResult from './pages/payment/PaymentResult.jsx';

import Home from './pages/Home.jsx';
import ResourceLibrary from './pages/features/ResourceLibrary.jsx';
import LiveClasses from './pages/features/LiveClasses.jsx';
import Mentorship from './pages/features/Mentorship.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact.jsx';
import Footer from './components/layout/Footer.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';

// Role-based component selector for ERP routes
const ERPView = ({ AdminComp, InstructorComp, StudentComp }) => {
  const { user } = useAuth();
  const role = user?.role?.name || user?.role || 'student';
  const isAdmin = ['admin', 'super_admin', 'course_admin', 'finance_admin', 'hr_admin'].includes(role);
  
  if (isAdmin && AdminComp) return <AdminComp />;
  if (role === 'instructor' && InstructorComp) return <InstructorComp />;
  if (role === 'student' && StudentComp) return <StudentComp />;
  
  // Fallbacks if exactly matched component isn't provided
  if (isAdmin && InstructorComp) return <InstructorComp />;
  if (StudentComp) return <StudentComp />;
  
  return <div className="p-8 text-center text-slate-500">Access Restricted</div>;
};

const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
     <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
     <p className="text-slate-500">This module is currently being integrated into the ERP dashboard.</p>
  </div>
);

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />

          {/* Feature Routes */}
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/mentorship" element={<Mentorship />} />

          {/* Fallback legacy routes redirecting to ERP */}
          <Route path="/dashboard/admin/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/instructor/*" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/student/*" element={<Navigate to="/dashboard" replace />} />

          <Route element={<PrivateRoute />}>
            <Route path="/courses/:courseId/content" element={<CourseContent />} />
            <Route path="/checkout/:courseId" element={<Checkout />} />
            <Route path="/payment/mock/:paymentId" element={<MockGateway />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* ERP Dashboard Layout wrapper */}
            <Route element={<DashboardLayout />}>
              <Route path="/profile" element={<Profile />} />
              
              {/* Dashboard Modules */}
              <Route path="/dashboard" element={<ERPView AdminComp={AdminDashboard} InstructorComp={InstructorDashboard} StudentComp={StudentDashboardOverview} />} />
              
              {/* Academics Modules */}
              <Route path="/academics" element={<Navigate to="/academics/courses" replace />} />
              <Route path="/academics/courses" element={<ERPView AdminComp={AdminCourses} InstructorComp={InstructorCourses} StudentComp={MyCourses} />} />
              <Route path="/academics/timetable" element={<ERPView AdminComp={AdminSchedule} InstructorComp={InstructorSchedule} />} />
              <Route path="/academics/assignments" element={<ERPView AdminComp={InstructorAssessments} InstructorComp={InstructorAssessments} StudentComp={StudentAssessments} />} />
              <Route path="/academics/results" element={<ERPView AdminComp={InstructorAssessments} InstructorComp={InstructorAssessments} StudentComp={StudentAssessments} />} />

              {/* Students Modules */}
              <Route path="/students/list" element={<ERPView AdminComp={AdminStudents} InstructorComp={AdminStudents} />} />
              <Route path="/students/performance" element={<ERPView AdminComp={AdminReports} InstructorComp={InstructorReports} />} />

              {/* Teachers Modules */}
              <Route path="/teachers/list" element={<ERPView AdminComp={AdminInstructors} />} />
              <Route path="/teachers/assign" element={<ERPView AdminComp={AdminSchedule} />} />

              {/* Attendance Modules */}
              <Route path="/attendance/mark" element={<ERPView AdminComp={() => <ComingSoon title="Mark Attendance" />} InstructorComp={() => <ComingSoon title="Mark Attendance" />} />} />
              <Route path="/attendance/reports" element={<ERPView AdminComp={() => <ComingSoon title="Attendance Reports" />} InstructorComp={() => <ComingSoon title="Attendance Reports" />} StudentComp={() => <ComingSoon title="My Attendance" />} />} />

              {/* Examinations Modules */}
              <Route path="/examinations/marks" element={<ERPView AdminComp={InstructorAssessments} InstructorComp={InstructorAssessments} />} />
              <Route path="/examinations/results" element={<ERPView AdminComp={() => <ComingSoon title="Result Generation" />} />} />

              {/* Content / Notifications / Reports / Audit / Settings */}
              <Route path="/content" element={<ERPView AdminComp={AdminCourses} InstructorComp={InstructorCourses} StudentComp={MyCourses} />} />
              <Route path="/notifications" element={<ERPView AdminComp={NotificationsPage} InstructorComp={NotificationsPage} StudentComp={NotificationsPage} />} />
              <Route path="/reports" element={<ERPView AdminComp={AdminReports} InstructorComp={InstructorReports} />} />
              <Route path="/audit-logs" element={<ERPView AdminComp={() => <ComingSoon title="Audit Logs" />} />} />
              <Route path="/settings" element={<ERPView AdminComp={AdminSiteManagement} />} />

              {/* Fallback to dashboard if route doesn't match above exactly but starts with dashboard */}
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50">
                <div className="text-center">
                   <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
                   <p className="text-slate-500">Page not found in ERP System.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
      <Routes>
        <Route path="/" element={<Footer />} />
        <Route path="/about-us" element={<Footer />} />
        <Route path="/contact" element={<Footer />} />
        <Route path="/resources" element={<Footer />} />
        <Route path="/live-classes" element={<Footer />} />
        <Route path="/mentorship" element={<Footer />} />
        <Route path="*" element={null} />
      </Routes>
    </div>
  );
};

export default App;
