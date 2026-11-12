import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  Shield,
  UserCheck,
  GraduationCap,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Calendar,
  Layers,
  Compass,
  Eye,
  EyeOff,
  Ticket,
  Flame,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { Button, Input, Alert, Modal } from '../../components/ui';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type Mode = 'SIGN_IN' | 'SIGN_UP';
type PortalTab = 'USER' | 'TEAM' | 'ADMIN';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // Mode: Sign In vs. Student Sign Up
  const [mode, setMode] = useState<Mode>('SIGN_IN');

  // Sign In States
  const [activePortal, setActivePortal] = useState<PortalTab>('USER');
  const [email, setEmail] = useState('srijita.13103@stu.upes.ac.in');
  const [password, setPassword] = useState('Student@12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign Up States (For New Students)
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpDepartment, setSignUpDepartment] = useState('School of Computer Science');
  const [signUpCollege, setSignUpCollege] = useState('UPES Dehradun');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Switch Portal in Sign In mode
  const handlePortalSwitch = (portal: PortalTab) => {
    setActivePortal(portal);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Provide pre-populated credentials for ease of testing
    if (portal === 'ADMIN') {
      setEmail('Rajesh.Admin@upes.ac.in');
      setPassword('Admin@12345678');
    } else if (portal === 'TEAM') {
      setEmail('srijita.13103.oc@stu.upes.ac.in');
      setPassword('RohanNewPassword@999');
    } else {
      setEmail('srijita.13103@stu.upes.ac.in');
      setPassword('Student@12345678');
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { redirectPath } = await authService.loginWithCredentials(
        email.trim(),
        password,
        activePortal
      );
      onLoginSuccess();
      navigate(redirectPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your institutional credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSignUpLoading(true);

    try {
      await authService.registerStudent({
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        phone: signUpPhone.trim(),
        department: signUpDepartment.trim(),
        college: signUpCollege.trim(),
      });

      setSuccessMessage('Student account created successfully in PostgreSQL! Switching to Sign In...');
      setTimeout(() => {
        setMode('SIGN_IN');
        setActivePortal('USER');
        setEmail(signUpEmail.trim().toLowerCase());
        setPassword(signUpPassword);
        setSuccessMessage(null);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to register student account. Please try again.');
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const res = await authService.requestPasswordReset(forgotEmail.trim().toLowerCase());
      setForgotSuccess(res.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setForgotError(err.message);
      } else {
        setForgotError('Failed to dispatch recovery link.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#0c0a1d] via-[#140e2e] to-[#1a113a] overflow-hidden font-sans select-none">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] bg-indigo-500/20 rounded-full blur-[180px] pointer-events-none" />

      {/* Main Outer Bezel Frame */}
      <div className="w-full max-w-5xl rounded-[36px] p-2.5 sm:p-3 bg-white/[0.04] backdrop-blur-3xl border border-white/[0.12] shadow-2xl shadow-purple-950/60 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[30px] overflow-hidden bg-slate-950/50 backdrop-blur-2xl border border-white/[0.08]">

          {/* ========================================================= */}
          {/* LEFT HERO PANEL: EVENTRA Glass Artwork & Organic Pods     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative bg-gradient-to-br from-purple-950/70 via-indigo-950/50 to-slate-950/90 border-b lg:border-b-0 lg:border-r border-white/[0.08] overflow-hidden">
            
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-0 bg-radial from-purple-500/15 via-transparent to-transparent pointer-events-none" />

            {/* Top Brand Identity */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/15 text-purple-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>UPES Campus Fest Ecosystem</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300 tracking-tight">
                  EVENTRA
                </h1>
                <p className="text-xs text-purple-200/70 font-medium tracking-wide mt-1">
                  University Event Management &amp; Operations Platform
                </p>
              </div>
            </div>

            {/* Center Organic Pebble Pods (Inspired by Reference Design) */}
            <div className="my-8 relative z-10 flex flex-col items-center justify-center space-y-5">
              
              {/* Pod 1: Fest Discovery & Pass (Top Pebble) */}
              <div className="w-full max-w-[270px] p-5 rounded-[28px] rounded-tl-[8px] bg-gradient-to-br from-white/[0.12] to-white/[0.03] backdrop-blur-xl border border-white/20 shadow-xl shadow-purple-950/50 flex items-center gap-4 transform hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/40 shrink-0">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide">Live Fest Discovery</h4>
                  <p className="text-[11px] text-purple-200/70 mt-0.5 leading-snug">
                    ACID-locked passes with digital QR badges.
                  </p>
                </div>
              </div>

              {/* Pod 2: Unified Command Hub (Bottom Pebble) */}
              <div className="w-full max-w-[270px] p-5 rounded-[28px] rounded-br-[8px] bg-gradient-to-br from-white/[0.12] to-white/[0.03] backdrop-blur-xl border border-white/20 shadow-xl shadow-purple-950/50 flex items-center gap-4 transform hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white tracking-wide">Command &amp; Operations</h4>
                  <p className="text-[11px] text-purple-200/70 mt-0.5 leading-snug">
                    OC checklists, work proofs &amp; real-time messenger.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Institutional Seal Quote */}
            <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-purple-200/60">
              <span className="font-mono text-[10px]">UPES • Bidholi Campus</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                System Active
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT AUTH PANEL: Dual Mode (Sign In / Sign Up)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/[0.02] backdrop-blur-md">
            
            {/* Mode Switcher Tabs (Sign In vs Student Sign Up) */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex gap-1.5 p-1 rounded-2xl bg-black/30 border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode('SIGN_IN')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'SIGN_IN'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40'
                      : 'text-purple-200/70 hover:text-white'
                  }`}
                >
                  Institutional Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('SIGN_UP')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    mode === 'SIGN_UP'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40'
                      : 'text-purple-200/70 hover:text-white'
                  }`}
                >
                  New Student Registration
                </button>
              </div>

              <span className="text-[11px] text-purple-200/50 hidden sm:inline font-mono">
                {mode === 'SIGN_IN' ? 'Portal Gateway' : 'Enrolled Students'}
              </span>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* MODE 1: INSTITUTIONAL SIGN IN                           */}
            {/* ------------------------------------------------------- */}
            {mode === 'SIGN_IN' && (
              <div className="space-y-6">
                {/* 3 Portal Role Switcher */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-wider font-extrabold text-purple-200/70 block">
                    Choose Destination Operational Console:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Student Portal Tab */}
                    <button
                      type="button"
                      onClick={() => handlePortalSwitch('USER')}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        activePortal === 'USER'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/30'
                          : 'bg-white/[0.04] border-white/10 text-purple-200/60 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <GraduationCap className={`w-5 h-5 ${activePortal === 'USER' ? 'text-purple-300' : 'text-purple-200/50'}`} />
                      <span className="text-xs font-bold block">Student Portal</span>
                      <span className="text-[9px] text-purple-200/50 hidden sm:block">Discovery &amp; Passes</span>
                    </button>

                    {/* OC Work Desk Tab */}
                    <button
                      type="button"
                      onClick={() => handlePortalSwitch('TEAM')}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        activePortal === 'TEAM'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/30'
                          : 'bg-white/[0.04] border-white/10 text-purple-200/60 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <UserCheck className={`w-5 h-5 ${activePortal === 'TEAM' ? 'text-purple-300' : 'text-purple-200/50'}`} />
                      <span className="text-xs font-bold block">OC Work Desk</span>
                      <span className="text-[9px] text-purple-200/50 hidden sm:block">Tasks &amp; Check-In</span>
                    </button>

                    {/* Faculty Admin Tab */}
                    <button
                      type="button"
                      onClick={() => handlePortalSwitch('ADMIN')}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        activePortal === 'ADMIN'
                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/30'
                          : 'bg-white/[0.04] border-white/10 text-purple-200/60 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Shield className={`w-5 h-5 ${activePortal === 'ADMIN' ? 'text-purple-300' : 'text-purple-200/50'}`} />
                      <span className="text-xs font-bold block">Faculty Console</span>
                      <span className="text-[9px] text-purple-200/50 hidden sm:block">Dean &amp; Admin Desk</span>
                    </button>
                  </div>
                </div>

                {/* Sign In Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Institutional Email / Handle</span>
                      <span className="text-[10px] text-purple-300/70 font-normal">
                        {activePortal === 'ADMIN' && 'Requires authorized @upes.ac.in'}
                        {activePortal === 'TEAM' && 'Requires firstname.sapid.oc@stu.upes.ac.in'}
                        {activePortal === 'USER' && 'Requires @stu.upes.ac.in'}
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="srijita.13103@stu.upes.ac.in"
                        className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400 focus:bg-white/[0.12] transition-all"
                      />
                      <Mail className="w-4 h-4 text-purple-300 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-white">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-purple-300 hover:text-purple-200 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400 focus:bg-white/[0.12] transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-purple-300 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Verifying Institutional Credentials...</span>
                    ) : (
                      <>
                        <span>Access {activePortal === 'ADMIN' ? 'Faculty Console' : activePortal === 'TEAM' ? 'OC Work Desk' : 'Student Discovery Portal'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ------------------------------------------------------- */}
            {/* MODE 2: NEW STUDENT REGISTRATION                        */}
            {/* ------------------------------------------------------- */}
            {mode === 'SIGN_UP' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white block">Full Legal Student Name</label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Srijita Debnath"
                    className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Institutional Email</span>
                    <span className="text-[10px] text-purple-300/80">firstname.sapid@stu.upes.ac.in</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="srijita.13103@stu.upes.ac.in"
                    className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">Department / School</label>
                    <input
                      type="text"
                      required
                      value={signUpDepartment}
                      onChange={(e) => setSignUpDepartment(e.target.value)}
                      placeholder="School of Computer Science"
                      className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">Create Password</label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white block">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-purple-200/30 outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {signUpLoading ? (
                    <span>Registering to Neon PostgreSQL Cloud...</span>
                  ) : (
                    <>
                      <span>Create Institutional Student Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <Modal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          title="Account Password Recovery"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your college email or OC handle. For security, your single-use reset link will be dispatched 
              <strong> strictly to your official enrolled student mailbox (@stu.upes.ac.in)</strong>.
            </p>

            {forgotSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <Alert type="error" message={forgotError} onClose={() => setForgotError(null)} />
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Registered Email / OC Handle</label>
                  <Input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. srijita.13103@stu.upes.ac.in"
                    icon={<KeyRound className="w-4 h-4 text-purple-600" />}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Dispatching...' : 'Dispatch Reset Link'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={() => setShowForgotModal(false)}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
