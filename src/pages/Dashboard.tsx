import React from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Star, 
  ShieldCheck, 
  Search,
  Loader2,
  Video
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [nextSession, setNextSession] = React.useState<any>(null);
  const [completedCount, setCompletedCount] = React.useState(0);
  const [recommendedCoaches, setRecommendedCoaches] = React.useState<any[]>([]);
  const [recentLogs, setRecentLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    async function fetchDashboardData() {
      if (!supabase) return;
      try {
        // Fetch next session (confirmed)
        const { data: upcoming } = await supabase
          .from('sessions')
          .select('*, coach:profiles!sessions_coach_id_fkey(full_name)')
          .eq('status', 'confirmed')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single();
        
        if (upcoming) {
          setNextSession(upcoming);
        } else {
          // Mock upcoming session for demo
          setNextSession({
            topic: "Leadership Strategy Deep Dive",
            start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            coach: { full_name: "Marcus Aurelius" },
            meeting_url: "https://zoom.us/j/demo"
          });
        }

        // Fetch completed count
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        setCompletedCount((count || 0) || 12); // Fallback to 12 for demo

        // Fetch recommended coaches
        const { data: coaches } = await supabase
          .from('profiles')
          .select(`
            id, full_name, role,
            coach_profiles!inner(title, rating_avg, review_count, specialties)
          `)
          .eq('role', 'coach')
          .eq('status', 'active')
          .limit(2);
        
        if (coaches && coaches.length > 0) {
          setRecommendedCoaches(coaches);
        } else {
          // Mock coaches for demo
          setRecommendedCoaches([
            { id: 'm1', full_name: 'Dr. Elena Vance', coach_profiles: { title: 'Executive Leadership', rating_avg: 4.9, review_count: 128 } },
            { id: 'm2', full_name: 'Marcus Thorne', coach_profiles: { title: 'Career Productivity', rating_avg: 5.0, review_count: 84 } }
          ]);
        }

        // Fetch recent logs
        const { data: logs } = await supabase
          .from('sessions')
          .select('id, topic, start_time, coach:profiles!sessions_coach_id_fkey(full_name)')
          .eq('status', 'completed')
          .order('start_time', { ascending: false })
          .limit(3);
        
        if (logs && logs.length > 0) {
          setRecentLogs(logs);
        } else {
          // Mock logs for demo
          setRecentLogs([
            { id: 'l1', topic: 'Strategic Focus', start_time: new Date(Date.now() - 86400000).toISOString(), coach: { full_name: 'Marcus Aurelius' } },
            { id: 'l2', topic: 'Public Speaking', start_time: new Date(Date.now() - 86400000 * 3).toISOString(), coach: { full_name: 'Dr. Elena Vance' } }
          ]);
        }

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-[#6366F1]" size={48} />
        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Welcome back, Sarah</h1>
          <p className="text-[#64748B] font-medium">You have 3 coaching credits remaining this month.</p>
        </div>
        <Link 
          to="/coaches"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all"
        >
          <Plus size={18} />
          Book a Session
        </Link>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#6366F1]">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Next Session</p>
            <p className="text-xl font-bold text-[#1F2937]">
              {nextSession ? new Date(nextSession.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "No upcoming sessions"}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#10B981]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Completed</p>
            <p className="text-xl font-bold text-[#1F2937]">{completedCount} Sessions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Recommended for you</h2>
              <Link to="/coaches" className="text-sm font-bold text-[#6366F1] hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedCoaches.map((coach) => (
                <div key={coach.id} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:border-[#6366F1] transition-all cursor-pointer group">
                  <div className="flex gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${coach.full_name}&background=F5F3FF&color=6366F1`} className="w-14 h-14 rounded-xl" />
                    <div>
                      <h3 className="font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">{coach.full_name}</h3>
                      <p className="text-xs font-medium text-[#64748B]">{coach.coach_profiles?.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                        <span className="text-xs font-bold text-[#1E293B]">{coach.coach_profiles?.rating_avg}</span>
                        <span className="text-[10px] text-[#94A3B8]">({coach.coach_profiles?.review_count} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recommendedCoaches.length === 0 && <p className="text-sm text-[#94A3B8] p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">No coaches found.</p>}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recent Session Logs</h2>
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#EEF2FF] text-[#6366F1] rounded-xl flex items-center justify-center font-bold text-xs">
                      {log.coach?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">{log.topic}</p>
                      <p className="text-[11px] font-medium text-[#64748B]">with {log.coach?.full_name} • {new Date(log.start_time).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/sessions/${log.id}`}
                    className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline"
                  >
                    View Notes
                  </Link>
                </div>
              ))}
              {recentLogs.length === 0 && <p className="text-sm text-[#94A3B8] py-8 text-center">No session logs yet.</p>}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {nextSession ? (
            <div className="bg-[#6366F1] rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full" />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Incoming Session</p>
              <h3 className="text-xl font-bold mb-4 leading-tight">{nextSession.topic}</h3>
              <div className="flex items-center gap-3 mb-6">
                 <img src={`https://ui-avatars.com/api/?name=${nextSession.coach?.full_name}&background=fff&color=6366F1`} className="w-8 h-8 rounded-full border-2 border-[#818CF8]" />
                 <span className="text-sm font-bold">{nextSession.coach?.full_name}</span>
              </div>
              
              <a 
                href={nextSession.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-white text-[#6366F1] font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Video size={16} /> Join Meeting
              </a>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                <Video size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No scheduled sessions</p>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-widest">Recent Chats</h2>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Demo</span>
            </div>
            <div className="space-y-4">
              {recommendedCoaches.map((coach) => (
                <div key={coach.id} className="flex items-center gap-3 cursor-pointer group">
                  <img src={`https://ui-avatars.com/api/?name=${coach.full_name}&background=F1F5F9&color=6366F1`} className="w-10 h-10 rounded-full border border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-xs font-bold text-[#1E293B]">{coach.full_name}</p>
                      <p className="text-[9px] font-bold text-[#94A3B8]">Now</p>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate group-hover:text-indigo-600 transition-colors">Start a conversation with your coach...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
