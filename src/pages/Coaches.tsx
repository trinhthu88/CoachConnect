import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Globe, 
  Clock, 
  Star, 
  Languages, 
  ChevronRight,
  ShieldCheck,
  Plus
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const coaches = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    role: "Executive Leadership Coach",
    specialties: ["Leadership", "Communication", "Conflict Resolution"],
    languages: ["English", "Mandarin"],
    rating: 4.9,
    reviews: 124,
    bio: "Helping leaders navigate complex organizational challenges through behavioral psychology.",
    experience: "15+ years",
    image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=F5F3FF&color=6366F1",
    availableSoon: true
  },
  {
    id: "2",
    name: "Marcus Thorne",
    role: "Product & Growth Advisor",
    specialties: ["Mindset", "Productivity", "Career Growth"],
    languages: ["English", "Vietnamese"],
    rating: 4.8,
    reviews: 89,
    bio: "Ex-Google PM lead focused on helping technical founders scale their impact and teams.",
    experience: "10+ years",
    image: "https://ui-avatars.com/api/?name=Marcus+Thorne&background=F5F3FF&color=6366F1",
    availableSoon: false
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    role: "Wellness & Performance Coach",
    specialties: ["Wellness", "Stress Management", "Confidence"],
    languages: ["English", "Spanish"],
    rating: 5.0,
    reviews: 56,
    bio: "Integrating mindfulness and professional performance to prevent burnout in high-growth roles.",
    experience: "8 years",
    image: "https://ui-avatars.com/api/?name=Elena+Rodriguez&background=F5F3FF&color=6366F1",
    availableSoon: true
  }
];

export function Coaches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Specialties");

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach, i) => (
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
                {coach.specialties.slice(0, 3).map(spec => (
                  <span key={spec} className="px-2 py-1 bg-[#F1F5F9] text-[#64748B] rounded-lg text-[9px] font-bold uppercase tracking-widest">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9]">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8] uppercase">
                        <Languages size={14} className="text-[#6366F1]" />
                        {coach.languages.length} Lgs
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
    </div>
  );
}
