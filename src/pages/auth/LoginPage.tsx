import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Shield, UserCheck, User as UserIcon } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button, Card, Input, Alert } from '../../components/ui';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<'admin' | 'oc_team'>('oc_team');
  const [email, setEmail] = useState('priya.oc@college.edu');
  const [password, setPassword] = useState('••••••••');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleModeSwitch = (mode: 'admin' | 'oc_team') => {
    setLoginMode(mode);
    setErrorMessage(null);
    if (mode === 'admin') setEmail('admin@college.edu');
    else setEmail('priya.oc@college.edu');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { redirectPath } = await authService.loginWithEmail(email);
      onLoginSuccess();
      navigate(redirectPath);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAccess = async () => {
    const { redirectPath } = await authService.loginWithEmail('student@college.edu');
    onLoginSuccess();
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Event Operations System</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Sign In</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Sign in with your registered college email address
          </p>
        </div>

        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}

        {/* Login Mode Toggle Tabs: OC Team Login vs Admin Login */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleModeSwitch('oc_team')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'oc_team'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>OC Team Member</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('admin')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginMode === 'admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Faculty Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <Card className="space-y-4 p-6 border border-slate-100 shadow-sm">
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 space-y-0.5">
            <span className="font-bold block">
              {loginMode === 'oc_team' ? 'Organizing Committee (OC) Login' : 'Faculty Admin Portal Login'}
            </span>
            <p className="text-[11px] text-purple-700">
              {loginMode === 'oc_team'
                ? 'Sign in with your registered student OC email address (e.g. priya.oc@college.edu or aarav.oc@college.edu).'
                : 'Sign in with faculty administrator credentials (admin@college.edu).'}
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              label={loginMode === 'oc_team' ? 'Registered OC Student Email' : 'Faculty Admin Email'}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginMode === 'oc_team' ? 'e.g. priya.oc@college.edu' : 'admin@college.edu'}
              icon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password / Access Code"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <Button type="submit" className="w-full" isLoading={loading} size="lg">
              <span>{loginMode === 'oc_team' ? 'Sign In as OC Member' : 'Sign In as Admin'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={handleStudentAccess}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer inline-flex items-center gap-1"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Enter Student Event Discovery Portal →</span>
            </button>
          </div>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          Smart Campus Event Operations System
        </p>
      </div>
    </div>
  );
};
