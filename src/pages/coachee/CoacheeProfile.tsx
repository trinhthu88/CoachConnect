import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Save,
  Send
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

export function CoacheeProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: ""
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!supabase) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          bio: data.bio || ""
        });
      } catch (err) {
        console.error("Error fetching coachee profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, ...formData });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!supabase || !profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'pending_approval' })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, status: 'pending_approval' });
      setMessage({ type: 'success', text: 'Submitted for approval! An admin will review your profile soon.' });
    } catch (err) {
      console.error("Approval submission failed:", err);
      setMessage({ type: 'error', text: 'Failed to submit for approval.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-[#6366F1]" size={48} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading your learner profile...</p>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (profile?.status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">Verified Learner</span>
          </div>
        );
      case 'pending_approval':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <Clock size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">Pending Approval</span>
          </div>
        );
      case 'suspended':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            <AlertCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">Account Restricted</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100">
            <User size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">New Registration</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-[#1E293B] tracking-tight">Learner Profile</h1>
          <p className="text-[#64748B] font-medium">Manage your personal information and account status.</p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
            >
              {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p className="text-sm font-bold">{message.text}</p>
            </motion.div>
          )}

          <form onSubmit={handleUpdate} className="bg-white rounded-[32px] p-8 border border-[#E2E8F0] shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#6366F1] transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 bg-[#F8FAFB] border border-[#F1F5F9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Personal Bio</label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself, your career goals, and what you hope to achieve with coaching..."
                  rows={6}
                  className="w-full p-4 bg-[#F8FAFB] border border-[#F1F5F9] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] font-medium transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-[#6366F1] text-white rounded-2xl font-bold hover:bg-[#4F46E5] transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </form>

          {profile?.status === 'active' && (
             <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 flex gap-6 items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-emerald-900">Your account is verified</h3>
                  <p className="text-emerald-700 text-sm font-medium opacity-80 leading-relaxed">
                    You have full access to discover coaches and book sessions. Keep your bio updated to help coaches understand your needs better!
                  </p>
                </div>
             </div>
          )}

          {profile?.status === 'pending_approval' && (
             <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-6 items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                  <Clock size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-amber-900">Profile under review</h3>
                  <p className="text-amber-700 text-sm font-medium opacity-80 leading-relaxed">
                    Your profile has been submitted and is currently being reviewed by our administrators. We will notify you once you are verified.
                  </p>
                </div>
             </div>
          )}

          {(profile?.status !== 'active' && profile?.status !== 'pending_approval') && (
            <section className="p-8 bg-[#EEF2FF] rounded-[32px] border border-[#E0E7FF] space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#4338CA]">
                  {profile?.status === 'rejected' ? 'Application rejected' : 'Ready to start coaching?'}
                </h2>
                <p className="text-[#6366F1] font-medium text-sm">
                  {profile?.status === 'rejected' 
                    ? 'Your previous application was rejected. Please update your profile with more details and resubmit for review.'
                    : 'To start booking sessions with our world-class coaches, you need to submit your profile for admin verification.'}
                </p>
              </div>
              <button 
                onClick={handleSubmitForApproval}
                disabled={saving || !formData.full_name || !formData.bio}
                className="w-full py-4 bg-white border-2 border-[#6366F1] text-[#6366F1] rounded-2xl font-bold hover:bg-[#6366F1] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {profile?.status === 'rejected' ? 'Resubmit for Approval' : 'Submit for Approval'}
              </button>
              {(!formData.full_name || !formData.bio) && (
                <p className="text-[10px] text-center text-[#94A3B8] font-bold uppercase tracking-tight">
                  Please fill in your name and bio before submitting.
                </p>
              )}
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email Address</p>
                  <p className="font-bold text-slate-700">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Joined Date</p>
                  <p className="font-bold text-slate-700">{new Date(profile?.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
               <p className="text-sm font-medium text-slate-300 mb-6 leading-relaxed">
                 Need help with your account or have questions about the verification process?
               </p>
               <button className="w-full py-3 bg-[#6366F1] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#4F46E5] transition-colors">
                 Contact Support
               </button>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-10">
               <ShieldCheck size={120} />
             </div>
          </div>
        </div>
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
