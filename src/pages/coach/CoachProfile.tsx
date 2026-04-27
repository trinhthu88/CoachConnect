import React, { useEffect, useState } from "react";
import { 
  User, 
  MapPin, 
  Globe, 
  Award, 
  Tags, 
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";

export function CoachProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    title: "",
    nationality: "",
    country_based: "",
    specialties: [] as string[],
    diplomas_certifications: [] as string[],
    years_experience: 0,
    approval_status: "pending_approval"
  });

  const [newSpecialty, setNewSpecialty] = useState("");
  const [newDiploma, setNewDiploma] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      if (!supabase) return;

      try {
        // For demo, we find the first coach. In production, this matches auth.uid()
        const { data: coaches } = await supabase.from('profiles').select('id').eq('role', 'coach').limit(1);
        const coachId = coaches?.[0]?.id;

        if (coachId) {
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              full_name, bio,
              coach_profiles (
                title, specialties, nationality, country_based, 
                diplomas_certifications, years_experience, approval_status
              )
            `)
            .eq('id', coachId)
            .single();

          if (error) throw error;

          if (data) {
            setProfile({
              full_name: data.full_name,
              bio: data.bio || "",
              title: data.coach_profiles?.title || "",
              nationality: data.coach_profiles?.nationality || "",
              country_based: data.coach_profiles?.country_based || "",
              specialties: data.coach_profiles?.specialties || [],
              diplomas_certifications: data.coach_profiles?.diplomas_certifications || [],
              years_experience: data.coach_profiles?.years_experience || 0,
              approval_status: data.coach_profiles?.approval_status || "pending_approval"
            });
          }
        }
      } catch (err) {
        console.error("Error fetching coach profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    
    try {
      const { data: coaches } = await supabase.from('profiles').select('id').eq('role', 'coach').limit(1);
      const coachId = coaches?.[0]?.id;

      if (!coachId) throw new Error("Coach ID not found");

      // Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: profile.full_name,
          bio: profile.bio 
        })
        .eq('id', coachId);

      if (profileError) throw profileError;

      // Update coach specific data - Resetting status to pending on update
      const { error: coachError } = await supabase
        .from('coach_profiles')
        .update({
          title: profile.title,
          nationality: profile.nationality,
          country_based: profile.country_based,
          specialties: profile.specialties,
          diplomas_certifications: profile.diplomas_certifications,
          years_experience: profile.years_experience,
          approval_status: 'pending_approval' // Resubmit for approval
        })
        .eq('id', coachId);

      if (coachError) throw coachError;

      setStatus("success");
      setMessage("Profile submitted for admin approval.");
      setProfile(prev => ({ ...prev, approval_status: 'pending_approval' }));
    } catch (err) {
      console.error("Error saving profile:", err);
      setStatus("error");
      setMessage("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = (type: 'specialties' | 'diplomas_certifications', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));
    setter("");
  };

  const removeItem = (type: 'specialties' | 'diplomas_certifications', index: number) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="animate-spin text-[#6366F1]" size={48} />
        <p className="text-sm font-bold text-[#94A3B8] uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight mb-2">My Professional Profile</h1>
          <p className="text-[#64748B] font-medium">Manage your public information and expertise.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border flex items-center gap-2 ${
          profile.approval_status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          profile.approval_status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
          'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {profile.approval_status === 'active' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          Status: {profile.approval_status.replace('_', ' ')}
        </div>
      </header>

      {status !== "idle" && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            status === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {status === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-bold">{message}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest border-b border-[#F1F5F9] pb-4 flex items-center gap-2">
              <User size={14} className="text-[#6366F1]" /> Basic Information
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.full_name}
                    onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Professional Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Executive Leadership Coach"
                    value={profile.title}
                    onChange={e => setProfile(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <Globe size={11} /> Nationality
                  </label>
                  <input 
                    type="text" 
                    value={profile.nationality}
                    onChange={e => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={11} /> Country Based
                  </label>
                  <input 
                    type="text" 
                    value={profile.country_based}
                    onChange={e => setProfile(prev => ({ ...prev, country_based: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
                  <FileText size={11} /> Short Description
                </label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 transition-all resize-none"
                  placeholder="Share your coaching philosophy and impact..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest border-b border-[#F1F5F9] pb-4 flex items-center gap-2">
              <Award size={14} className="text-[#6366F1]" /> Diplomas & Certifications
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add a certification..."
                  value={newDiploma}
                  onChange={e => setNewDiploma(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                />
                <button 
                  onClick={() => addItem('diplomas_certifications', newDiploma, setNewDiploma)}
                  className="px-4 bg-[#6366F1] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {profile.diplomas_certifications.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl">
                    <span className="text-sm font-medium text-[#1E293B]">{item}</span>
                    <button onClick={() => removeItem('diplomas_certifications', idx)} className="text-red-400 hover:text-red-600">
                      <AlertCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
            <h2 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-widest border-b border-[#F1F5F9] pb-4 flex items-center gap-2">
              <Tags size={14} className="text-[#6366F1]" /> Expertises
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Stoicism"
                  value={newSpecialty}
                  onChange={e => setNewSpecialty(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#F8FAFB] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                />
                <button 
                  onClick={() => addItem('specialties', newSpecialty, setNewSpecialty)}
                  className="p-2 bg-[#6366F1] text-white rounded-lg hover:bg-black transition-all"
                >
                  <Save size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((item, idx) => (
                  <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-[#EEF2FF] text-[#6366F1] border border-[#E0E7FF] rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    {item}
                    <button onClick={() => removeItem('specialties', idx)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#6366F1] text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Save & Submit"}
          </button>
          <p className="text-[10px] text-center text-[#94A3B8] font-medium leading-relaxed">
            Note: Changes will be hidden from the platform until an administrator reviews and approves your updated profile.
          </p>
        </div>
      </div>
    </div>
  );
}
