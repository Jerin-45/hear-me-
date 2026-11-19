import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  BookOpen,
  Sparkles,
  Camera,
  Volume2,
  FileText,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Contrast,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, updateSetting } = useSettings();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Captions', path: '/captions', icon: Mic },
    { name: 'Sign Library', path: '/sign-language', icon: BookOpen },
    { name: 'AI Explainer', path: '/sign-explainer', icon: Sparkles },
    { name: 'Camera Sign', path: '/sign-recognition', icon: Camera },
    { name: 'Text to Speech', path: '/communication', icon: Volume2 },
    { name: 'Summarizer', path: '/summarizer', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E5E5] bg-white/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold transition-transform group-hover:scale-105">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-lg tracking-tight text-black">
                  HearMe <span className="font-light text-[#777777]">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-[0.2em] text-[#777777]">
                  Accessibility
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-black text-white'
                      : 'text-[#444444] hover:text-black hover:bg-[#F7F7F7]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: High Contrast, Dialect Badge, Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* High Contrast Toggle Button */}
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                settings.highContrast
                  ? 'bg-black text-white border-black'
                  : 'border-[#E5E5E5] text-[#555555] hover:text-black hover:bg-[#F7F7F7]'
              }`}
              title="Toggle High Contrast Mode"
              aria-label="Toggle High Contrast Mode"
            >
              <Contrast className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono">{settings.highContrast ? 'Contrast ON' : 'Contrast'}</span>
            </button>

            {/* English Dialect Selector */}
            <button
              onClick={() =>
                updateSetting(
                  'speechRecognitionDialect',
                  settings.speechRecognitionDialect === 'en-IN' ? 'en-US' : 'en-IN'
                )
              }
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border border-[#E5E5E5] text-[#444444] hover:text-black hover:border-black transition-colors flex items-center gap-1.5"
              title="Switch English Dialect (India / US)"
              aria-label="Switch English Dialect"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{settings.speechRecognitionDialect === 'en-IN' ? 'EN (India)' : 'EN (US)'}</span>
            </button>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-xs text-black hover:text-[#555555] px-2 py-1 rounded-md transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[10px]">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold max-w-[100px] truncate">{user.displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-[#777777] hover:text-black transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#E5E5E5]">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black hover:bg-[#F7F7F7] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-black text-white hover:bg-[#1C1C1C] active:scale-95 transition-all flex items-center gap-1"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className="p-2 text-[#444444] hover:text-black md:hidden"
              aria-label="Toggle High Contrast"
            >
              <Contrast className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-black hover:bg-[#F7F7F7] focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#E5E5E5] bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-black text-white'
                      : 'text-[#444444] bg-[#F7F7F7] hover:bg-[#EAEAEA]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E5E5E5] flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-[#777777] font-mono">Dialect:</span>
              <button
                onClick={() =>
                  updateSetting(
                    'speechRecognitionDialect',
                    settings.speechRecognitionDialect === 'en-IN' ? 'en-US' : 'en-IN'
                  )
                }
                className="px-2.5 py-1 text-xs rounded border border-black text-black font-mono font-medium"
              >
                {settings.speechRecognitionDialect === 'en-IN' ? 'English (India)' : 'English (US)'}
              </button>
            </div>

            {user ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7]">
                <span className="text-xs font-semibold text-black">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-[#777777] hover:text-black font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-medium text-black border border-[#E5E5E5] rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-xs font-semibold text-white bg-black rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
