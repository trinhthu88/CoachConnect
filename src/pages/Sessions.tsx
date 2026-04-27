import React from "react";
import { 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Video, 
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const sessions = [
  {
    id: "1",
    coach: "Dr. Elena Vance",
    topic: "Strategic Planning",
    time: "Today, 2:00 PM",
    duration: "60 min",
    status: "confirmed",
    meetingUrl: "https://zoom.us/j/123456789",
    type: "Leadership"
  },
  {
    id: "2",
    coach: "Marcus Thorne",
    topic: "Focus Blocking",
    time: "Tomorrow, 10:00 AM",
    duration: "45 min",
    status: "pending_coach_approval",
    type: "Productivity"
  },
  {
    id: "3",
    coach: "Sarah Chen",
    topic: "Conflict Resolution",
    time: "Apr 20, 2026",
    duration: "60 min",
    status: "completed",
    type: "Communication"
  }
];

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
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Your Sessions</h1>
          <p className="text-[#64748B] font-medium">Manage your upcoming and past coaching appointments.</p>
        </div>
        <div className="flex bg-white border border-[#E2E8F0] p-1 rounded-xl shadow-sm">
           <button className="px-4 py-1.5 bg-[#F1F5F9] text-[#1E293B] rounded-lg text-xs font-bold uppercase tracking-widest">Upcoming</button>
           <button className="px-4 py-1.5 text-[#64748B] rounded-lg text-xs font-bold uppercase tracking-widest hover:text-[#1E293B]">Past</button>
        </div>
      </header>

      <div className="space-y-4">
        {sessions.map((session, i) => (
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
                   src={`https://ui-avatars.com/api/?name=${session.coach}&background=F1F5F9&color=6366F1`} 
                   className="w-12 h-12 rounded-full" 
                   alt={session.coach} 
                 />
                 <div>
                    <h3 className="font-bold text-[#1E293B]">{session.coach}</h3>
                    <p className="text-xs font-semibold text-[#64748B]">{session.type}</p>
                 </div>
              </div>

              <div className="flex-1 space-y-1">
                 <p className="font-bold text-[#1E293B]">{session.topic}</p>
                 <div className="flex items-center gap-4 text-[#64748B]">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar size={14} className="text-[#94A3B8]" />
                        {session.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Clock size={14} className="text-[#94A3B8]" />
                        {session.duration}
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
                   {session.status === 'confirmed' && (
                     <button className="p-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors shadow-indigo-100 shadow-lg">
                        <Video size={18} />
                     </button>
                   )}
                   <button className="p-2 bg-[#F1F5F9] text-[#64748B] rounded-lg hover:text-[#1E293B] transition-colors">
                      <MoreHorizontal size={18} />
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-[#E2E8F0] rounded-[32px] space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#1E293B]">No sessions found</h3>
            <p className="text-sm text-[#64748B]">Start your growth journey by booking a coach.</p>
          </div>
          <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-[#4F46E5] transition-all mt-4">
            Browse Coaches
          </button>
        </div>
      )}
    </div>
  );
}
