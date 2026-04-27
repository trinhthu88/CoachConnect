import React, { useEffect, useState } from "react";
import { 
  Users, 
  Calendar, 
  Layout, 
  ShieldCheck, 
  FileCheck, 
  AlertCircle,
  Database,
  ArrowUpRight,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function AdminDashboard() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCoaches: 0,
    bookedSessions: 0,
    loading: true
  });

  const [pendingCount, setPendingCount] = useState({ coaches: 0, coachees: 0 });
  const [pendingList, setPendingList] = useState<any[]>([]);

  useEffect(() => {
    async function checkConnection() {
      if (!supabase) {
        setDbStatus("error");
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }
      try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) throw error;
        setDbStatus("connected");

        // Fetch actual counts
        const [usersCount, coachesCount, sessionsCount, pendingCoaches, pendingCoachees] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'coach').eq('status', 'active'),
          supabase.from('sessions').select('*', { count: 'exact', head: true }),
          supabase.from('profiles')
            .select('id, full_name, email, created_at, role, coach_profiles!inner(approval_status)')
            .eq('coach_profiles.approval_status', 'pending_approval'),
          supabase.from('profiles')
            .select('id, full_name, email, created_at, role')
            .eq('role', 'coachee')
            .eq('status', 'pending_approval')
        ]);

        const combinedPending = [
           ...(pendingCoaches.data || []).map(p => ({ ...p, type: 'Coach' })),
           ...(pendingCoachees.data || []).map(p => ({ ...p, type: 'Coachee' }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setStats({
          totalUsers: usersCount.count || 0,
          activeCoaches: coachesCount.count || 0,
          bookedSessions: sessionsCount.count || 0,
          loading: false
        });

        setPendingList(combinedPending);
        setPendingCount({ 
          coaches: pendingCoaches.data?.length || 0, 
          coachees: pendingCoachees.data?.length || 0 
        });

      } catch (err) {
        console.error("DB Check failed:", err);
        setDbStatus("error");
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    checkConnection();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">System Administration</h1>
          <p className="text-[#64748B] font-medium">Platform overview and user management control center.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
             dbStatus === "connected" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
             dbStatus === "error" ? "bg-red-50 text-red-600 border-red-100" : 
             "bg-slate-50 text-slate-400 border-slate-100"
           }`}>
             {dbStatus === "connected" ? <CheckCircle2 size={12} /> : dbStatus === "error" ? <XCircle size={12} /> : <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />}
             Supabase: {dbStatus}
           </div>
           <Link to="/admin/coaches" className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#6366F1] transition-all">Manage Coaches</Link>
           <Link to="/admin/registrations" className="px-4 py-2 bg-[#1E293B] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">Manage Coachees</Link>
        </div>
      </header>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.loading ? "..." : stats.totalUsers.toString(), icon: <Users size={20} />, color: "text-blue-500" },
          { label: "Active Coaches", value: stats.loading ? "..." : stats.activeCoaches.toString(), icon: <Layout size={20} />, color: "text-indigo-500" },
          { label: "Booked Sessions", value: stats.loading ? "..." : stats.bookedSessions.toString(), icon: <Calendar size={20} />, color: "text-emerald-500" },
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
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Pending Approvals</h2>
              <div className="flex gap-2">
                <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{pendingCount.coaches} Coach</span>
                <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{pendingCount.coachees} Learner</span>
              </div>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {pendingList.length > 0 ? pendingList.slice(0, 5).map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold border uppercase ${user.type === 'Coach' ? 'bg-[#EEF2FF] text-[#6366F1] border-[#E0E7FF]' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {user.full_name.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#1E293B]">{user.full_name}</p>
                        <p className="text-[10px] font-medium text-[#64748B] uppercase">{user.type} • {user.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-[#94A3B8] uppercase">
                     {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-[#94A3B8] text-xs font-bold uppercase tracking-widest">
                   No new profiles to approve.
                </div>
              )}
            </div>
            {pendingList.length > 5 && (
              <div className="p-4 border-t border-[#F1F5F9] text-center">
                <Link to="/admin/approvals" className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline">View All Requests</Link>
              </div>
            )}
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
