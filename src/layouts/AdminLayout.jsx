import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import { AttendanceProvider } from '../context/AttendanceContext';
import AttendanceModal from '../components/employee/AttendanceModal';

const AdminLayout = () => {
  return (
    <AttendanceProvider>
      <div className="flex h-screen bg-[#FFFFFF] text-[#22333B]" style={{ fontFamily: 'Inter, sans-serif' }}>
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-[#FFFFFF] p-3 sm:p-6 lg:p-8 pb-8 sm:pb-10 lg:pb-12">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Attendance modal — only visible for Employee role (context handles the check) */}
      <AttendanceModal />
    </AttendanceProvider>
  );
};

export default AdminLayout;

