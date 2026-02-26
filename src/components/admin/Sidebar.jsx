import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu,
  LayoutDashboard, 
  CreditCard, 
  Users, 
  HandCoins, 
  Briefcase, 
  FileText, 
  Settings, 
  Bell, 
  HelpCircle,
  Stethoscope,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const mainMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Health Card', icon: CreditCard, path: '/admin/health-card' },
    { name: 'Partners', customIcon: '/admin_images/partner.svg', path: '/admin/partners' },
    { name: 'Donations', customIcon: '/admin_images/donations.svg', path: '/admin/donations' },
    { name: 'HR & Payroll', customIcon: '/admin_images/hr_payroll.svg', path: '/admin/hr-payroll' },
  ];

  const systemItems = [
    { name: 'Reports', customIcon: '/admin_images/reports.svg', path: '/admin/reports' },
    { name: 'Settings', customIcon: '/admin_images/settings.svg', path: '/admin/settings' },
    { name: 'Help & Support', icon: HelpCircle, path: '/admin/help' },
  ];

  const renderNavLinks = (items) => {
    return items.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        end={item.path === '/admin'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 mx-4 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-[#F68E5F] text-white shadow-sm'
              : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]'
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
                style={isActive ? { filter: 'brightness(0) invert(1)' } : { filter: 'brightness(0)' }}
              />
            ) : (
              item.icon && <item.icon size={20} className={isActive ? 'text-white' : 'text-[#000000]'} />
            )}
            {item.name}
          </>
        )}
      </NavLink>
    ));
  };

  const sidebarContent = (
    <>
      <div>
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-8">
          <img src="/logo.svg" alt="BKBS Trust Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation Menus */}
        <nav className="flex flex-col gap-6 mt-4">
          <div>
            <p className="px-8 text-[10px] font-semibold text-[#9CA3AF] mb-2 tracking-widest">MAIN MENU</p>
            <div className="flex flex-col gap-1">
               {renderNavLinks(mainMenuItems)}
            </div>
          </div>

          <div>
            <p className="px-8 text-[10px] font-semibold text-[#9CA3AF] mb-2 tracking-wider">SYSTEM</p>
            <div className="flex flex-col gap-1">
               {renderNavLinks(systemItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* Logout Button */}
      <div className="mb-8 pl-4">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[16px] font-medium text-[#000000] hover:bg-gray-100 transition-colors w-[calc(100%-1rem)]">
          <LogOut size={20} strokeWidth={2} className="text-[#000000]" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex shrink-0 w-64 bg-[#FFFFFF] border-r border-gray-200 flex-col justify-between" style={{ fontFamily: 'Inter, sans-serif' }}>
        {sidebarContent}
      </aside>

      {/* iPad Mini / Mobile Collapsed Sidebar */}
      <aside className="flex lg:hidden shrink-0 w-16 bg-[#FFFFFF] border-r border-gray-200 flex-col items-center relative z-50" style={{ fontFamily: 'Inter, sans-serif' }}>
         <div 
           className="h-full w-full absolute inset-0 cursor-pointer flex flex-col items-center"
           onMouseEnter={() => setIsHovered(true)}
           onMouseLeave={() => setIsHovered(false)}
         >
            {/* The trigger icon / Logo */}
            <div className="flex justify-center pt-8 overflow-hidden w-full px-4">
               <img src="/logo1.svg" alt="Logo" className="h-15 max-w-none ml-2 object-left object-cover" />
            </div>

            {/* Collapsed Navigation Icons */}
            <nav className="flex flex-col gap-6 w-full items-center mt-14">
              <div className="flex flex-col gap-2 w-full px-3">
                {mainMenuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex justify-center items-center w-10 h-10 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#F68E5F] text-white shadow-sm'
                          : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]'
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
                            style={isActive ? { filter: 'brightness(0) invert(1)' } : { filter: 'brightness(0)' }}
                          />
                        ) : (
                          item.icon && <item.icon size={20} className={isActive ? 'text-white' : 'text-[#000000]'} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>

              <div className="w-8 h-px bg-gray-200"></div>

              <div className="flex flex-col gap-2 w-full px-3">
                {systemItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `flex justify-center items-center w-10 h-10 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[#F68E5F] text-white shadow-sm'
                          : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#4B5563]'
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
                            style={isActive ? { filter: 'brightness(0) invert(1)' } : { filter: 'brightness(0)' }}
                          />
                        ) : (
                          item.icon && <item.icon size={20} className={isActive ? 'text-white' : 'text-[#000000]'} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* The Overlay Sidebar */}
            <div className={`fixed left-0 top-0 h-screen w-64 bg-[#FFFFFF] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col justify-between cursor-default ${isHovered ? 'translate-x-0' : '-translate-x-full'}`}>
               {sidebarContent}
            </div>
         </div>
      </aside>
    </>
  );
};

export default Sidebar;
