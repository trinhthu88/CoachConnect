import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Shield, 
  Search,
  BookOpen,
  UserCheck
} from "lucide-react";
import { getSupabase, UserRole } from "../lib/supabase";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard", roles: ["admin", "coach", "coachee"] },
  { label: "Find Coaches", icon: <Search size={20} />, path: "/coaches", roles: ["coachee"] },
  { label: "Manage Coaches", icon: <Users size={20} />, path: "/admin/coaches", roles: ["admin"] },
  { label: "Registrations", icon: <UserCheck size={20} />, path: "/admin/registrations", roles: ["admin"] },
  { label: "Sessions", icon: <Calendar size={20} />, path: "/sessions", roles: ["coach", "coachee", "admin"] },
  { label: "Messages", icon: <MessageSquare size={20} />, path: "/chat", roles: ["coach", "coachee"] },
  { label: "Profile", icon: <BookOpen size={20} />, path: "/profile", roles: ["coach", "coachee"] },
  { label: "Settings", icon: <Settings size={20} />, path: "/settings", roles: ["admin", "coach", "coachee"] },
];

import { Link, Outlet } from "react-router-dom";

export default function AppLayout({ userRole }: { userRole: UserRole }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFB] text-[#1E293B] font-sans selection:bg-indigo-100">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-[#E2E8F0] flex flex-col h-full overflow-hidden shadow-sm"
      >
        <div className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-[#F1F5F9]">
          <motion.div 
            animate={{ opacity: isSidebarOpen ? 1 : 0 }}
            className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
          >
            <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center text-white font-bold shrink-0">C+</div>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">Connect+</span>
          </motion.div>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"
          >
            <Shield size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <Link 
              key={item.label}
              to={item.path}
              className="flex items-center gap-4 px-3 py-3 rounded-xl text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B] transition-all group"
            >
              <span className="text-[#94A3B8] group-hover:text-[#6366F1] transition-colors">
                {item.icon}
              </span>
              {isSidebarOpen && (
                <span className="text-sm font-semibold tracking-tight">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#F1F5F9] space-y-2">
          {isSidebarOpen && (
            <div className="px-3 pb-2 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
              Role Simulation
            </div>
          )}
          <div className="flex flex-col gap-1">
             {["coachee", "coach", "admin"].map((r) => (
               <button 
                 key={r}
                 onClick={() => {
                   localStorage.setItem("__SIMULATED_ROLE", r);
                   window.location.reload();
                 }}
                 className={`flex items-center gap-4 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                   userRole === r 
                     ? "bg-[#6366F1] text-white" 
                     : "text-[#64748B] hover:bg-slate-50"
                 }`}
               >
                 <Shield size={14} className={userRole === r ? "text-white" : "text-[#94A3B8]"} />
                 {isSidebarOpen && <span className="capitalize">{r}</span>}
               </button>
             ))}
          </div>
          <button className="w-full mt-4 flex items-center gap-4 px-3 py-3 rounded-xl text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all font-semibold overflow-hidden">
            <LogOut size={20} />
            {isSidebarOpen && <span className="whitespace-nowrap text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
             <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">System Operational</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-bold text-[#0F172A]">Sarah Chen</p>
                <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest">{userRole}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#E0E7FF] border border-[#C7D2FE] overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=6366F1&color=fff" alt="Avatar" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8 font-sans">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
