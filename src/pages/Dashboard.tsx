import React from "react";
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  ArrowUpRight,
  Plus,
  Users,
  Star,
  ShieldCheck,
  Search
} from "lucide-react";
import { motion } from "motion/react";

export function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Welcome back, Sarah</h1>
          <p className="text-[#64748B] font-medium">You have 3 coaching credits remaining this month.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all">
          <Plus size={18} />
          Book a Session
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#6366F1]">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Next Session</p>
            <p className="text-xl font-bold text-[#1F2937]">Today at 2:00 PM</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-xl flex items-center justify-center text-[#10B981]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Completed</p>
            <p className="text-xl font-bold text-[#1F2937]">12 Sessions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Recommended for you</h2>
              <button className="text-sm font-bold text-[#6366F1] hover:underline">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Dr. Elena Vance", role: "Executive Leadership", rating: "4.9", reviews: "128", seed: "Elena", color: "indigo" },
                { name: "Marcus Thorne", role: "Career Productivity", rating: "5.0", reviews: "84", seed: "Marcus", color: "emerald" }
              ].map((coach) => (
                <div key={coach.name} className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm hover:border-[#6366F1] transition-all cursor-pointer group">
                  <div className="flex gap-4">
                    <img src={`https://ui-avatars.com/api/?name=${coach.seed}&background=F5F3FF&color=6366F1`} className="w-14 h-14 rounded-xl" />
                    <div>
                      <h3 className="font-bold text-[#1E293B] group-hover:text-[#6366F1] transition-colors">{coach.name}</h3>
                      <p className="text-xs font-medium text-[#64748B]">{coach.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                        <span className="text-xs font-bold text-[#1E293B]">{coach.rating}</span>
                        <span className="text-[10px] text-[#94A3B8]">({coach.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4">Recent Session Logs</h2>
            <div className="space-y-4">
              {[
                { title: "Leadership Presence", coach: "Dr. Elena Vance", date: "Nov 12, 2024", initials: "EV", bg: "bg-[#E0F2FE]", text: "text-[#0EA5E9]" },
                { title: "Focus Blocking", coach: "Marcus Thorne", date: "Nov 05, 2024", initials: "MT", bg: "bg-[#FEF3C7]", text: "text-[#D97706]" }
              ].map((log) => (
                <div key={log.title} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${log.bg} ${log.text} rounded-full flex items-center justify-center font-bold text-xs`}>{log.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-[#1E293B]">{log.title}</p>
                      <p className="text-[11px] font-medium text-[#64748B]">with {log.coach} • {log.date}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest hover:underline">View Notes</button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#6366F1] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Incoming Session</p>
            <h3 className="text-xl font-bold mb-4 leading-tight">Strategic Planning and Stakeholder Management</h3>
            <div className="flex items-center gap-3 mb-6">
               <img src="https://ui-avatars.com/api/?name=Elena&background=fff&color=6366F1" class="w-8 h-8 rounded-full border-2 border-[#818CF8]" />
               <span className="text-sm font-medium">Dr. Elena Vance</span>
            </div>
            <div className="bg-[#4F46E5] rounded-xl p-4 mb-4">
              <div className="flex justify-between text-[10px] font-bold mb-2 opacity-80 uppercase tracking-widest">
                <span>Starts in 45m</span>
              </div>
              <div className="w-full h-1.5 bg-[#4338CA] rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-white rounded-full" />
              </div>
            </div>
            <button className="w-full py-3 bg-white text-[#6366F1] font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors text-sm">
              Join Video Room
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-widest">Recent Chats</h2>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">2 New</span>
            </div>
            <div className="space-y-4">
              {["Elena Vance", "Marcus Thorne"].map((name) => (
                <div key={name} className="flex items-center gap-3 cursor-pointer group">
                  <img src={`https://ui-avatars.com/api/?name=${name}&background=F1F5F9&color=6366F1`} className="w-10 h-10 rounded-full border border-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-xs font-bold text-[#1E293B]">{name}</p>
                      <p className="text-[9px] font-bold text-[#94A3B8]">14:02</p>
                    </div>
                    <p className="text-[11px] text-[#64748B] truncate group-hover:text-indigo-600 transition-colors">Framework sent, check your notes...</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-[#F1F5F9] text-[#64748B] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F1F5F9] transition-colors">
              Open Inbox
            </button>
          </div>

          <div className="bg-[#F1F5F9] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">Need help choosing?</p>
            <button className="w-full py-3 bg-[#1E293B] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0F172A] transition-colors shadow-sm">
              <Search size={16} />
              Match Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
