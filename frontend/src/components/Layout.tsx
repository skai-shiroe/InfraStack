import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users2,
  Receipt,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Box,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

const menuSections = [
  {
    title: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Stock',
    items: [
      { path: '/stock', label: 'Products & Movements', icon: Package },
      { path: '/categories', label: 'Categories', icon: Tags },
      { path: '/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    title: 'Sales',
    items: [
      { path: '/clients', label: 'Clients', icon: Users2 },
      { path: '/sales', label: 'New Sale / Receipts', icon: Receipt },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/users', label: 'Users', icon: UserCog },
    ],
  },
];

function SidebarContent({
  collapsed,
  isDark,
  textMain,
  textMuted,
  hoverBg,
  activeBg,
  inactiveText,
  location,
  toggleTheme,
  user,
  logout,
  setMobileOpen,
}: {
  collapsed: boolean;
  isDark: boolean;
  textMain: string;
  textMuted: string;
  hoverBg: string;
  activeBg: string;
  inactiveText: string;
  location: ReturnType<typeof useLocation>;
  toggleTheme: () => void;
  user: { name?: string; email?: string } | null;
  logout: () => void;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-6 border-b flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 ${
            isDark
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <Box className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className={`text-xl font-bold tracking-tight ${textMain}`}>Inventra</h1>
              <p className={`text-xs ${textMuted}`}>Inventory & Sales</p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggle */}
      {!collapsed ? (
        <div className="p-4 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                Dark Mode
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 flex justify-center flex-shrink-0">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-gray-200" /> : <Moon className="w-4 h-4 text-gray-700" />}
          </button>
        </div>
      )}

      {/* Navigation - occupe tout l'espace disponible */}
      <nav className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
        {menuSections.map((section, index) => (
          <div key={section.title} className={index === menuSections.length - 1 ? 'flex-1' : ''}>
            {!collapsed && (
              <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-3 px-3 ${textMuted}`}>
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-all duration-200 group ${
  isActive
    ? activeBg
    : `${inactiveText} ${hoverBg}`
} ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-[25px] h-[25px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110`} />
                    {!collapsed && <span>{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Espace entre les sections sauf la dernière */}
            {index < menuSections.length - 1 && <div className="h-25" />}
          </div>
        ))}
      </nav>

      {/* User Section - toujours en bas */}
      <div className={`p-4 border-t flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md ${
              isDark
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <button
              onClick={logout}
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className={`rounded-xl p-4 border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold shadow-md flex-shrink-0 ${
                isDark
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700'
              }`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${textMain}`}>{user?.name}</div>
                <div className={`text-xs truncate ${textMuted}`}>{user?.email}</div>
              </div>
              <ChevronDown className={`w-4 h-4 flex-shrink-0 ${textMuted}`} />
            </div>
            <button
              onClick={logout}
              className={`w-full text-xs font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                isDark
                  ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20'
                  : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme()!;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const sidebarBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textMain = isDark ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50';
  const activeBg = isDark
    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border-l-2 border-indigo-400'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-2 border-blue-500';
  const inactiveText = isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900';

  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  const sidebarProps = {
    collapsed,
    isDark,
    textMain,
    textMuted,
    hoverBg,
    activeBg,
    inactiveText,
    location,
    toggleTheme,
    user,
    logout,
    setMobileOpen,
  };

  return (
    <div className={`h-screen flex ${bgClass} overflow-hidden`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-30 p-2 rounded-xl shadow-lg ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarBg} w-72 flex flex-col shadow-2xl border-r`}>
        <div className={`flex items-center justify-between p-4 border-b flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <span className={`font-bold ${textMain}`}>Menu</span>
          <button onClick={() => setMobileOpen(false)} className={textMuted}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SidebarContent {...sidebarProps} collapsed={false} />
        </div>
      </aside>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col ${sidebarWidth} ${sidebarBg} border-r transition-all duration-300 relative h-screen`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-8 z-10 w-6 h-6 rounded-full border shadow-md flex items-center justify-center transition-colors ${
            isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${bgClass} min-w-0 overflow-y-auto h-screen`}>
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}