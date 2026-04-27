import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function ManageCoachees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [coachees, setCoachees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoachees() {
      if (!supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, full_name, email, status, created_at, bio,
            sessions:sessions!coach_id(count)
          `)
          .eq('role', 'coachee')
          .order('created_at', { ascending: false });

        // Note: The session count query above might need adjustment depending on how supabase handles relational counts in flat select
        // For now let's just get the profiles
        
        if (error) throw error;
        setCoachees(data || []);
      } catch (err) {
        console.error("Error fetching coachees:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoachees();
  }, []);

  const filteredCoachees = coachees.filter(coachee => {
    const matchesSearch = 
      coachee.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      coachee.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || coachee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (coacheeId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', coacheeId);
      
      if (error) throw error;
      setCoachees(prev => prev.map(c => c.id === coacheeId ? { ...c, status: 'active' } : c));
    } catch (err) {
      console.error("Failed to approve coachee:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'pending_approval': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'suspended': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Coachee Registrations</h1>
          <p className="text-[#64748B] font-medium">Monitor active learners, check engagement, and manage registrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] w-full md:w-80 transition-all shadow-sm"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#1E293B] focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest border-b border-[#F1F5F9]">
                <th className="px-8 py-5">Coachee Identification</th>
                <th className="px-8 py-5">Registration Date</th>
                <th className="px-8 py-5">Sessions Info</th>
                <th className="px-8 py-5">Account Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-[#6366F1]" size={32} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gathering Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCoachees.length > 0 ? (
                filteredCoachees.map((coachee, i) => (
                  <motion.tr 
                    key={coachee.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#64748B] font-bold text-sm border border-slate-200 shrink-0">
                          {coachee.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">{coachee.full_name}</p>
                          <div className="flex items-center gap-2 text-[11px] font-medium text-[#64748B]">
                            <Mail size={10} />
                            {coachee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B]">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(coachee.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold text-[#1E293B]">--</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Sessions</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(coachee.status)}`}>
                        {coachee.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {coachee.status === 'pending_approval' && (
                          <button 
                            onClick={() => handleApprove(coachee.id)}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        <button className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#1E293B] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[#6366F1] transition-all">Details</button>
                        <button className="p-2 text-slate-400 hover:text-[#1E293B] transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No learners found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
