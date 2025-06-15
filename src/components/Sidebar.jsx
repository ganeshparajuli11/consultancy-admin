import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  UserCheck,
  Shield,
  DollarSign,
  ClipboardList,
  BookOpen,
  Globe,
  Settings,
  Menu
} from 'lucide-react';

const Logo = () => (
  <div className="h-12 w-24 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">
    Langzy
  </div>
);

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: Home },
  { label: 'Users',     to: '/admin/users',     icon: Users },
  { label: 'Staff',     to: '/admin/staff',     icon: Users },        // ← NEW
  { label: 'Tutors',    to: '/admin/tutors',    icon: UserCheck },
  { label: 'Admins',    to: '/admin/admins',    icon: Shield },
  { label: 'Revenue',   to: '/admin/revenue',   icon: DollarSign },
  { label: 'Enrollment',to: '/admin/enrollment',icon: ClipboardList },
  { label: 'Classes',   to: '/admin/classes',   icon: BookOpen },
  { label: 'Languages', to: '/admin/languages', icon: Globe },
  { label: 'Settings',  to: '/admin/settings',  icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Menu Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b">
        <Logo />
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Sidebar for medium+ screens */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-200 shadow-sm z-40">
        <div className="h-16 flex items-center justify-center px-6 border-b">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                  transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}>
                  <Icon className={`
                    w-5 h-5 mr-3 flex-shrink-0
                    ${isActive
                      ? 'text-blue-700'
                      : 'text-gray-400 group-hover:text-gray-600'}
                  `} />
                  <span className="truncate flex-1">{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-700 rounded-full" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t text-xs text-gray-500 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          System Status: Active
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-md overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="h-16 flex items-center justify-center px-6 border-b">
              <Logo />
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setIsOpen(false)}>
                  {({ isActive }) => (
                    <div className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                      transition-all duration-200 ease-in-out
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}>
                      <Icon className={`
                        w-5 h-5 mr-3 flex-shrink-0
                        ${isActive
                          ? 'text-blue-700'
                          : 'text-gray-400 group-hover:text-gray-600'}
                      `} />
                      <span className="truncate flex-1">{label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 bg-blue-700 rounded-full" />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
