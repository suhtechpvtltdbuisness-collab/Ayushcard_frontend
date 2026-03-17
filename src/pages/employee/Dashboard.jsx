import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../api/service";
import {
  CreditCard,
  Stethoscope,
  HandCoins,
  Users,
  ChevronRight,
  Building,
  Heart,
  Download,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response?.success) {
          setStats(response.data?.stats);
        }
      } catch (err) {
        console.error("Dashboard stats fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#fa8112] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[#FFEDD5] rounded-lg flex items-center justify-center">
                <img
                  src="/admin_images/suitcase.svg"
                  alt="Ayush Metrics"
                  className="w-5 h-5"
                />
              </div>
              <span className="text-[10px] font-bold text-[#D9D9D9] tracking-wider mt-1">
                +12% MONTHLY
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#6B7280] mb-6">
              Ayush Card Metrics
            </h3>
          </div>
          <div className="flex gap-12 mt-auto">
            <div>
              <p className="text-2xl font-bold text-[#22333B]">{stats?.totalCards || 0}</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider">
                TOTAL APPLICATIONS
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <img
                  src="/admin_images/plus.svg"
                  alt="Hospital Metrics"
                  className="w-5 h-5"
                />
              </div>
              <span className="text-[10px] font-bold text-[#3B82F6] tracking-wider mt-1">
                STEADY
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[#6B7280] mb-6">
              Hospital Metrics
            </h3>
          </div>
          <div className="flex items-end gap-x-1 mt-auto">
            <div>
              <p className="text-4xl font-bold text-[#22333B] leading-none">
                {stats?.totalOrganizations || 0}
              </p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider mt-1">
                TOTAL PARTNERS
              </p>
            </div>
            <div className="ml-auto text-right mb-0">
              <p className="text-xl font-bold text-gray-300 leading-none">{stats?.totalOrganizations || 0}</p>
              <p className="text-[10px] font-medium text-[#9CA3AF] tracking-wider mt-1">
                ACTIVE
              </p>
            </div>
          </div>
        </div>

        {/* Card 4 - Replaces Card 3 since it was Donation */}
        <div className="bg-[#FFFFFF] rounded-xl p-5 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D] flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-[#F3E8FF] rounded-lg flex items-center justify-center">
                <img
                  src="/admin_images/team_operation.svg"
                  alt="Team"
                  className="w-5 h-5"
                />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-[#6B7280] mb-6">
              Team & Operations
            </h3>
          </div>
          <div className="flex -space-x-2 mt-auto">
            {[...Array(Math.min(stats?.totalEmployees || 0, 3))].map((_, i) => (
              <img
                key={i}
                src={`https://i.pravatar.cc/100?img=${i + 15}`}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
              />
            ))}
            {(stats?.totalEmployees || 0) > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-600 font-bold">
                +{stats.totalEmployees - 3}
              </div>
            )}
            {(!stats?.totalEmployees || stats.totalEmployees === 0) && (
              <div className="text-[10px] text-[#9CA3AF] font-bold">0 Active Staff</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D]">
          <div className="flex justify-between items-center mb-4 border-b border-[#F3F4F6] pb-2">
            <h2 className="text-[16px] font-bold text-[#242D35]">
              Recent Activity Feed
            </h2>
            <button className="text-xs font-semibold text-[#F68E5F] hover:underline">
              View All History
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Activity Item 1 */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                  <img
                    src="/admin_images/new_card.svg"
                    alt="New Card"
                    className="w-4.5 h-4.5"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">
                    New Card Application: Rajesh Kumar
                  </h4>
                  <span className="text-xs font-normal text-gray-400">
                    2 mins ago
                  </span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">
                  Application ID: #AY-9082. Documents verified by automated
                  system.
                </p>
              </div>
            </div>

            {/* Activity Item 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <img
                  src="/admin_images/hospital.svg"
                  alt="Hospital"
                  className="w-4.5 h-4.5"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">
                    City General Hospital Registered
                  </h4>
                  <span className="text-xs font-normal text-gray-400">
                    45 mins ago
                  </span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">
                  Multi-speciality facility added to partner network in Pune
                  region.
                </p>
              </div>
            </div>

            {/* Activity Item 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
                <Heart size={18} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-[#242D35]">
                    Health Camp Organized
                  </h4>
                  <span className="text-xs font-normal text-gray-400">
                    2 hours ago
                  </span>
                </div>
                <p className="text-xs font-normal text-[#6B7280] mt-1">
                  Successfully completed the free health checkup camp at Pune South.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F3F4F6] shadow-[0_2px_10px_-3px_#0000000D] h-min">
          <h2 className="text-[16px] font-bold text-[#242D35] mb-6">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/employee/health-card/create")}
              className="w-full flex items-center justify-between p-4 bg-[#F68E5F] text-[#FFFCFB] rounded-lg hover:bg-[#e47b4d] transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={20} />
                <span className="font-semibold text-sm">Add New Card</span>
              </div>
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => navigate("/employee/partners")}
              className="w-full flex items-center justify-between p-4 bg-[#F2F4F3] text-[#22333B] rounded-lg hover:bg-[#e6e9e7] transition-colors shadow-sm border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Building size={20} />
                <span className="font-semibold text-sm">View Partners</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
            <button
              onClick={() => navigate("/employee")}
              className="w-full flex items-center justify-between p-4 bg-[#F2F4F3] text-[#22333B] cursor-not-allowed rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/admin_images/hr_payroll.svg"
                  alt="New Card"
                  className="w-4.5 h-4.5"
                />
                <span className="font-semibold text-sm">Add Staff Member</span>
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
