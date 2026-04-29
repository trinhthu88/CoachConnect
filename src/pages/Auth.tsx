import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (loginError) throw loginError;
        navigate("/dashboard");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
            },
          },
        });
        if (signUpError) throw signUpError;
        setMessage("Check your email to confirm your account!");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 font-sans bg-[#F9FAFB]">
      {/* Left Pane - Branding & Intro */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0A0A0A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">C+</div>
            <span className="text-2xl font-bold tracking-tight italic font-serif">Connect+</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-6xl font-bold leading-[0.9] tracking-tighter">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Peak Potential.</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              The premium marketplace for elite coaching. Whether you're a world-class coach or an aspiring leader, Connect+ is your home.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Active Coaches</div>
                    <div className="text-3xl font-bold">500+</div>
                </div>
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Satisfied Leaders</div>
                    <div className="text-3xl font-bold">12k</div>
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                <ShieldCheck className="text-indigo-500" size={16} />
                Secure Verified Environment
            </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Decorative elements for mobile/tablet */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full -z-10 bg-indigo-50 opacity-50" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? "Enter your credentials to access your dashboard." : "Join our community of elite coaches and coachees."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="Marcus Aurelius"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-medium text-slate-900"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium flex gap-3"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                {message}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  {isLogin ? "Sign In" : "Register Now"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Demo Admin Access</p>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-medium">
               Email: trang.tt@erickson.vn<br />
               Password: 88Xu@ndieu
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
