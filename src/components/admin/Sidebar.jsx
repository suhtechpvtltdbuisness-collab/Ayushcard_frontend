import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem("userRole") || "Admin";

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem("userRole");
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const basePath = "/admin"; // Matching the actual routing in App.jsx

  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: `/admin` },
    { name: "Health Card", icon: CreditCard, path: `/admin/health-card` },
    {
      name: "Partners",
      customIcon: "/admin_images/partner.svg",
      path: `/admin/partners`,
    },
    {
      name: "Donations",
      customIcon: "/admin_images/donations.svg",
      path: `/admin/donations`,
    },
    {
      name: "HR & Payroll",
      customIcon: "/admin_images/hr_payroll.svg",
      path: `/admin/hr`,
      subItems: [
        { name: "Employees", path: `/admin/hr/employees` },
        { name: "Salary", path: `/admin/hr/salary` },
      ],
    },
  ];

  const filteredMainMenuItems = mainMenuItems.filter((item) => {
    if (item.name === "HR & Payroll" && userRole === "Employee") {
      return false;
    }
    return true;
  });

  const systemItems = [
    {
      name: "Reports",
      customIcon: "/admin_images/reports.svg",
      path: `/admin/reports`,
    },
    { name: "Help & Support", icon: HelpCircle, path: `/admin/help-support` },
  ];

  const renderNavLinks = (items) => {
    return items.map((item) => {
      const isParentActive =
        item.subItems && (
          location.pathname === item.path || 
          location.pathname.startsWith(item.path + "/")
        );

      return (
        <div key={item.name} className="flex flex-col">
          <NavLink
            to={item.subItems ? item.subItems[0].path : item.path}
            end={item.path === basePath}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-4 rounded-lg text-sm font-medium transition-colors ${isActive || isParentActive
                ? "bg-[#F68E5F] text-[#FFFCFB] shadow-sm"
                : "text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.customIcon ? (
                  <img
                    src={item.customIcon}
                    alt={item.name}
                    className="w-5 h-5"
                    style={
                      isActive || isParentActive
                        ? { filter: "brightness(0) invert(1)" }
                        : { filter: "brightness(0)" }
                    }
                  />
                ) : (
                  item.icon && (
                    <item.icon
                      size={20}
                      className={
                        isActive || isParentActive
                          ? "text-[#FFFCFB]"
                          : "text-[#22333B]"
                      }
                    />
                  )
                )}
                {item.name}
              </>
            )}
          </NavLink>

          {/* Render SubItems */}
          {item.subItems && isParentActive && (
            <div className="flex flex-col mt-1 mb-1 relative">
              {item.subItems.map((subItem) => (
                <div key={subItem.name} className="flex px-4 mx-4">
                  <NavLink
                    to={subItem.path}
                    className={({ isActive }) =>
                      `pl-12 py-1.5 text-sm font-medium transition-colors border-l-2 ml-4 ${isActive
                        ? "text-[#F68E5F] border-[#F68E5F]"
                        : "text-[#6B7280] border-transparent hover:text-[#F68E5F]"
                      }`
                    }
                  >
                    {subItem.name}
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-8">
          <img src="/logo.svg" alt="BKBS Trust Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation Menus */}
        <nav className="flex flex-col gap-6 mt-4 pb-4">
          <div>
            <p className="px-8 text-[10px] font-semibold text-[#9CA3AF] mb-2 tracking-widest">
              MAIN MENU
            </p>
            <div className="flex flex-col gap-1">
              {renderNavLinks(filteredMainMenuItems)}
            </div>
          </div>

          <div>
            <p className="px-8 text-[10px] font-semibold text-[#9CA3AF] mb-2 tracking-wider">
              SYSTEM
            </p>
            <div className="flex flex-col gap-1">
              {renderNavLinks(systemItems)}
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[16px] font-medium text-[#22333B] hover:bg-red-50 hover:text-red-500 transition-colors w-full group"
        >
          <LogOut size={20} strokeWidth={2} className="text-[#22333B] group-hover:text-red-500 transition-colors" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className="hidden lg:flex shrink-0 w-64 border-r border-gray-200 flex-col"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {sidebarContent}
      </aside>

      {/* iPad Mini / Mobile Collapsed Sidebar */}
      <aside
        className="flex lg:hidden shrink-0 w-16 bg-[#FFFFFF] border-r border-gray-200 flex-col items-center relative z-50"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div
          className="h-full w-full absolute inset-0 cursor-pointer flex flex-col items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* The trigger icon / Logo */}
          <div className="flex justify-center pt-8 overflow-hidden w-full px-4">
            <img
              src="/logo1.svg"
              alt="Logo"
              className="h-15 max-w-none ml-2 object-left object-cover"
            />
          </div>

          {/* Collapsed Navigation Icons */}
          <nav className="flex flex-col gap-6 w-full items-center mt-14">
            <div className="flex flex-col gap-2 w-full px-3">
              {filteredMainMenuItems.map((item) => {
                const isParentActive =
                  item.subItems && (
                    location.pathname === item.path || 
                    location.pathname.startsWith(item.path + "/")
                  );

                return (
                  <NavLink
                    key={item.name}
                    to={item.subItems ? item.subItems[0].path : item.path}
                    end={item.path === basePath}
                    className={({ isActive }) =>
                      `flex justify-center items-center w-10 h-10 rounded-lg transition-colors ${isActive || isParentActive
                        ? "bg-[#F68E5F] text-[#FFFCFB] shadow-sm"
                        : "text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.customIcon ? (
                          <img
                            src={item.customIcon}
                            alt={item.name}
                            className="w-5 h-5"
                            style={
                              isActive || isParentActive
                                ? { filter: "brightness(0) invert(1)" }
                                : { filter: "brightness(0)" }
                            }
                          />
                        ) : (
                          item.icon && (
                            <item.icon
                              size={20}
                              className={
                                isActive || isParentActive
                                  ? "text-[#FFFCFB]"
                                  : "text-[#22333B]"
                              }
                            />
                          )
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="w-8 h-px bg-gray-200"></div>

            <div className="flex flex-col gap-2 w-full px-3">
              {systemItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === basePath}
                  className={({ isActive }) =>
                    `flex justify-center items-center w-10 h-10 rounded-lg transition-colors ${isActive
                      ? "bg-[#F68E5F] text-[#FFFCFB] shadow-sm"
                      : "text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.customIcon ? (
                        <img
                          src={item.customIcon}
                          alt={item.name}
                          className="w-5 h-5"
                          style={
                            isActive
                              ? { filter: "brightness(0) invert(1)" }
                              : { filter: "brightness(0)" }
                          }
                        />
                      ) : (
                        item.icon && (
                          <item.icon
                            size={20}
                            className={
                              isActive ? "text-[#FFFCFB]" : "text-[#22333B]"
                            }
                          />
                        )
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* The Overlay Sidebar */}
          <div
            className={`fixed left-0 top-0 h-screen w-64 bg-[#FFFFFF] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col justify-between cursor-default z-[100] ${isHovered ? "translate-x-0" : "-translate-x-full"}`}
          >
            {sidebarContent}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
