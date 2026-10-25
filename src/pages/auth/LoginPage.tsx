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
  User,
  Phone,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { Button, Card, Input, Alert, Modal } from '../../components/ui';

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
  const [email, setEmail] = useState('rohan.mehta@stu.upes.ac.in');
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
      setEmail('rohan.oc@upes.ac.in');
      setPassword('RohanNewPassword@999');
    } else {
      setEmail('rohan.mehta@stu.upes.ac.in');
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
        setErrorMessage('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Sign-Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic frontend checks
    if (!signUpEmail.toLowerCase().endsWith('@stu.upes.ac.in')) {
      setErrorMessage('Institutional Requirement: Student sign-ups must use official @stu.upes.ac.in email.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setSignUpLoading(true);

    try {
      const { redirectPath } = await authService.registerStudent({
        name: signUpName.trim(),
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        phone: signUpPhone.trim(),
        department: signUpDepartment,
        college: signUpCollege,
      });

      setSuccessMessage('Student account created successfully in Cloud Database! Redirecting...');
      onLoginSuccess();
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create student account.');
      }
    } finally {
      setSignUpLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setForgotLoading(true);

    try {
      const result = await authService.requestPasswordReset(forgotEmail.trim());
      setForgotSuccess(result.message);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setForgotError(err.message);
      } else {
        setForgotError('Failed to process recovery request.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f7fc] via-[#f1f0fa] to-[#ede9fe] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg space-y-6">
        
        {/* Institutional Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>UPES Dehradun • Campus Operations Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Institutional Portal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Event Management, Organizing Committee Operations & Student Discovery
          </p>
        </div>

        {/* Global Feedback Banners */}
        {errorMessage && (
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode Selector Toggle: Sign In vs. Student Sign Up */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/90 backdrop-blur-sm rounded-2xl text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('SIGN_IN');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'SIGN_IN'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Institutional Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('SIGN_UP');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'SIGN_UP'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            New Student Sign Up
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* MODE A: INSTITUTIONAL SIGN IN                        */}
        {/* ---------------------------------------------------- */}
        {mode === 'SIGN_IN' && (
          <div className="space-y-4">
            {/* 3-Way Portal Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => handlePortalSwitch('USER')}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'USER'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('TEAM')}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'TEAM'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>OC Member</span>
              </button>

              <button
                type="button"
                onClick={() => handlePortalSwitch('ADMIN')}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePortal === 'ADMIN'
                    ? 'bg-white text-purple-700 shadow-sm ring-1 ring-purple-200'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Faculty Admin</span>
              </button>
            </div>

            {/* Main Sign In Form Card */}
            <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-md border border-purple-100 shadow-xl rounded-3xl space-y-5">
              {/* Role explanation header */}
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl text-xs space-y-0.5">
                <span className="font-bold text-purple-900 block">
                  {activePortal === 'ADMIN' && '🛡️ Faculty / Dean Administration Portal'}
                  {activePortal === 'TEAM' && '⚡ Organizing Committee (OC) Work Desk'}
                  {activePortal === 'USER' && '🎓 Enrolled Student Fest Portal'}
                </span>
                <p className="text-[11px] text-purple-700">
                  {activePortal === 'ADMIN' && 'Strictly requires authorized @upes.ac.in faculty administrative credentials.'}
                  {activePortal === 'TEAM' && 'Requires your activated official handle (e.g. name.oc@upes.ac.in).'}
                  {activePortal === 'USER' && 'Sign in using your student email (@stu.upes.ac.in).'}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {activePortal === 'ADMIN' && 'Faculty Email Address'}
                    {activePortal === 'TEAM' && 'Official OC Handle'}
                    {activePortal === 'USER' && 'Student College Email'}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      activePortal === 'ADMIN'
                        ? 'name.admin@upes.ac.in'
                        : activePortal === 'TEAM'
                        ? 'name.oc@upes.ac.in'
                        : 'sapid@stu.upes.ac.in'
                    }
                    icon={<Mail className="w-4 h-4 text-purple-500" />}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotSuccess(null);
                        setForgotError(null);
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      icon={<Lock className="w-4 h-4 text-purple-500" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Authenticating with Database...</span>
                  ) : (
                    <>
                      <span>
                        Sign In as {activePortal === 'ADMIN' ? 'Admin' : activePortal === 'TEAM' ? 'OC Member' : 'Student'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Direct Link to Browse Events as Guest */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/user/home')}
                  className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
                >
                  ← Browse Campus Events Catalog Without Sign In
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* MODE B: NEW STUDENT REGISTRATION / SIGN UP           */}
        {/* ---------------------------------------------------- */}
        {mode === 'SIGN_UP' && (
          <Card className="p-6 sm:p-8 bg-white/95 backdrop-blur-md border border-purple-100 shadow-xl rounded-3xl space-y-5">
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>UPES Student Enrollment</span>
              </span>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                Enter your institutional details below. This will register you directly into the PostgreSQL database 
                so you can immediately register for fests and apply for the Organizing Committee!
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <Input
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Srijita Debnath"
                  icon={<User className="w-4 h-4 text-purple-500" />}
                  required
                />
              </div>

              {/* College Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Institutional Student Email (@stu.upes.ac.in)
                </label>
                <Input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="srijita.13103@stu.upes.ac.in"
                  icon={<Mail className="w-4 h-4 text-purple-500" />}
                  required
                />
              </div>

              {/* Phone and Department 2-column on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                  <Input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    icon={<Phone className="w-4 h-4 text-purple-500" />}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">School / Department</label>
                  <Input
                    type="text"
                    value={signUpDepartment}
                    onChange={(e) => setSignUpDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    icon={<Building className="w-4 h-4 text-purple-500" />}
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Create Password</label>
                  <Input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    icon={<Lock className="w-4 h-4 text-purple-500" />}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                  <Input
                    type="password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    icon={<Lock className="w-4 h-4 text-purple-500" />}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={signUpLoading}
                className="w-full py-2.5 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {signUpLoading ? (
                  <span>Registering to PostgreSQL Cloud...</span>
                ) : (
                  <>
                    <span>Create Student Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Institutional Footer */}
        <p className="text-center text-[11px] text-slate-400">
          Smart College Event Operations System • Built for UPES Dehradun
        </p>
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
                    placeholder="e.g. rohan.oc@upes.ac.in or sapid@stu.upes.ac.in"
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
