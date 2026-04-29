import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Auth } from "./pages/Auth";
import { UserRole } from "./lib/supabase";

// Protected Route Component
function ProtectedRoute({ children, role: requiredRole }: { children: React.ReactNode, role?: UserRole }) {
  const { user, role, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="h-screen flex items-center justify-center font-sans font-bold text-slate-300 uppercase tracking-widest animate-pulse">
      Loading Platform...
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Helper to render the correct dashboard based on role
function IndexDashboard() {
  const { role, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center font-sans font-bold text-slate-300 uppercase tracking-widest animate-pulse">Loading Platform...</div>;

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "coach":
      return <CoachDashboard />;
    case "coachee":
    default:
      return <Dashboard />;
  }
}

function ProfilePage() {
  const { role } = useAuth();

  switch (role) {
    case "coach":
      return <CoachProfile />;
    case "coachee":
    default:
      return <CoacheeProfile />;
  }
}

export default function App() {
  const { role } = useAuth();
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Core Dashboard Structure */}
        <Route element={<ProtectedRoute><AppLayout userRole={role || 'coachee'} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<IndexDashboard />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/coaches/:coachId" element={<CoachDetail />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sessions/:sessionId" element={<SessionDetail />} />
          
          <Route path="/chat" element={<div className="font-serif text-3xl">Messaging Center</div>} />
          <Route path="/settings" element={<div className="font-serif text-3xl">Settings</div>} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/coaches" element={<ProtectedRoute role="admin"><ManageCoaches /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute role="admin"><ManageCoachees /></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><PendingApprovals /></ProtectedRoute>} />
        </Route>

        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
      </Routes>
    </HashRouter>
  );
}
