import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import InstallPrompt from "@/react-app/components/InstallPrompt";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Routes>
          <InstallPrompt />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
