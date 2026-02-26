import React from 'react';
import { CreditCard, Stethoscope, HandCoins, Users, ChevronRight, Activity, Building, Heart, Download } from 'lucide-react';

const Dashboard = () => {
  return (
    <div>
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
              <img src="/admin_images/suitcase.svg" alt="Ayush Metrics" className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#D9D9D9] tracking-wider ">+12% MONTHLY</span>
          </div>
          <h3 className="text-sm font-semibold text-[#6B7280] mb-4">Ayush Card Metrics</h3>
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-2xl font-bold text-[#22333B]">1,988</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">VERIFIED</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#22333B]">0</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">UNVERIFIED</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <p className="text-sm font-semibold text-[#22333B]">0</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider w-min text-nowrap">UPCOMING RENEWAL</p>
            </div>
            <div className="px-5">
              <p className="text-sm font-semibold text-[#22333B]">0</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">EXPIRED</p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
              <img src="/admin_images/plus.svg" alt="Hospital Metrics" className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#3B82F6] tracking-wider">STEADY</span>
          </div>
          <h3 className="text-sm font-semibold text-[#6B7280] mb-4">Hospital Metrics</h3>
          <div className="flex items-end gap-x-1 mb-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-4xl font-bold text-[#22333B]">29</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">TOTAL PARTNERS</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold text-gray-300">29</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">ACTIVE</p>
            </div>
          </div>
          <p className="text-xs font-medium text-[#9CA3AF]">0 Pending verification</p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#D1FAE5] rounded-lg flex items-center justify-center">
              <img src="/admin_images/donation_finance.svg" alt="Donation" className="w-5 h-5" />
            </div>
            <button className="text-[10px] font-bold text-[#10B981] tracking-wider hover:underline">VIEW DETAILS</button>
          </div>
          <h3 className="text-sm font-semibold text-[#6B7280] mb-2">Donation & Finance</h3>
          <p className="text-xs font-medium text-[#9CA3AF] mb-1">Monthly Collections</p>
          <p className="text-2xl font-bold text-[#22333B] mb-6">₹4,20,500</p>
          <div className="flex justify-between items-center text-sm text-[#242D35] mb-1">
            <span>Corporate</span>
            <span className="font-semibold text-[#6B7280]">65%</span>
          </div>
          <div className="flex justify-between items-center text-sm text-[#242D35]">
            <span>Individual</span>
            <span className="font-semibold text-[#6B7280]">35%</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
           <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#F3E8FF] rounded-lg flex items-center justify-center">
              <img src="/admin_images/team_operation.svg" alt="Team" className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#6B7280] mb-4">Team & Operations</h3>
          
          <div className="flex -space-x-2 mb-6">
             <img src="https://i.pravatar.cc/100?img=11" alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
             <img src="https://i.pravatar.cc/100?img=33" alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
             <img src="https://i.pravatar.cc/100?img=47" alt="avatar" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-600 font-bold">+8</div>
          </div>

          <p className="text-xl font-bold text-[#22333B]">12 Active Staff</p>
          <p className="text-xs font-medium text-[#9CA3AF] mt-1">3 Field agents on duty</p>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        
        {/* Recent Activity Feed */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
          <div className="flex justify-between items-center mb-4 border-b border-[#F3F4F6] pb-2">
            <h2 className="text-[16px] font-bold text-[#242D35]">Recent Activity Feed</h2>
            <button className="text-xs font-semibold text-[#F68E5F] hover:underline">View All History</button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Activity Item 1 */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                  <img src="/admin_images/new_card.svg" alt="New Card" className="w-[18px] h-[18px]" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">New Card Application: Rajesh Kumar</h4>
                  <span className="text-xs font-normal text-gray-400">2 mins ago</span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">Application ID: #AY-9082. Documents verified by automated system.</p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                  <img src="/admin_images/hospital.svg" alt="Hospital" className="w-[18px] h-[18px]" />
                </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">City General Hospital Registered</h4>
                  <span className="text-xs font-normal text-gray-400">45 mins ago</span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">Multi-speciality facility added to partner network in Pune region.</p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Heart size={18} />
                </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">New Donation Received</h4>
                  <span className="text-xs font-normal text-gray-400">2 hours ago</span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">TechCorp Inc. donated ₹1,50,000 to the Children's Wellness Fund.</p>
              </div>
            </div>

            {/* Activity Item 4 */}
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                  <Heart size={18} />
                </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">New Donation Received</h4>
                  <span className="text-xs font-normal text-gray-400">2 hours ago</span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">TechCorp Inc. donated ₹1,50,000 to the Children's Wellness Fund.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D] h-min">
          <h2 className="text-[16px] font-bold text-[#242D35] mb-6">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center justify-between p-4 bg-[#F68E5F] text-white rounded-lg hover:bg-[#e47b4d] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard size={20} />
                <span className="font-semibold text-sm">Add New Card</span>
              </div>
              <ChevronRight size={20} />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-[#F2F4F3] text-[#22333B] rounded-lg hover:bg-[#e6e9e7] transition-colors shadow-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <Building size={20} />
                <span className="font-semibold text-sm">Register Hospital</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-[#F2F4F3] text-[#22333B] rounded-lg hover:bg-[#e6e9e7] transition-colors shadow-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <img src="/admin_images/hr_payroll.svg" alt="New Card" className="w-[18px] h-[18px]" />
                <span className="font-semibold text-sm">Add Staff Member</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-[#F2F4F3] text-[#22333B] rounded-lg hover:bg-[#e6e9e7] transition-colors shadow-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-3">
                <Download size={20} />
                <span className="font-semibold text-sm">Export Monthly Data</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
