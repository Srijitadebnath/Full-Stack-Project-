import React, { useEffect, useState, useRef } from 'react';
import { Upload, Mic, Image as ImageIcon, CheckCircle2, FileText, Camera, X, Loader2 } from 'lucide-react';
import { SubmissionType, Task } from '../../types';
import { submissionService } from '../../services/submissionService';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  PillButton,
  Chip,
  Card,
  Button,
  Input,
  Select,
  Alert,
} from '../../components/ui';
import { fileToCompressedBase64, formatFileSize } from '../../utils/imageUtils';

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

  // Device file upload state
  const [proofTab, setProofTab] = useState<'device' | 'presets' | 'url'>('device');
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProofFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }
    try {
      setIsCompressing(true);
      const base64 = await fileToCompressedBase64(file);
      setImageUrl(base64);
      setSelectedFileName(file.name);
      setSelectedFileSize(formatFileSize(file.size));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to process proof photo');
    } finally {
      setIsCompressing(false);
    }
  };

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

      <GlassCard className="max-w-xl mx-auto space-y-4 p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-purple-500/10 pb-4">
          <div className="w-10 h-10 rounded-2xl neo-raised flex items-center justify-center text-purple-600 border border-white/60">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1B2E]">Task Completion Proof</h3>
            <p className="text-xs text-[#8B87A3]">Submitting as: <strong className="text-purple-700">{currentUserName}</strong></p>
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">Photo Proof Evidence</label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setProofTab('device')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      proofTab === 'device' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📸 From Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofTab('presets')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      proofTab === 'presets' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ✨ Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofTab('url')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      proofTab === 'url' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔗 URL
                  </button>
                </div>
              </div>

              {/* Tab 1: Device File Upload */}
              {proofTab === 'device' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProofFileSelect(file);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleProofFileSelect(file);
                    }}
                    className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-purple-600 bg-purple-50/70 scale-[1.01]'
                        : 'border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/50'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="py-2 flex flex-col items-center gap-1.5 text-purple-700 text-xs font-semibold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Optimizing proof photo...</span>
                      </div>
                    ) : (
                      <div className="py-1">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                          <Camera className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Click to attach photo proof from device <span className="text-purple-600 font-bold">or drag and drop</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Take a photo of stage setup, soundcheck, or venue gate (PNG, JPG, WEBP)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Presets */}
              {proofTab === 'presets' && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {PROOF_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setImageUrl(p.url);
                          setSelectedFileName(p.label);
                          setSelectedFileSize(null);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          imageUrl === p.url
                            ? 'bg-purple-50 border-purple-400 text-purple-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Direct URL */}
              {proofTab === 'url' && (
                <Input
                  placeholder="Or paste direct image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setSelectedFileName(null);
                    setSelectedFileSize(null);
                  }}
                />
              )}

              {/* Image Preview & Details Card */}
              {imageUrl && (
                <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-purple-200/80 shadow-xs bg-slate-900 group">
                  <img src={imageUrl} alt="Proof Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
                    <div className="text-white text-xs space-y-0.5">
                      <span className="font-semibold block truncate max-w-[260px] text-[11px]">
                        {selectedFileName ? `📸 ${selectedFileName}` : '🖼️ Work Proof Photo Attached'}
                      </span>
                      {selectedFileSize && (
                        <span className="text-[10px] text-purple-200 block">
                          Size: {selectedFileSize} • Verified
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setSelectedFileName(null);
                        setSelectedFileSize(null);
                      }}
                      title="Remove image"
                      className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
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

          <PillButton type="submit" variant="primary" className="w-full py-3">
            Submit Work Proof to Faculty Admin
          </PillButton>
        </form>
      </GlassCard>
    </PageContainer>
  );
};