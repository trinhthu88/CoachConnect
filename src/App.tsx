import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard"; // This acts as CoacheeDashboard
import { Coaches } from "./pages/Coaches";
import { Sessions } from "./pages/Sessions";
import { CoachDashboard } from "./pages/coach/CoachDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { useAuth } from "./context/AuthContext";

// Helper to render the correct dashboard based on role
function IndexDashboard() {
  const { role, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center font-sans font-bold text-slate-300 uppercase tracking-widest animate-pulse">Loading Platform...</div>;

  // Use CURRENT_ROLE as fallback for demo if Auth is not yet configured with real users
  const activeRole = role || (window as any).__ROLE || "coachee";

  switch (activeRole) {
    case "admin":
      return <AdminDashboard />;
    case "coach":
      return <CoachDashboard />;
    case "coachee":
    default:
      return <Dashboard />;
  }
}

// Temporary role for demo simulation
const savedRole = localStorage.getItem("__SIMULATED_ROLE");
(window as any).__ROLE = savedRole || "admin"; // coachee, coach, admin

export default function App() {
  const currentRole = (window as any).__ROLE;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Dashboard Structure */}
        <Route element={<AppLayout userRole={currentRole} />}>
          <Route path="/dashboard" element={<IndexDashboard />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/sessions" element={<Sessions />} />
          
          {/* Placeholders for other routes */}
          <Route path="/chat" element={<div className="font-serif text-3xl">Messaging Center</div>} />
          <Route path="/profile" element={<div className="font-serif text-3xl">Your Profile</div>} />
          <Route path="/settings" element={<div className="font-serif text-3xl">Settings</div>} />
          
          {/* Admin Routes */}
          <Route path="/admin/coaches" element={<div className="font-serif text-3xl">Coach Directory Management</div>} />
          <Route path="/admin/registrations" element={<div className="font-serif text-3xl">New User Approvals</div>} />
        </Route>

        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}
