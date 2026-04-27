import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Globe, 
  Clock, 
  Star, 
  Languages, 
  ChevronRight,
  ShieldCheck,
  Plus,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";

export function Coaches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Specialties");
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoaches() {
      if (!supabase) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            avatar_url, 
            bio,
            coach_profiles!inner (
              title,
              specialties,
              rating_avg,
              sessions_completed,
              years_experience
            )
          `)
          .eq('role', 'coach')
          .eq('status', 'active');

        if (error) throw error;
        
        const mappedCoaches = (data || []).map(p => ({
          id: p.id,
          name: p.full_name,
          role: p.coach_profiles?.title || "Professional Coach",
          specialties: p.coach_profiles?.specialties || [],
          rating: p.coach_profiles?.rating_avg || 5.0,
          bio: p.bio || "No bio available.",
          image: p.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=F5F3FF&color=6366F1`,
          experience: `${p.coach_profiles?.years_experience || 0}+ years`
        }));

        setCoaches(mappedCoaches);
      } catch (err) {
        console.error("Error fetching coaches:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCoaches();
  }, []);

  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "All Specialties" || c.specialties.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Discover Coaches</h1>
            <p className="text-[#64748B] font-medium">Find your perfect guide to accelerate your professional growth.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-[#1E293B] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#0F172A] transition-all">
            <Plus size={18} />
            Match Me
          </button>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, specialty, or language..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all text-[#1E293B] font-medium placeholder:text-[#94A3B8]"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm hover:border-[#6366F1] hover:text-[#6366F1] transition-all font-bold text-[#64748B]">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </header>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {["All Specialties", "Leadership", "Productivity", "Mindset", "Communication", "Wellness"].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "whitespace-nowrap px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest",
              activeCategory === cat
                ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-100" 
                : "bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1] hover:text-[#6366F1]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Coaches */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
           <Loader2 className="animate-spin text-[#6366F1]" size={48} />
           <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">Finding Coaches...</p>
        </div>
      ) : filteredCoaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach, i) => (
            <motion.div 
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:border-[#6366F1] hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <img src={coach.image} alt={coach.name} className="w-14 h-14 rounded-xl border border-slate-100" />
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 font-bold text-xs border border-amber-100">
                    <Star size={12} fill="currentColor" />
                    {coach.rating}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">{coach.name}</h3>
                  <p className="text-xs font-semibold text-[#64748B]">{coach.role}</p>
                </div>

                <p className="text-[#64748B] text-xs leading-relaxed line-clamp-3 font-medium italic">
                  "{coach.bio}"
                </p>

                <div className="flex flex-wrap gap-2">
                  {coach.specialties.slice(0, 3).map((spec: string) => (
                    <span key={spec} className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] rounded-lg text-[9px] font-bold uppercase tracking-widest">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                  <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] uppercase">
                          <Clock size={14} className="text-[#6366F1]" />
                          {coach.experience}
                      </div>
                  </div>
                  <button className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest group-hover:underline">
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-[#E2E8F0] rounded-2xl border-dashed">
           <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">No coaches found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
