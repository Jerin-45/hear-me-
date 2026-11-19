import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIAssistantModal } from './components/AIAssistantModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CaptionsPage } from './pages/CaptionsPage';
import { SignLanguagePage } from './pages/SignLanguagePage';
import { SignExplainerPage } from './pages/SignExplainerPage';
import { SignRecognitionPage } from './pages/SignRecognitionPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <SettingsProvider>
          <div className="flex flex-col min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Application Routes */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/captions" element={<CaptionsPage />} />
                <Route path="/sign-language" element={<SignLanguagePage />} />
                <Route path="/sign-explainer" element={<SignExplainerPage />} />
                <Route path="/sign-recognition" element={<SignRecognitionPage />} />
                <Route path="/communication" element={<CommunicationPage />} />
                <Route path="/summarizer" element={<SummarizerPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* Fallback to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Hearing Accessibility AI Assistant Modal / Floating Drawer */}
            <AIAssistantModal />

            {/* Accessible Footer */}
            <Footer />
          </div>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
