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
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Building2,
  Phone,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { Button, Input, Alert, Modal } from '../../components/ui';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

type PortalRole = 'USER' | 'TEAM' | 'ADMIN';
type StudentMode = 'SIGN_IN' | 'SIGN_UP';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  // Stage 1: Role Chooser vs Stage 2: Role Auth Form
  const [selectedRole, setSelectedRole] = useState<PortalRole | null>(null);

  // Student Sub-mode (Sign In vs Register)
  const [studentMode, setStudentMode] = useState<StudentMode>('SIGN_IN');

  // Sign In Form State (No hardcoded credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Student Sign Up Form State
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

  // Handle Role Selection (Google Chrome Profile Chooser Style)
  const handleSelectRole = (role: PortalRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { redirectPath } = await authService.loginWithCredentials(
        email.trim(),
        password,
        selectedRole
      );
      onLoginSuccess();
      navigate(redirectPath);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify your institutional credentials.');
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

    if (signUpPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
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

      setSuccessMessage('Student account created successfully! Switching to sign in...');
      setTimeout(() => {
        setStudentMode('SIGN_IN');
        setEmail(signUpEmail.trim().toLowerCase());
        setPassword(signUpPassword);
        setSuccessMessage(null);
      }, 1200);
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden font-sans select-none">
      {/* Background Blobs (Design Tokens: Purple, Orange, Pink, 80px blur, fixed behind everything) */}
      <div className="fixed top-[-5%] left-[-5%] w-[550px] h-[550px] bg-[#7C3AED]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed top-[25%] right-[-5%] w-[600px] h-[600px] bg-[#FB923C]/25 rounded-full blur-[80px] pointer-events-none -z-20" />
      <div className="fixed bottom-[-5%] left-[20%] w-[550px] h-[550px] bg-[#F472B6]/20 rounded-full blur-[80px] pointer-events-none -z-20" />

      {/* ========================================================= */}
      {/* STAGE 1: ROLE PERSONA CHOOSER (Google Chrome Profile Style) */}
      {/* ========================================================= */}
      {!selectedRole && (
        <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/80 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.08)]">
            {/* Header with Official Eventra Logo */}
            <div className="text-center space-y-2 mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center mb-1">
                <img
                  src="/eventra-logo.png"
                  alt="EVENTRA Logo"
                  className="h-20 w-auto object-contain drop-shadow-xs"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome to EVENTRA
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Choose your role to access your institutional campus portal
              </p>
            </div>

            {/* 3 Role Persona Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Card 1: Student */}
              <button
                type="button"
                onClick={() => handleSelectRole('USER')}
                className="group p-6 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 hover:border-purple-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_-5px_rgba(124,58,237,0.12)] transition-all duration-200 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 group-hover:bg-purple-100/80 text-purple-600 flex items-center justify-center mb-4 transition-colors shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
                    Student Portal
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-950 transition-colors">
                    Student
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Browse campus fests, register for passes &amp; download digital QR badges.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 2: Organizing Committee */}
              <button
                type="button"
                onClick={() => handleSelectRole('TEAM')}
                className="group p-6 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 hover:border-indigo-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_-5px_rgba(99,102,241,0.12)] transition-all duration-200 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-4 transition-colors shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                    Operations Desk
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                    OC Team
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Manage departmental tasks, upload work proof &amp; verify attendee QR passes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
                  <span>Access Work Desk</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Card 3: Faculty Admin */}
              <button
                type="button"
                onClick={() => handleSelectRole('ADMIN')}
                className="group p-6 rounded-2xl bg-white/70 hover:bg-white/95 border border-white/90 hover:border-violet-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_-5px_rgba(139,92,246,0.12)] transition-all duration-200 text-left flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 group-hover:bg-violet-100/80 text-violet-600 flex items-center justify-center mb-4 transition-colors shadow-xs">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block mb-1">
                    Administration
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-950 transition-colors">
                    Faculty Admin
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Publish events, audit budgets, delegate tasks &amp; approve OC volunteer teams.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-700">
                  <span>Enter Console</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Institutional Attribution Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>University of Petroleum and Energy Studies • UPES Dehradun</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STAGE 2: CLEAN AUTHENTICATION FORM FOR SELECTED ROLE      */}
      {/* ========================================================= */}
      {selectedRole && (
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.1)]">
            
            {/* Top Switch Role Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60">
              <button
                type="button"
                onClick={handleBackToRoleSelect}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch Role</span>
              </button>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 uppercase tracking-wider">
                {selectedRole === 'USER' ? '🎓 Student' : selectedRole === 'TEAM' ? '📋 OC Team' : '🛡️ Faculty Admin'}
              </span>
            </div>

            {/* Portal Title */}
            <div className="mb-5 flex items-start justify-between gap-3 text-left">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedRole === 'USER'
                    ? studentMode === 'SIGN_IN'
                      ? 'Student Sign In'
                      : 'Student Registration'
                    : selectedRole === 'TEAM'
                    ? 'OC Team Sign In'
                    : 'Faculty Administration Sign In'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedRole === 'USER'
                    ? 'Access your student passes and campus events.'
                    : selectedRole === 'TEAM'
                    ? 'Enter your official .oc@upes.ac.in credentials.'
                    : 'Enter your institutional @upes.ac.in credentials.'}
                </p>
              </div>
              <img
                src="/eventra-icon.png"
                alt="EVENTRA Icon"
                className="h-9 w-auto object-contain shrink-0 mt-0.5"
              />
            </div>

            {/* Student Mode Sub-Tabs (Sign In vs New Registration) */}
            {selectedRole === 'USER' && (
              <div className="flex p-1 bg-slate-200/50 rounded-xl mb-5 border border-white/60">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('SIGN_IN');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    studentMode === 'SIGN_IN'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('SIGN_UP');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    studentMode === 'SIGN_UP'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  New Registration
                </button>
              </div>
            )}

            {/* Alerts */}
            {errorMessage && (
              <div className="mb-4">
                <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
              </div>
            )}
            {successMessage && (
              <div className="mb-4">
                <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
              </div>
            )}

            {/* ========================================= */}
            {/* 1. SIGN IN FORM (Student / OC / Faculty)  */}
            {/* ========================================= */}
            {(selectedRole !== 'USER' || studentMode === 'SIGN_IN') && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email / Handle Input */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700">
                    {selectedRole === 'TEAM' ? 'Institutional OC Handle' : 'Institutional Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'USER'
                          ? 'e.g. yourname.sapid@stu.upes.ac.in'
                          : selectedRole === 'TEAM'
                          ? 'e.g. yourname.oc@upes.ac.in'
                          : 'e.g. faculty.name@upes.ac.in'
                      }
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your secure password"
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !email.trim() || !password}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="text-white font-bold">Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {selectedRole === 'USER'
                            ? 'Sign In to Student Portal'
                            : selectedRole === 'TEAM'
                            ? 'Access OC Work Desk'
                            : 'Access Faculty Console'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================= */}
            {/* 2. STUDENT NEW REGISTRATION FORM          */}
            {/* ========================================= */}
            {selectedRole === 'USER' && studentMode === 'SIGN_UP' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3 text-left">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Student Email Address</label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="e.g. rohan.50001234@stu.upes.ac.in"
                    className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                  />
                </div>

                {/* Phone & Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Department</label>
                    <input
                      type="text"
                      required
                      value={signUpDepartment}
                      onChange={(e) => setSignUpDepartment(e.target.value)}
                      placeholder="e.g. School of Computer Science"
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-white/90 border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Lower Action Bar for Sign Up */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={signUpLoading || !signUpName || !signUpEmail || !signUpPassword}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  >
                    {signUpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="text-white font-bold">Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Student Account</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORGOT PASSWORD MODAL                                     */}
      {/* ========================================================= */}
      {showForgotModal && (
        <Modal
          isOpen={showForgotModal}
          onClose={() => {
            setShowForgotModal(false);
            setForgotError(null);
            setForgotSuccess(null);
          }}
          title="Account Recovery"
        >
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your registered institutional email address. We will verify your campus account and issue a single-use password reset link.
            </p>

            {forgotError && <Alert type="error" message={forgotError} />}
            {forgotSuccess && <Alert type="success" message={forgotSuccess} />}

            <Input
              label="Registered Email"
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. yourname.sapid@stu.upes.ac.in"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForgotModal(false)}
              >
                Close
              </Button>
              <Button type="submit" size="sm" isLoading={forgotLoading}>
                Dispatch Recovery Link
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
