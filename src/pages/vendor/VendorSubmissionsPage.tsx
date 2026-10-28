import React, { useEffect, useState } from 'react';
import { Upload, Mic, Image as ImageIcon, CheckCircle2, FileText, Camera } from 'lucide-react';
import { SubmissionType, Task } from '../../types';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Button, Input, Select, Alert } from '../../components/ui';

// Quick proof photo presets for campus operations
const PROOF_PHOTO_PRESETS = [
  { label: '🔊 Sound & Audio Rigging', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600' },
  { label: '🎪 Main Stage Setup', url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=600' },
  { label: '🪪 Registration Desk Ready', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600' },
  { label: '💡 Lighting & LED Backdrop', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600' },
];

export const VendorSubmissionsPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [type, setType] = useState<SubmissionType>('image');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PROOF_PHOTO_PRESETS[0].url);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState('OC Volunteer');

  useEffect(() => {
    const init = async () => {
      const [allTasks, user] = await Promise.all([
        taskService.getTasks(),
        authService.getCurrentUser(),
      ]);
      setTasks(allTasks);
      if (allTasks.length > 0) {
        setSelectedTaskId(allTasks[0].id);
      }
      if (user) {
        setCurrentUserName(user.name);
      }
    };
    init();
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submissionService.createSubmission({
      taskId: selectedTaskId || 'tsk-101',
      taskName: selectedTask ? selectedTask.name : 'General Operations Task',
      eventId: selectedTask ? selectedTask.eventId : 'evt-101',
      eventName: selectedTask ? selectedTask.eventName : 'TechFest UPES 2026',
      submittedById: 'user-team-oc',
      submittedByName: currentUserName,
      submittedByRole: 'team',
      description,
      type,
      imageUrl: type === 'image' ? imageUrl : undefined,
      voiceUrl: type === 'voice' ? 'https://example.com/audio/voice_sample.mp3' : undefined,
      voiceDurationSeconds: 30,
    });

    setSuccessMsg('Work update with proof submitted successfully to Dean & Faculty Admin!');
    setDescription('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <PageContainer
      title="Submit Work Update & Proof"
      subtitle="Report task progress with text notes, photo evidence, or voice updates to Faculty Admins."
    >
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <Card className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Camera className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Task Completion Proof</h3>
            <p className="text-xs text-slate-400">Submitting as: <strong className="text-purple-700">{currentUserName}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Pick Assigned Task */}
          <Select
            label="Select Assigned Task"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            options={tasks.map(t => ({
              value: t.id,
              label: `${t.name} (${t.eventName})`
            }))}
          />

          {/* 2. Choose Submission Type */}
          <Select
            label="Submission Type"
            value={type}
            onChange={(e) => setType(e.target.value as SubmissionType)}
            options={[
              { value: 'image', label: '📸 Photo Proof + Text Notes' },
              { value: 'text', label: '📝 Text Note Only' },
              { value: 'voice', label: '🎙️ Voice Note Recording' },
            ]}
          />

          {/* 3. Text Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Work Notes & Status Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Completed speaker check, mic levels balanced, banner fastened to main truss..."
              className="w-full bg-white border border-slate-200 text-xs sm:text-sm rounded-xl p-3 outline-none focus:border-purple-500"
            />
          </div>

          {/* 4. Photo Evidence Section */}
          {type === 'image' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">Photo Proof Evidence</label>
              
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5">
                {PROOF_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      imageUrl === p.url
                        ? 'bg-purple-50 border-purple-400 text-purple-700 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Or paste direct image URL (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />

              {/* Image Preview */}
              {imageUrl && (
                <div className="h-36 w-full rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                  <img src={imageUrl} alt="Proof Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">Photo Proof Preview</span>
                </div>
              )}
            </div>
          )}

          {/* Voice Note Simulation */}
          {type === 'voice' && (
            <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl text-center">
              <Mic className="w-6 h-6 text-purple-600 mx-auto mb-1 animate-pulse" />
              <span className="text-xs font-semibold text-purple-900 block">Tap to Record Voice Update</span>
              <span className="text-[10px] text-purple-600">Microphone audio stream active</span>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit Work Proof to Faculty Admin
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};