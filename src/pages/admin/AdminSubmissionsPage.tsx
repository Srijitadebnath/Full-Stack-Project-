import React, { useEffect, useState } from 'react';
import { FileCheck, Mic, Image as ImageIcon, CheckCircle, RefreshCw, Play } from 'lucide-react';
import { Submission } from '../../types';
import { submissionService } from '../../services/submissionService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  PillButton,
  Chip,
  Card,
  Badge,
  Button,
  Alert,
} from '../../components/ui';

export const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSubmissions = async () => {
    const list = await submissionService.getSubmissions();
    setSubmissions(list);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleApprove = async (id: string) => {
    await submissionService.updateSubmissionStatus(id, 'Approved');
    setSuccessMsg('Work submission approved successfully!');
    loadSubmissions();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleRevision = async (id: string) => {
    await submissionService.updateSubmissionStatus(id, 'Needs Revision', 'Please check cables connection again.');
    setSuccessMsg('Revision requested from vendor.');
    loadSubmissions();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <PageContainer
      title="Vendor Work Submissions"
      subtitle="Review text, photo uploads, and voice updates submitted by vendors and OC members."
    >
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <div className="space-y-5">
        {submissions.map((sub) => (
          <GlassCard key={sub.id} lift className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/10 pb-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base font-bold text-[#1E1B2E]">{sub.taskName}</h4>
                  <Chip variant={sub.type === 'voice' ? 'purple' : sub.type === 'image' ? 'info' : 'neutral'}>
                    {sub.type} update
                  </Chip>
                </div>
                <p className="text-xs text-[#8B87A3] mt-0.5">
                  Submitted by <strong className="text-[#1E1B2E]">{sub.submittedByName}</strong> • {sub.submissionTime}
                </p>
              </div>

              <Chip variant={sub.status === 'Approved' ? 'success' : sub.status === 'Needs Revision' ? 'danger' : 'warning'}>
                {sub.status}
              </Chip>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#4B4763] leading-relaxed neo-inset p-3.5 rounded-2xl">
              {sub.description}
            </p>

            {/* Media Content Preview */}
            {sub.type === 'image' && sub.imageUrl && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#8B87A3] uppercase tracking-wider block">Photo Proof Preview</span>
                <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/80 shadow-xs">
                  <img src={sub.imageUrl} alt="Proof" className="w-full h-48 object-cover" />
                </div>
              </div>
            )}

            {sub.type === 'voice' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#8B87A3] uppercase tracking-wider block">Voice Update Audio Player</span>
                <div className="flex items-center gap-3 p-3.5 neo-inset rounded-2xl max-w-md">
                  <button
                    type="button"
                    onClick={() => alert('Playing voice update sample audio...')}
                    className="w-10 h-10 rounded-full btn-primary flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4 ml-0.5 text-white" />
                  </button>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-purple-950 block">Voice Note ({sub.voiceDurationSeconds || 30}s)</span>
                    <div className="w-full bg-slate-200/60 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-purple-600 h-full w-1/3 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-500/10">
              <PillButton
                variant="glass"
                size="sm"
                onClick={() => handleRevision(sub.id)}
                icon={<RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
              >
                Request Revision
              </PillButton>
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => handleApprove(sub.id)}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Approve Work
              </PillButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageContainer>
  );
};
