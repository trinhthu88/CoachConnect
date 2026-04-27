import React, { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Search
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

export function PendingApprovals() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'coaches' | 'coachees'>('coaches');
  const [pendingCoaches, setPendingCoaches] = useState<any[]>([]);
  const [pendingCoachees, setPendingCoachees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) return;

      const [coachesRes, coacheesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            id, full_name, email,
            coach_profiles!inner (
              title, specialties, nationality, country_based, 
              diplomas_certifications, years_experience, approval_status
            )
          `)
          .eq('role', 'coach')
          .eq('coach_profiles.approval_status', 'pending_approval'),
        supabase
          .from('profiles')
          .select('id, full_name, email, created_at, bio, status')
          .eq('role', 'coachee')
          .eq('status', 'pending_approval')
      ]);

      setPendingCoaches(coachesRes.data || []);
      setPendingCoachees(coacheesRes.data || []);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCoach = async (id: string, approve: boolean) => {
    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('coach_profiles')
        .update({ approval_status: approve ? 'active' : 'rejected' })
        .eq('id', id);

      if (error) throw error;

      if (approve) {
        await supabase.from('profiles').update({ status: 'active' }).eq('id', id);
      }

      setPendingCoaches(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error approving coach:", err);
    }
  };

  const handleApproveCoachee = async (id: string, approve: boolean) => {
    try {
      if (!supabase) return;

      const { error } = await supabase
        .from('profiles')
        .update({ status: approve ? 'active' : 'rejected' })
        .eq('id', id);

      if (error) throw error;
      setPendingCoachees(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error approving coachee:", err);
    }
  };

  const filteredCoaches = pendingCoaches.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoachees = pendingCoachees.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight mb-2">Pending Approvals</h1>
          <p className="text-[#64748B] font-medium">Review and verify applications across the platform.</p>
        </div>
        <div className="flex bg-white border border-[#E2E8F0] p-1 rounded-2xl shadow-sm">
          <button 
            onClick={() => setActiveTab('coaches')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'coaches' ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:bg-slate-50'}`}
          >
            Coaches ({pendingCoaches.length})
          </button>
          <button 
            onClick={() => setActiveTab('coachees')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'coachees' ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:bg-slate-50'}`}
          >
            Learners ({pendingCoachees.length})
          </button>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between bg-[#F8FAFB]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input 
              type="text" 
              placeholder={`Search pending ${activeTab}...`} 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#6366F1]" size={32} />
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Scanning applications...</p>
          </div>
        ) : activeTab === 'coaches' ? (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredCoaches.length > 0 ? filteredCoaches.map((coach, i) => (
              <motion.div 
                key={coach.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 hover:bg-slate-50 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-xl border border-[#E0E7FF]">
                        {coach.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#1E293B]">{coach.full_name}</h3>
                        <p className="text-xs font-semibold text-[#64748B]">{coach.coach_profiles?.title}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px] font-medium text-[#94A3B8]">
                       <div className="flex items-center gap-2 font-bold"><Mail size={12} /> {coach.email}</div>
                       <div className="flex items-center gap-2 font-bold"><Clock size={12} /> {coach.coach_profiles?.years_experience} Years Exp.</div>
                    </div>
                  </div>

                  {/* Expertise & Education */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {coach.coach_profiles?.specialties?.map((s: string) => (
                          <span key={s} className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-[9px] font-bold text-[#64748B] uppercase tracking-tight">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Diplomas & Certifications</p>
                      <div className="space-y-1.5">
                        {coach.coach_profiles?.diplomas_certifications?.map((d: string) => (
                          <div key={d} className="flex items-center gap-2 text-xs font-medium text-[#1E293B]">
                             <CheckCircle2 size={12} className="text-emerald-500" /> {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 justify-center">
                    <button 
                      onClick={() => handleApproveCoach(coach.id, true)}
                      className="w-full py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                    >
                      <CheckCircle2 size={14} /> Approve Coach
                    </button>
                    <button 
                      onClick={() => handleApproveCoach(coach.id, false)}
                      className="w-full py-3 border border-[#E2E8F0] text-[#64748B] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                 <ShieldAlert size={48} className="text-[#F1F5F9]" />
                 <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">No pending coaches found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {filteredCoachees.length > 0 ? filteredCoachees.map((coachee, i) => (
              <motion.div 
                key={coachee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-8 hover:bg-slate-50 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl border border-slate-200">
                        {coachee.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#1E293B]">{coachee.full_name}</h3>
                        <p className="text-xs font-semibold text-[#64748B]">Learner Profile</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px] font-medium text-[#94A3B8]">
                       <div className="flex items-center gap-2 font-bold"><Mail size={12} /> {coachee.email}</div>
                       <div className="flex items-center gap-2 font-bold"><Calendar size={12} /> Joined {new Date(coachee.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="lg:col-span-2 space-y-3">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Personal Bio</p>
                    <p className="text-sm text-[#475569] leading-relaxed line-clamp-4 italic border-l-4 border-indigo-100 pl-4 py-1">
                      "{coachee.bio || 'No bio provided.'}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 justify-center">
                    <button 
                      onClick={() => handleApproveCoachee(coachee.id, true)}
                      className="w-full py-3 bg-[#6366F1] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#4F46E5] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                    >
                      <CheckCircle2 size={14} /> Approve Learner
                    </button>
                    <button 
                      onClick={() => handleApproveCoachee(coachee.id, false)}
                      className="w-full py-3 border border-[#E2E8F0] text-[#64748B] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                 <ShieldAlert size={48} className="text-[#F1F5F9]" />
                 <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">No pending learners found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Calendar({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function Mail({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <rect x="2" y="5" width="20" height="14" rx="2" />
    </svg>
  );
}

