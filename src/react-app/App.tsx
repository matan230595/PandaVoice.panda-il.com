import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/hooks/useAuth";
import InstallPrompt from "@/react-app/components/InstallPrompt";
import ErrorBoundary from "@/react-app/components/ErrorBoundary";

const HomePage = lazy(() => import("@/react-app/pages/Home"));
const NotFound = lazy(() => import("@/react-app/pages/NotFound"));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <InstallPrompt />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
