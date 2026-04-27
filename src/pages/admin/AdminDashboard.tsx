import React from "react";
import { 
  Users, 
  Calendar, 
  Layout, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle,
  Database,
  ArrowUpRight,
  XCircle
} from "lucide-react";
import { motion } from "motion/react";

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">System Administration</h1>
          <p className="text-[#64748B] font-medium">Platform overview and user management control center.</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#6366F1] transition-all">Invite User</button>
           <button className="px-4 py-2 bg-[#1E293B] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">Reports</button>
        </div>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: "1,284", icon: <Users size={20} />, color: "text-blue-500" },
          { label: "Active Coaches", value: "48", icon: <Layout size={20} />, color: "text-indigo-500" },
          { label: "Booked Sessions", value: "312", icon: <Calendar size={20} />, color: "text-emerald-500" },
          { label: "Revenue (Demo)", value: "$0.00", icon: <Database size={20} />, color: "text-slate-400" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-slate-50 rounded-lg ${stat.color}`}>
                    {stat.icon}
                </div>
                <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Actions */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFB]">
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Pending Registrations</h2>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {[
                { name: "Robert Fox", email: "robert@example.com", type: "Coach", date: "2h ago" },
                { name: "Cody Fisher", email: "cody@example.com", type: "Coachee", date: "5h ago" },
              ].map((user) => (
                <div key={user.email} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {user.name.split(' ').map(n => n[0]).join('')}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#1E293B]">{user.name}</p>
                        <p className="text-[10px] font-medium text-[#64748B] uppercase">{user.type} • {user.email}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><ShieldCheck size={18} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><XCircle size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB]">
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Latest Sessions</h2>
            </div>
            <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                      <th className="pb-4">Coach</th>
                      <th className="pb-4">Coachee</th>
                      <th className="pb-4">Date</th>
                      <th className="pb-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {[
                      { coach: "Elena Vance", coachee: "Sarah Chen", date: "Today, 2:00 PM", status: "Confirmed" },
                      { coach: "Marcus Thorne", coachee: "Mike Daw", date: "Yesterday", status: "Completed" },
                    ].map((row, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-4 text-sm font-bold text-[#1E293B]">{row.coach}</td>
                        <td className="py-4 text-sm text-[#64748B] font-medium">{row.coachee}</td>
                        <td className="py-4 text-xs font-medium text-[#94A3B8]">{row.date}</td>
                        <td className="py-4 text-right">
                          <span className="text-[9px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-widest">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#6366F1] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-20"><Database size={48} /></div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Storage Status</h3>
              <p className="text-xl font-bold mb-4 tracking-tight">Supabase Instance</p>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs font-bold opacity-80">
                    <span>Database Usage</span>
                    <span>12%</span>
                 </div>
                 <div className="w-full h-1 bg-white/20 rounded-full">
                    <div className="w-[12%] h-full bg-white rounded-full" />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
             <h3 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-widest mb-4">Critical Alerts</h3>
             <div className="space-y-3">
                <div className="flex gap-3 text-red-600">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-medium">Backup was not verified for the last 24 hours.</p>
                </div>
                <div className="flex gap-3 text-amber-600">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="text-xs font-medium font-bold">2 coach profiles are pending approval for &gt; 48h.</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
