import React from 'react';
import { Bell } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="flex justify-between items-center h-[90px] px-8 border-b border-[#F3F4F6] bg-[#FFFFFF]">
      <h1 className="text-[22px] font-bold text-[#22333B]">Good Morning Vivek!</h1>
      
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#4B5563] hover:bg-gray-200 transition-colors">
          <Bell size={18} className="text-[#22333B]" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D1D5DB]"></div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#22333B]">Admin User</span>
            <span className="text-xs text-[#9CA3AF]">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
