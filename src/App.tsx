import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ChatScreen } from './pages/ChatScreen';
import { FileText, Loader2 } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen w-screen bg-[#F7F7F4] flex flex-col items-center justify-center p-4 select-none">
      <div
        className="flex flex-col items-center p-8 rounded-3xl bg-[#FFFFFF]"
        style={{
          boxShadow: '8px 8px 24px rgba(0,0,0,0.06), -8px -8px 24px rgba(255,255,255,0.9)',
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl bg-[#F7F7F4] flex items-center justify-center mb-4 text-[#047857]"
          style={{
            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.04), inset -3px -3px 6px rgba(255,255,255,0.8)',
          }}
        >
          <FileText className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#171717] tracking-tight mb-1">
          <span>ResumeAI</span>
          <Loader2 className="w-4 h-4 animate-spin text-[#047857]" />
        </div>
        <p className="text-xs text-[#737373]">Checking your session...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
