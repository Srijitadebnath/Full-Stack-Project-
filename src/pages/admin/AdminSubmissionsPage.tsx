import React, { useEffect, useState } from 'react';
import { FileCheck, Mic, Image as ImageIcon, CheckCircle, RefreshCw, Play } from 'lucide-react';
import { Submission } from '../../types';
import { submissionService } from '../../services/submissionService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Alert } from '../../components/ui';

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

      <div className="space-y-4">
        {submissions.map((sub) => (
          <Card key={sub.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900">{sub.taskName}</h4>
                  <Badge variant={sub.type === 'voice' ? 'purple' : sub.type === 'image' ? 'blue' : 'slate'}>
                    {sub.type} update
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submitted by <strong className="text-slate-800">{sub.submittedByName}</strong> • {sub.submissionTime}
                </p>
              </div>

              <Badge variant={sub.status === 'Approved' ? 'emerald' : sub.status === 'Needs Revision' ? 'rose' : 'amber'}>
                {sub.status}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl">
              {sub.description}
            </p>

            {/* Media Content Preview */}
            {sub.type === 'image' && sub.imageUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Photo Proof Preview</span>
                <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200">
                  <img src={sub.imageUrl} alt="Proof" className="w-full h-48 object-cover" />
                </div>
              </div>
            )}

            {sub.type === 'voice' && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Voice Update Audio Player</span>
                <div className="flex items-center gap-3 p-3 bg-purple-50/70 border border-purple-100 rounded-xl max-w-md">
                  <button
                    onClick={() => alert('Playing voice update sample audio...')}
                    className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </button>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-purple-900 block">Voice Note ({sub.voiceDurationSeconds || 30}s)</span>
                    <div className="w-full bg-purple-200/60 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-purple-600 h-full w-1/3 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRevision(sub.id)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Request Revision
              </Button>
              <Button
                size="sm"
                onClick={() => handleApprove(sub.id)}
                icon={<CheckCircle className="w-3.5 h-3.5" />}
              >
                Approve Work
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
