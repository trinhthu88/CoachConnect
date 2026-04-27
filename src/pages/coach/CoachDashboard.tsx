import React, { useEffect, useState } from "react";
import { 
  Users, 
  Calendar, 
  Star, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  Video
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

export function CoachDashboard() {
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking");
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeCoachees: 0,
    avgRating: 5.0,
    pendingTasks: 0,
    loading: true
  });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeCoachees, setActiveCoachees] = useState<any[]>([]);
  const [nextSession, setNextSession] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setDbStatus("error");
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (connectionError) throw connectionError;
        setDbStatus("connected");

        // For demo, we'll try to find any coach ID. In real app, this is auth.uid()
        const { data: coaches } = await supabase.from('profiles').select('id').eq('role', 'coach').limit(1);
        const coachId = coaches?.[0]?.id;

        if (coachId) {
          const [sessionsCount, completedCount, requests, coachees, upcoming] = await Promise.all([
            supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('coach_id', coachId),
            supabase.from('sessions').select('*', { count: 'exact', head: true }).eq('coach_id', coachId).eq('status', 'completed'),
            supabase.from('sessions')
              .select('*, coachee:profiles!sessions_coachee_id_fkey(full_name, email)')
              .eq('coach_id', coachId)
              .eq('status', 'pending_coach_approval'),
            supabase.from('sessions')
              .select('coachee:profiles!sessions_coachee_id_fkey(id, full_name, bio, status)')
              .eq('coach_id', coachId)
              .limit(5),
            supabase.from('sessions')
              .select('*, coachee:profiles!sessions_coachee_id_fkey(full_name)')
              .eq('coach_id', coachId)
              .eq('status', 'confirmed')
              .gte('start_time', new Date().toISOString())
              .order('start_time', { ascending: true })
              .limit(1)
              .single()
          ]);

          setStats({
            totalSessions: sessionsCount.count || 0,
            activeCoachees: completedCount.count || 0,
            avgRating: 5.0,
            pendingTasks: requests.data?.length || 0,
            loading: false
          });

          setPendingRequests(requests.data || []);
          setNextSession(upcoming.data);
          
          // Unique coachees
          const uniqueCoachees = Array.from(new Map(coachees.data?.map((item: any) => [item.coachee.id, item.coachee])).values());
          setActiveCoachees(uniqueCoachees);
        } else {
           setStats(prev => ({ ...prev, loading: false }));
        }

      } catch (err) {
        console.error("Coach data fetch failed:", err);
        setDbStatus("error");
        setStats(prev => ({ ...prev, loading: false }));
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Coach Dashboard</h1>
          <p className="text-[#64748B] font-medium">Manage your sessions, coachees, and professional profile.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#6366F1] transition-all">Edit Profile</button>
           <button className="px-4 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4F46E5] transition-all">Set Availability</button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Sessions", value: stats.loading ? "..." : stats.totalSessions.toString(), icon: <Calendar size={20} />, color: "text-indigo-500" },
          { label: "Active Coachees", value: stats.loading ? "..." : stats.activeCoachees.toString(), icon: <Users size={20} />, color: "text-emerald-500" },
          { label: "Avg. Rating", value: stats.avgRating.toFixed(1), icon: <Star size={20} />, color: "text-amber-500" },
          { label: "Pending Tasks", value: stats.loading ? "..." : stats.pendingTasks.toString(), icon: <AlertCircle size={20} />, color: "text-red-500" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {React.cloneElement(stat.icon as React.ReactElement, { className: stat.color })}
                </div>
                <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#1E293B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pending Requests */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFB]">
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Pending Booking Requests</h2>
              <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{pendingRequests.length} New</span>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                <div key={req.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${req.coachee?.full_name || 'User'}&background=F1F5F9&color=6366F1`} className="w-12 h-12 rounded-xl" alt="Avatar" />
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">{req.coachee?.full_name || 'Unknown Coachee'}</p>
                      <p className="text-[11px] font-medium text-[#64748B] mb-1">{req.topic} • {req.duration_minutes}m</p>
                      <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                         <Clock size={10} /> {new Date(req.start_time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#6366F1] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#4F46E5] transition-all">Approve</button>
                    <button className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Decline</button>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-[#94A3B8] text-xs font-bold uppercase tracking-widest">
                   No pending requests found.
                </div>
              )}
            </div>
          </section>

          {/* Coachee List */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB]">
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">My Coachees</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
                    <th className="pb-4">Coachee</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Progress</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {activeCoachees.map((coachee) => (
                    <tr key={coachee.id} className="group">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 capitalize">
                             {coachee.full_name?.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-[#1E293B]">{coachee.full_name}</p>
                              <p className="text-[10px] text-[#94A3B8] uppercase font-bold truncate max-w-[150px]">{coachee.bio || "No bio"}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${coachee.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {coachee.status}
                        </span>
                      </td>
                      <td className="py-4">
                         <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `70%` }} />
                         </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline text-nowrap">View Logs</button>
                      </td>
                    </tr>
                  ))}
                  {activeCoachees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">
                        No coachees assigned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {nextSession ? (
            <div className="bg-[#1E293B] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10"><Calendar size={48} /></div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Upcoming Session</h3>
              <p className="text-xl font-bold mb-4 tracking-tight leading-tight">{nextSession.topic}</p>
              <div className="flex items-center gap-3 mb-6">
                 <img src={`https://ui-avatars.com/api/?name=${nextSession.coachee?.full_name}&background=fff&color=1E293B`} className="w-8 h-8 rounded-full border-2 border-white/20" />
                 <span className="text-xs font-medium opacity-80">with {nextSession.coachee?.full_name} • {new Date(nextSession.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <a 
                href={nextSession.meeting_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-[#6366F1] text-white font-bold rounded-2xl shadow-lg hover:bg-[#4F46E5] transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Video size={16} /> Join Session
              </a>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Calendar size={24} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No scheduled sessions</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-widest">Recent Activity</h2>
              <MessageSquare size={16} className="text-[#94A3B8]" />
            </div>
            <div className="space-y-4">
              {[
                { name: "John Smith", action: "Requested a session", time: "2h ago" },
                { name: "Admin", action: "Approved your profile update", time: "5h ago" },
              ].map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-[#6366F1] rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-[#1E293B] leading-relaxed">
                      <span className="font-bold">{act.name}</span> {act.action}
                    </p>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F1F5F9] rounded-2xl p-6">
             <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-4">Calendar Sync</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-[#475569]">Google Calendar</span>
                   <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg uppercase">Synced</span>
                </div>
                <div className="flex items-center justify-between opacity-50">
                   <span className="text-xs font-bold text-[#475569]">Calendly</span>
                   <button className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline">Connect</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

