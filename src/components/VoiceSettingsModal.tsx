import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Check,
  Play,
  Pause,
  Mic,
  Square,
  Volume2,
  User,
  Heart,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { VoiceSettings, UserVoiceProfile } from '../types/book';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices,
}) => {
  const [activeTab, setActiveTab] = useState<'voices' | 'recording'>('voices');
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // Recording Studio States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [profileName, setProfileName] = useState('Giọng Của Tôi');
  const [narratorRole, setNarratorRole] = useState<'mom' | 'dad' | 'grandma' | 'storyteller' | 'user'>('user');
  const [recordingWarmth, setRecordingWarmth] = useState(85);
  const [recordingPitch, setRecordingPitch] = useState(1.05);
  const [recordingRate, setRecordingRate] = useState(0.92);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on close or unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Filter Vietnamese and English voices
  const vietnameseVoices = availableVoices.filter(
    (v) => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('vietnam')
  );
  const otherVoices = availableVoices.filter(
    (v) => !v.lang.toLowerCase().includes('vi') && !v.name.toLowerCase().includes('vietnam')
  );

  const sampleReadingScript =
    'Ngày xửa ngày xưa, ở một ngôi làng nhỏ thật yên bình, có hai mẹ con sống trong căn nhà ngập tràn hoa thơm quả ngọt. Mỗi sớm mai thức dậy, chú chim nhỏ cất tiếng líu lo chào đón một ngày mới thật tuyệt vời!';

  // Test Speech Synthesis
  const handleTestVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsPlayingTest(true);

    const testText =
      settings.engine === 'gemini'
        ? 'Xin chào bạn! Đây là giọng đọc AI Gemini với âm sắc truyền cảm, ấm áp như người dẫn chuyện audio.'
        : settings.engine === 'user_voice'
        ? 'Chào con yêu! Đây là giọng đọc ấm áp của ba mẹ đã được thiết lập để đọc sách cho con nghe.'
        : 'Chào con! Mặt trời đã lên cao rồi, chúng mình cùng bước vào trang sách kỳ diệu nhé? Thật tuyệt vời!';

    const utterance = new SpeechSynthesisUtterance(testText);

    if (settings.selectedVoiceURI) {
      const match = availableVoices.find((v) => v.voiceURI === settings.selectedVoiceURI);
      if (match) utterance.voice = match;
    } else {
      const match =
        availableVoices.find((v) => v.lang.toLowerCase().includes('vi')) || availableVoices[0];
      if (match) utterance.voice = match;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'vi-VN';

    utterance.onend = () => setIsPlayingTest(false);
    utterance.onerror = () => setIsPlayingTest(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start recording user's voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or not supported:', err);
      alert('Không thể mở micro. Vui lòng cho phép quyền truy cập micro trong trình duyệt để ghi âm.');
    }
  };

  // Stop recording user's voice
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Toggle playback of recorded voice preview safely
  const togglePlayRecordedSample = () => {
    if (!recordedAudioUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio();
      audio.onended = () => setIsPlayingRecorded(false);
      audio.onerror = (e) => {
        if (typeof e !== 'string') e?.preventDefault?.();
        console.warn('Recorded sample audio source error');
        setIsPlayingRecorded(false);
      };
      audio.src = recordedAudioUrl;
      previewAudioRef.current = audio;
    }

    if (isPlayingRecorded) {
      previewAudioRef.current.pause();
      setIsPlayingRecorded(false);
    } else {
      const playPromise = previewAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingRecorded(true))
          .catch((err) => {
            console.warn('Preview play rejection:', err);
            setIsPlayingRecorded(false);
          });
      }
    }
  };

  // Save voice profile & apply to books
  const handleSaveAndApplyVoiceProfile = () => {
    const newProfile: UserVoiceProfile = {
      id: `voice-profile-${Date.now()}`,
      name: profileName.trim() || 'Giọng Đọc Của Tôi',
      narratorRole,
      audioBlobUrl: recordedAudioUrl || undefined,
      recordedDurationSec: recordingSeconds,
      recordedAt: Date.now(),
      pitch: recordingPitch,
      rate: recordingRate,
      warmth: recordingWarmth,
      sampleText: sampleReadingScript,
    };

    const existingProfiles = settings.userProfiles || [];
    const updatedProfiles = [newProfile, ...existingProfiles];

    onUpdateSettings({
      engine: 'user_voice',
      activeUserProfileId: newProfile.id,
      pitch: newProfile.pitch,
      rate: newProfile.rate,
      userProfiles: updatedProfiles,
    });

    setActiveTab('voices');
  };

  // Delete a voice profile
  const handleDeleteVoiceProfile = (profileId: string) => {
    const updated = (settings.userProfiles || []).filter((p) => p.id !== profileId);
    const newActiveId = updated[0]?.id;
    onUpdateSettings({
      userProfiles: updated,
      activeUserProfileId: newActiveId,
      engine: updated.length === 0 ? 'browser' : settings.engine,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-2xl w-full max-w-xl flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#282828] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                Cài Đặt & Phòng Thu Giọng Đọc
              </h3>
              <p className="text-xs text-neutral-400">
                Tùy chỉnh giọng đọc sách, ngữ điệu truyền cảm hoặc thu âm Giọng Người Dùng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#333333] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#282828] bg-[#141414] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('voices')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'voices'
                ? 'border-[#1ed760] text-[#1ed760]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Giọng Đọc & Ngữ Điệu</span>
          </button>

          <button
            onClick={() => setActiveTab('recording')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative ${
              activeTab === 'recording'
                ? 'border-[#1ed760] text-[#1ed760]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span>Phòng Thu Giọng Người Dùng</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-400 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
              Mới
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 text-xs sm:text-sm overflow-y-auto max-h-[70vh]">
          {activeTab === 'voices' ? (
            <>
              {/* Expressive Prosody Switch (Nhấn nhá truyền cảm xúc) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1ed760]/10 via-[#1e1e1e] to-[#252525] border border-[#1ed760]/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#1ed760]" />
                    <span className="font-extrabold text-sm text-white">
                      Nhấn Nhá & Truyền Cảm Xúc Tiếng Việt
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Tự động ngắt nghỉ lấy hơi tự nhiên theo dấu câu (?, !, ...), vút giọng khi hỏi,
                    phấn khởi khi gặp tình tiết vui tươi, ru êm ấm áp như người mẹ đọc truyện.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.expressiveMode}
                    onChange={(e) => onUpdateSettings({ expressiveMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1ed760]"></div>
                </label>
              </div>

              {/* Engine Selection: 3 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-neutral-400 tracking-wider">
                  Nguồn Phát Giọng Đọc
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Browser */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ engine: 'browser' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      settings.engine === 'browser'
                        ? 'border-[#1ed760] bg-[#1ed760]/10 text-white shadow'
                        : 'border-[#333333] bg-[#222222] text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">Trình Duyệt</span>
                      {settings.engine === 'browser' && <Check className="w-4 h-4 text-[#1ed760]" />}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Tự nhiên, tốc độ phản hồi tức thì, không cần mạng.
                    </span>
                  </button>

                  {/* Option 2: AI Gemini */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ engine: 'gemini' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      settings.engine === 'gemini'
                        ? 'border-[#1ed760] bg-[#1ed760]/10 text-white shadow'
                        : 'border-[#333333] bg-[#222222] text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
                        AI Gemini Studio
                      </span>
                      {settings.engine === 'gemini' && <Check className="w-4 h-4 text-[#1ed760]" />}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Giọng đọc phòng thu chuyên nghiệp, cảm xúc điện ảnh.
                    </span>
                  </button>

                  {/* Option 3: User Recorded Voice */}
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ engine: 'user_voice' })}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      settings.engine === 'user_voice'
                        ? 'border-[#1ed760] bg-[#1ed760]/10 text-white shadow'
                        : 'border-[#333333] bg-[#222222] text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        Giọng Người Dùng
                      </span>
                      {settings.engine === 'user_voice' && (
                        <Check className="w-4 h-4 text-[#1ed760]" />
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      Hồ sơ giọng ấm áp của chính bạn từ phòng thu.
                    </span>
                  </button>
                </div>
              </div>

              {/* Sub-settings for User Voice */}
              {settings.engine === 'user_voice' && (
                <div className="p-3.5 rounded-xl bg-[#222222] border border-[#333333] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-300 uppercase tracking-wider">
                      Chọn Hồ Sơ Giọng Người Dùng:
                    </span>
                    <button
                      onClick={() => setActiveTab('recording')}
                      className="text-xs text-[#1ed760] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Mic className="w-3 h-3" />
                      + Thu âm giọng mới
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(settings.userProfiles || []).map((profile) => {
                      const isSelected = settings.activeUserProfileId === profile.id;
                      return (
                        <div
                          key={profile.id}
                          onClick={() => {
                            onUpdateSettings({
                              activeUserProfileId: profile.id,
                              pitch: profile.pitch,
                              rate: profile.rate,
                            });
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#1ed760] bg-[#1ed760]/20 text-white'
                              : 'border-[#333] bg-[#1a1a1a] text-neutral-400 hover:border-neutral-500'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-xs truncate text-white">{profile.name}</p>
                              <p className="text-[10px] text-neutral-400">
                                Ấm áp: {profile.warmth}% • {profile.rate}x
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {isSelected && <Check className="w-4 h-4 text-[#1ed760]" />}
                            {(settings.userProfiles || []).length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVoiceProfile(profile.id);
                                }}
                                className="p-1 hover:text-rose-400 text-neutral-500 transition-colors"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-settings for Browser Voice */}
              {settings.engine === 'browser' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-neutral-400 tracking-wider">
                    Chọn Giọng Tiếng Việt Có Sẵn
                  </label>
                  <select
                    value={settings.selectedVoiceURI}
                    onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
                    className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white outline-none"
                  >
                    <option value="">Tự động chọn giọng tiếng Việt tối ưu nhất</option>
                    {vietnameseVoices.length > 0 && (
                      <optgroup label="Giọng Tiếng Việt Bản Địa">
                        {vietnameseVoices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Tất Cả Giọng Trong Máy">
                      {otherVoices.slice(0, 20).map((v) => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              {/* Sub-settings for Gemini AI */}
              {settings.engine === 'gemini' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-neutral-400 tracking-wider">
                    Nhân Vật Giọng Đọc AI (Gemini Studio)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'Kore', label: 'Kore (Nữ dịu dàng)' },
                        { id: 'Puck', label: 'Puck (Nam ấm áp)' },
                        { id: 'Fenrir', label: 'Fenrir (Trầm hùng)' },
                        { id: 'Zephyr', label: 'Zephyr (Trong trẻo)' },
                        { id: 'Charon', label: 'Charon (Điềm tĩnh)' },
                      ] as const
                    ).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onUpdateSettings({ geminiVoice: v.id })}
                        className={`py-2 px-2 rounded-lg border text-center font-bold text-xs transition-all ${
                          settings.geminiVoice === v.id
                            ? 'border-[#1ed760] bg-[#1ed760]/20 text-[#1ed760]'
                            : 'border-[#333333] bg-[#222222] text-neutral-400 hover:text-white'
                        }`}
                      >
                        {v.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pitch & Speed Sliders */}
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-neutral-400 uppercase">
                      Tốc Độ Đọc (Nhịp Kể Chuyện)
                    </span>
                    <span className="font-bold text-[#1ed760]">{settings.rate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.75"
                    step="0.05"
                    value={settings.rate}
                    onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Ru ngủ (0.8x)</span>
                    <span>Tự nhiên (1.0x)</span>
                    <span>Nhanh (1.5x)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-neutral-400 uppercase">
                      Cao Độ Giọng (Trầm / Trong)
                    </span>
                    <span className="font-bold text-[#1ed760]">{settings.pitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={settings.pitch}
                    onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>Trầm ấm (0.85x)</span>
                    <span>Chuẩn (1.0x)</span>
                    <span>Trong trẻo (1.2x)</span>
                  </div>
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={isPlayingTest}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#282828] hover:bg-[#333333] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#3e3e3e]/40 transition-colors shadow"
                >
                  <Play className="w-4 h-4 text-[#1ed760] fill-current" />
                  <span>{isPlayingTest ? 'Đang đọc thử...' : 'Nghe Thử Ngữ Điệu Giọng Đọc'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Tab 2: User Voice Recording Studio (Phòng Thu Giọng Người Dùng) */
            <div className="space-y-5">
              {/* Intro Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-[#1f1f1f] to-[#1a1a1a] border border-rose-900/40">
                <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  Phòng Thu Giọng Người Dùng Để Đọc Sách
                </h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  Bạn hãy đọc đoạn văn mẫu dưới đây. Hệ thống sẽ ghi nhận và tinh chỉnh các đặc tính âm sắc,
                  độ ấm và nhịp điệu của bạn để làm giọng đọc sách quen thuộc và truyền cảm nhất!
                </p>
              </div>

              {/* Sample Reading Script Box */}
              <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#1ed760] tracking-wider">
                    Đoạn Văn Mẫu Để Bạn Đọc Vào Micro:
                  </span>
                  <span className="text-[11px] text-neutral-400">Đọc diễn cảm, dịu dàng</span>
                </div>
                <p className="text-sm text-neutral-200 italic leading-relaxed bg-[#1a1a1a] p-3 rounded-lg border border-[#2c2c2c]">
                  "{sampleReadingScript}"
                </p>
              </div>

              {/* Live Recording Area & Waveform */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] gap-4">
                {/* Waveform Visualization Animation */}
                <div className="flex items-center gap-1.5 h-10">
                  {[...Array(16)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isRecording
                          ? 'bg-rose-500 animate-pulse'
                          : isPlayingRecorded
                          ? 'bg-[#1ed760] animate-pulse'
                          : 'bg-[#333333]'
                      }`}
                      style={{
                        height: isRecording
                          ? `${20 + Math.sin(i * 1.2 + recordingSeconds * 2) * 16}px`
                          : isPlayingRecorded
                          ? `${16 + Math.cos(i * 1.5) * 12}px`
                          : '8px',
                      }}
                    />
                  ))}
                </div>

                {/* Timer Display */}
                <div className="text-xl font-mono font-bold tracking-widest text-white">
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                  {isRecording && (
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2 animate-ping" />
                  )}
                </div>

                {/* Big Record / Stop Button */}
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
                    >
                      <Mic className="w-5 h-5 fill-current" />
                      <span>{recordedAudioUrl ? 'Ghi âm lại' : 'Bắt đầu ghi âm'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg animate-pulse hover:scale-105 active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Dừng & Lưu mẫu giọng</span>
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={togglePlayRecordedSample}
                      className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#2a2a2a] hover:bg-[#333333] text-white font-bold text-xs transition-all border border-[#3e3e3e]"
                    >
                      {isPlayingRecorded ? (
                        <>
                          <Pause className="w-4 h-4 text-[#1ed760] fill-current" />
                          <span>Dừng nghe</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-[#1ed760] fill-current" />
                          <span>Nghe lại bản thu</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Config Details (Name, Role, Tone Tuning) */}
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      Tên Hồ Sơ Giọng
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="VD: Giọng Mẹ Yêu Thương"
                      className="w-full bg-[#242424] border border-[#383838] focus:border-[#1ed760] rounded-lg px-3 py-2 text-white text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      Vai Trò Kể Chuyện
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'mom', label: 'Mẹ' },
                        { id: 'dad', label: 'Ba' },
                        { id: 'storyteller', label: 'Dẫn chuyện' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setNarratorRole(r.id as any);
                            if (r.id === 'mom') {
                              setRecordingPitch(1.06);
                              setProfileName('Giọng Mẹ Yêu Thương');
                            } else if (r.id === 'dad') {
                              setRecordingPitch(0.92);
                              setProfileName('Giọng Ba Trầm Ấm');
                            }
                          }}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                            narratorRole === r.id
                              ? 'border-[#1ed760] bg-[#1ed760]/20 text-[#1ed760]'
                              : 'border-[#333] bg-[#222] text-neutral-400 hover:text-white'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warmth & Pitch Tuning Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-neutral-400">Độ Ấm Áp Của Giọng</span>
                      <span className="font-bold text-rose-400">{recordingWarmth}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      value={recordingWarmth}
                      onChange={(e) => setRecordingWarmth(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-neutral-400">Cao Độ Giọng (Pitch)</span>
                      <span className="font-bold text-[#1ed760]">{recordingPitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.02"
                      value={recordingPitch}
                      onChange={(e) => setRecordingPitch(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#444] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                    />
                  </div>
                </div>

                {/* Save and Apply Profile */}
                <button
                  type="button"
                  onClick={handleSaveAndApplyVoiceProfile}
                  className="w-full py-3 px-4 rounded-xl bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-3"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Áp Dụng Làm Giọng Đọc Sách</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#282828] bg-[#1f1f1f] flex justify-between items-center">
          <span className="text-[11px] text-neutral-400">
            {activeTab === 'voices' ? (
              settings.expressiveMode ? (
                <span className="text-[#1ed760] flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đang bật nhấn nhá truyền cảm xúc
                </span>
              ) : (
                'Chế độ đọc tiêu chuẩn'
              )
            ) : (
              'Bản ghi âm được lưu an toàn trên máy của bạn'
            )}
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
