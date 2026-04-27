import React, { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function ManageCoaches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoaches() {
      if (!supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, full_name, email, status, created_at,
            coach_profiles (
              title,
              approval_status,
              rating_avg,
              years_experience
            )
          `)
          .eq('role', 'coach')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCoaches(data || []);
      } catch (err) {
        console.error("Error fetching coaches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCoaches();
  }, []);

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = 
      coach.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      coach.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || coach.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'suspended': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-indigo-50 text-indigo-600';
      case 'pending_approval': return 'bg-amber-50 text-amber-600';
      case 'rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Manage Coaches</h1>
          <p className="text-[#64748B] font-medium">Audit coach profiles, update status, and manage platform experts.</p>
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
                <th className="px-8 py-5">Coach Details</th>
                <th className="px-8 py-5">Title & Stats</th>
                <th className="px-8 py-5">Approval</th>
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Experts...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach, i) => (
                  <motion.tr 
                    key={coach.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] font-bold text-lg border border-[#E0E7FF] shrink-0">
                          {coach.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">{coach.full_name}</p>
                          <p className="text-[11px] font-medium text-[#64748B]">{coach.email}</p>
                          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight mt-1">Joined {new Date(coach.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-[#1E293B]">{coach.coach_profiles?.title || "N/A"}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-500">
                             <Star size={10} className="fill-yellow-500" />
                             {coach.coach_profiles?.rating_avg || '5.0'}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-300" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{coach.coach_profiles?.years_experience || 0} Yrs Experience</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${getApprovalColor(coach.coach_profiles?.approval_status)}`}>
                        {coach.coach_profiles?.approval_status?.replace('_', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(coach.status)}`}>
                        {coach.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/coaches/${coach.id}`} 
                          className="p-2 text-slate-400 hover:text-[#6366F1] transition-colors"
                          title="View Profile"
                        >
                          <ExternalLink size={18} />
                        </Link>
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
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No coaches found matching your criteria</p>
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
