import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { Dashboard } from "./pages/Dashboard"; // This acts as CoacheeDashboard
import { Coaches } from "./pages/Coaches";
import { Sessions } from "./pages/Sessions";
import { CoachDashboard } from "./pages/coach/CoachDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { CoachProfile } from "./pages/coach/CoachProfile";
import { CoachDetail } from "./pages/CoachDetail";
import { PendingApprovals } from "./pages/admin/PendingApprovals";
import { ManageCoaches } from "./pages/admin/ManageCoaches";
import { ManageCoachees } from "./pages/admin/ManageCoachees";
import { CoacheeProfile } from "./pages/coachee/CoacheeProfile";
import { SessionDetail } from "./pages/SessionDetail";
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

function ProfilePage() {
  const activeRole = (window as any).__ROLE || "coachee";

  switch (activeRole) {
    case "coach":
      return <CoachProfile />;
    case "coachee":
    default:
      return <CoacheeProfile />;
  }
}

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
          <Route path="/coaches/:coachId" element={<CoachDetail />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetail />} />
          
          {/* Placeholders for other routes */}
          <Route path="/chat" element={<div className="font-serif text-3xl">Messaging Center</div>} />
          <Route path="/settings" element={<div className="font-serif text-3xl">Settings</div>} />
          
          {/* Admin Routes */}
          <Route path="/admin/coaches" element={<ManageCoaches />} />
          <Route path="/admin/registrations" element={<ManageCoachees />} />
          <Route path="/admin/approvals" element={<PendingApprovals />} />
        </Route>

        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Routes>
    </BrowserRouter>
  );
}
