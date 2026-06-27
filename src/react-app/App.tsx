import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/hooks/useAuth";
import HomePage from "@/react-app/pages/Home";
import InstallPrompt from "@/react-app/components/InstallPrompt";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
          <InstallPrompt />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
