import React, { useState } from 'react';
import { Upload, Mic, Image, CheckCircle2 } from 'lucide-react';
import { SubmissionType } from '../../types';
import { submissionService } from '../../services/submissionService';
import { PageContainer } from '../../components/layout';
import { Card, Button, Input, Select, Alert } from '../../components/ui';

export const VendorSubmissionsPage: React.FC = () => {
  const [type, setType] = useState<SubmissionType>('image');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submissionService.createSubmission({
      taskId: 'tsk-401',
      taskName: 'Main Stage JBL Sound & LED Rigging',
      eventId: 'evt-101',
      eventName: 'TechFest UPES 2026',
      submittedById: 'user-team-2',
      submittedByName: 'Aarav Verma (Sound OC Lead)',
      submittedByRole: 'team',
      description,
      type,
      imageUrl: type === 'image' ? 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600' : undefined,
      voiceUrl: type === 'voice' ? 'https://example.com/audio/voice_sample.mp3' : undefined,
      voiceDurationSeconds: 35,
    });

    setSuccessMsg('Work update submitted successfully to Admin operations team!');
    setDescription('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <PageContainer
      title="Submit Work Update"
      subtitle="Provide progress reports using text notes, photos, or voice update recordings."
    >
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <Card className="max-w-xl mx-auto space-y-4">
        <h3 className="text-base font-semibold text-slate-900">New Work Submission</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Submission Type"
            value={type}
            onChange={(e) => setType(e.target.value as SubmissionType)}
            options={[
              { value: 'image', label: 'Photo Upload Preview' },
              { value: 'voice', label: 'Voice Update Note' },
              { value: 'text', label: 'Text Note Only' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Update Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe work completed, stage setup status, or any issues..."
              className="w-full bg-white border border-slate-200 text-xs sm:text-sm rounded-xl p-3 outline-none focus:border-purple-500"
            />
          </div>

          {type === 'image' && (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:bg-purple-50/40">
              <Image className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <span className="text-xs font-medium text-slate-700 block">Click to upload photo proof</span>
              <span className="text-[10px] text-slate-400">JPG, PNG up to 10MB</span>
            </div>
          )}

          {type === 'voice' && (
            <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
              <Mic className="w-6 h-6 text-purple-600 mx-auto mb-1 animate-pulse" />
              <span className="text-xs font-semibold text-purple-900 block">Tap to Record Voice Update</span>
              <span className="text-[10px] text-purple-600">Microphone input active</span>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit Update
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};
