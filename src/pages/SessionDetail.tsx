import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  CheckSquare, 
  Paperclip, 
  ArrowLeft,
  Save,
  Loader2,
  ShieldCheck,
  User,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

export function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>(localStorage.getItem("__SIMULATED_ROLE") || "coachee");

  // Local state for notes to avoid immediate sync issues
  const [coachNotes, setCoachNotes] = useState("");
  const [coacheeNotes, setCoacheeNotes] = useState("");
  const [localActionItems, setLocalActionItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSession() {
      if (!supabase || !sessionId) return;
      
      try {
        // Handle mock IDs for demo
        if (sessionId.startsWith('mock-') || sessionId.startsWith('l')) {
          setSession({
            id: sessionId,
            topic: sessionId.startsWith('l1') ? "Strategic Focus" : "Leadership Strategy Deep Dive",
            start_time: new Date().toISOString(),
            duration_minutes: 60,
            status: "completed",
            meeting_url: "https://zoom.us/j/demo",
            coach: { full_name: "Dr. Elena Vance", email: "elena@coach.com" },
            coachee: { full_name: "Sarah Jenkins", email: "sarah@user.com" }
          });
          setCoachNotes("The coachee demonstrated excellent progress in identifying stress triggers. We discussed the dichotomy of control and how to apply it during high-stakes board meetings.");
          setCoacheeNotes("I realized that my reaction to feedback is often defensive. I need to practice the 'pause' technique we discussed.");
          setLocalActionItems([
            { text: "Practice morning reflection for 10 minutes", completed: true },
            { text: "Read 'Meditations' by Marcus Aurelius", completed: false },
            { text: "Identify 3 triggers this week", completed: true }
          ]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            coach:profiles!sessions_coach_id_fkey(full_name, email),
            coachee:profiles!sessions_coachee_id_fkey(full_name, email)
          `)
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        setSession(data);
        
        setCoachNotes(data.coach_notes || "");
        setCoacheeNotes(data.coachee_notes || "");
        setLocalActionItems(data.action_items || []);

      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {
        action_items: localActionItems,
        coach_notes: coachNotes,
        coachee_notes: coacheeNotes,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      
      setSession(prev => ({ ...prev, ...updates }));
      alert("Session log updated successfully!");
    } catch (err) {
      console.error("Error saving session:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActionItem = (index: number) => {
    const updated = [...localActionItems];
    updated[index].completed = !updated[index].completed;
    setLocalActionItems(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-[#6366F1]" size={48} />
        <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">Loading Session Workspace...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-24">
        <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">Session not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#6366F1] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] transition-colors font-bold text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to Sessions
      </button>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
               session.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
               session.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
               'bg-amber-50 text-amber-600 border border-amber-100'
             }`}>
               {session.status.replace('_', ' ')}
             </span>
             <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Session ID: {session.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">{session.topic}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#64748B]">
             <div className="flex items-center gap-2"><Calendar size={16} className="text-[#6366F1]" /> {new Date(session.start_time).toLocaleDateString()}</div>
             <div className="flex items-center gap-2"><Clock size={16} className="text-[#6366F1]" /> {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes}m)</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
           {session.meeting_url && (
             <a 
               href={session.meeting_url} 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-black transition-all"
             >
               <Video size={16} /> Join Zoom Meeting
             </a>
           )}
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-xl font-bold text-xs uppercase tracking-widest hover:border-[#6366F1] transition-all"
           >
             {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             Save Progress
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#6366F1]" />
                  <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Coach Notes</h2>
                </div>
                {userRole === 'coach' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-[#6366F1] rounded text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={10} /> Editable
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <textarea 
                  value={coachNotes}
                  onChange={e => setCoachNotes(e.target.value)}
                  readOnly={userRole !== 'coach'}
                  rows={10}
                  className={`w-full h-full bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl p-4 text-sm font-medium text-[#1E293B] focus:outline-none transition-all resize-none ${userRole === 'coach' ? 'focus:ring-2 focus:ring-[#6366F1]/20' : 'cursor-not-allowed opacity-80'}`}
                  placeholder={userRole === 'coach' ? "Detail your coaching insights..." : "No coach notes shared yet."}
                />
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-emerald-500" />
                  <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Coachee Reflections</h2>
                </div>
                {userRole === 'coachee' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={10} /> Editable
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <textarea 
                  value={coacheeNotes}
                  onChange={e => setCoacheeNotes(e.target.value)}
                  readOnly={userRole !== 'coachee'}
                  rows={10}
                  className={`w-full h-full bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl p-4 text-sm font-medium text-[#1E293B] focus:outline-none transition-all resize-none ${userRole === 'coachee' ? 'focus:ring-2 focus:ring-emerald-500/20 shadow-emerald-50' : 'cursor-not-allowed opacity-80'}`}
                  placeholder={userRole === 'coachee' ? "What are your key takeaways?" : "No reflections from coachee yet."}
                />
              </div>
            </section>
          </div>

          {/* Participants & Shared Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Coach</h3>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6366F1] font-bold">
                      {session.coach?.full_name?.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1E293B]">{session.coach?.full_name}</p>
                      <p className="text-xs font-semibold text-[#64748B]">{session.coach?.email}</p>
                   </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
                <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Coachee</h3>
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                      {session.coachee?.full_name?.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-[#1E293B]">{session.coachee?.full_name}</p>
                      <p className="text-xs font-semibold text-[#64748B]">{session.coachee?.email}</p>
                   </div>
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Action Items */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB] flex items-center gap-2">
              <CheckSquare size={16} className="text-[#6366F1]" />
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Action Items</h2>
            </div>
            <div className="p-6 space-y-4">
              {localActionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                   <button 
                     onClick={() => toggleActionItem(idx)}
                     className={`mt-0.5 h-4 w-4 rounded border transition-colors flex items-center justify-center ${
                       item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#E2E8F0] hover:border-[#6366F1]'
                     }`}
                   >
                     {item.completed && <CheckSquare size={12} />}
                   </button>
                   <span className={`text-xs font-medium ${item.completed ? 'text-[#94A3B8] line-through' : 'text-[#1E293B]'}`}>
                     {item.text}
                   </span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-[#F1F5F9]">
                 <input 
                   type="text" 
                   placeholder="Add new action item..."
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                       setLocalActionItems([...localActionItems, { text: e.currentTarget.value.trim(), completed: false }]);
                       e.currentTarget.value = "";
                     }
                   }}
                   className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 font-medium"
                 />
              </div>
            </div>
          </section>

          {/* Attachments */}
          <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFB] flex items-center gap-2">
              <Paperclip size={16} className="text-[#6366F1]" />
              <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest">Attachments</h2>
            </div>
            <div className="p-6 text-center">
               <div className="py-8 border-2 border-dashed border-[#F1F5F9] rounded-xl flex flex-col items-center gap-3">
                  <Paperclip className="text-[#94A3B8]" size={24} />
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Coming Soon: Media Storage</p>
               </div>
            </div>
          </section>

          {/* Support */}
          <div className="p-6 bg-[#EEF2FF] rounded-2xl border border-[#E0E7FF] flex items-center gap-4">
             <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#6366F1]">
                <MessageSquare size={18} />
             </div>
             <div>
                <p className="text-xs font-bold text-[#1E293B]">Need help with this session?</p>
                <button className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline">Contact Platform Support</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
