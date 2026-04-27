import React from "react";
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  pending_coach_approval: "bg-amber-50 text-amber-600 border-amber-100",
  completed: "bg-slate-50 text-slate-500 border-slate-100",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

const statusIcons = {
  confirmed: <CheckCircle2 size={14} />,
  pending_coach_approval: <Clock size={14} />,
  completed: <CheckCircle2 size={14} />,
  cancelled: <XCircle size={14} />,
};

export function Sessions() {
  const userRole = localStorage.getItem("__SIMULATED_ROLE") || "coachee";

  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<"upcoming" | "past">("upcoming");

  // Mock sessions for demonstration if DB is empty
  const mockSessions = [
    {
      id: "mock-1",
      topic: "Strategic Leadership Framework",
      start_time: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      duration_minutes: 60,
      status: "completed",
      coach: { full_name: "Dr. Elena Vance" },
      coachee: { full_name: "Sarah Jenkins" },
      meeting_url: "https://zoom.us/j/123"
    },
    {
      id: "mock-2",
      topic: "EQ & Behavioral Economics",
      start_time: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      duration_minutes: 45,
      status: "completed",
      coach: { full_name: "Marcus Aurelius" },
      coachee: { full_name: "Sarah Jenkins" }
    }
  ];

  React.useEffect(() => {
    async function fetchSessions() {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            coach:profiles!sessions_coach_id_fkey(full_name),
            coachee:profiles!sessions_coachee_id_fkey(full_name)
          `)
          .order('start_time', { ascending: filter === 'upcoming' });
        
        if (error) throw error;
        
        // If DB has data, use it. Otherwise, use mock data specifically for the coachee view demo
        if (data && data.length > 0) {
          setSessions(data);
        } else {
          setSessions(mockSessions);
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions(mockSessions); // Fallback to mock on error too
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [filter]);

  const filteredSessions = sessions.filter(s => {
    const isPast = new Date(s.start_time).getTime() < Date.now();
    return filter === 'upcoming' ? !isPast : isPast;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Your Sessions</h1>
          <p className="text-[#64748B] font-medium">Manage your {filter} coaching appointments.</p>
        </div>
        <div className="flex bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-sm self-start sm:self-auto">
           <button 
             onClick={() => setFilter("upcoming")}
             className={cn(
               "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
               filter === 'upcoming' ? "bg-[#F1F5F9] text-[#1E293B]" : "text-[#64748B] hover:text-[#1E293B]"
             )}
           >
             Upcoming
           </button>
           <button 
             onClick={() => setFilter("past")}
             className={cn(
               "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
               filter === 'past' ? "bg-[#F1F5F9] text-[#1E293B]" : "text-[#64748B] hover:text-[#1E293B]"
             )}
           >
             Past
           </button>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
           <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-[#6366F1]" size={32} />
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Searching records...</p>
           </div>
        ) : filteredSessions.map((session, i) => (
          <motion.div 
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 shrink-0">
                 <img 
                   src={`https://ui-avatars.com/api/?name=${userRole === 'coach' ? (session.coachee?.full_name || 'User') : (session.coach?.full_name || 'Coach')}&background=F1F5F9&color=6366F1`} 
                   className="w-12 h-12 rounded-full" 
                   alt="Avatar" 
                 />
                 <div>
                    <h3 className="font-bold text-[#1E293B]">{userRole === 'coach' ? session.coachee?.full_name : session.coach?.full_name}</h3>
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{userRole === 'coach' ? 'Coachee' : 'Coach'}</p>
                 </div>
              </div>

              <div className="flex-1 space-y-1">
                 <p className="font-bold text-[#1E293B]">{session.topic}</p>
                 <div className="flex items-center gap-4 text-[#64748B]">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar size={14} className="text-[#94A3B8]" />
                        {new Date(session.start_time).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Clock size={14} className="text-[#94A3B8]" />
                        {session.duration_minutes} min
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4 justify-between md:justify-end">
                <div className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                  statusStyles[session.status as keyof typeof statusStyles]
                )}>
                  {statusIcons[session.status as keyof typeof statusIcons]}
                  {session.status.replace(/_/g, ' ')}
                </div>
                
                <div className="flex items-center gap-2">
                   {session.status === 'confirmed' && session.meeting_url && (
                     <a 
                       href={session.meeting_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors shadow-indigo-100 shadow-lg"
                     >
                        <Video size={18} />
                     </a>
                   )}
                   <Link 
                     to={`/sessions/${session.id}`}
                     className="p-2 bg-[#F1F5F9] text-[#64748B] rounded-lg hover:text-[#1E293B] transition-colors"
                   >
                      <FileText size={18} />
                   </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && filteredSessions.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-[#E2E8F0] rounded-[32px] space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1E293B]">No {filter} sessions</h3>
            <p className="text-sm text-[#64748B]">
              {filter === 'upcoming' 
                ? "Start your growth journey by booking a coach." 
                : "You haven't completed any sessions yet."}
            </p>
          </div>
          {filter === 'upcoming' && (
            <Link to="/coaches" className="inline-block px-6 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all mt-4">
              Browse Coaches
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
