import React from 'react';
import { VoiceSettings } from '../types';
import { VOICE_PRESETS } from '../data/defaultData';
import { Volume2, Sparkles, X, Check, Play } from 'lucide-react';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSave: (newSettings: VoiceSettings) => void;
  onTestSpeak: (text: string, tempSettings?: VoiceSettings) => void;
  isSpeaking: boolean;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestSpeak,
  isSpeaking,
}) => {
  const [localSettings, setLocalSettings] = React.useState<VoiceSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: 'puppy' | 'mother' | 'teacher' | 'grandpa') => {
    const preset = VOICE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setLocalSettings((prev) => ({
      ...prev,
      presetId,
      pitch: preset.pitch,
      rate: preset.rate,
      geminiVoice: preset.geminiVoice,
    }));
  };

  const handleTestVoice = () => {
    const preset = VOICE_PRESETS.find((p) => p.id === localSettings.presetId);
    let sample = 'Gâu gâu! Bé yêu ơi, hôm nay bé có vui không nào? Cún nhớ bé lắm!';
    if (localSettings.presetId === 'mother') {
      sample = 'Mẹ chào con yêu! Hôm nay con đã học được những điều gì thú vị nào?';
    } else if (localSettings.presetId === 'teacher') {
      sample = 'Chào con! Hôm nay chúng ta cùng luyện phát âm tiếng Anh thật chuẩn nhé!';
    } else if (localSettings.presetId === 'grandpa') {
      sample = 'Ông chào cháu ngoan! Lại đây ông kể cho cháu nghe câu chuyện cổ tích ngày xưa nhé.';
    }
    onTestSpeak(sample, localSettings);
  };

  const handleSaveAndClose = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl text-slate-800 border-4 border-amber-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Tùy Chỉnh Giọng Đọc Của Cún</h3>
              <p className="text-xs text-slate-500">Chọn giọng đọc ấm áp, gần gũi nhất với bé yêu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Presets */}
        <div className="mt-4">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 block">
            1. Chọn Phong Cách Nhân Vật
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {VOICE_PRESETS.map((preset) => {
              const isSelected = localSettings.presetId === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`relative p-3.5 rounded-2xl cursor-pointer border-2 transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/80 shadow-md scale-[1.02]'
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{preset.icon}</span>
                    <span className="font-extrabold text-sm text-slate-800">{preset.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-rose-500 text-white p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Engine Selection */}
        <div className="mt-5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 block">
            2. Công Nghệ Giọng Đọc
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLocalSettings((prev) => ({ ...prev, engine: 'gemini_tts' }))}
              className={`p-3 rounded-2xl border-2 text-left transition flex items-start gap-2.5 ${
                localSettings.engine === 'gemini_tts'
                  ? 'border-amber-500 bg-amber-50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-slate-900">Gemini AI Studio Voice</p>
                <p className="text-[11px] text-slate-500">Giọng đọc AI cảm xúc, tự nhiên như người thật</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLocalSettings((prev) => ({ ...prev, engine: 'browser_tts' }))}
              className={`p-3 rounded-2xl border-2 text-left transition flex items-start gap-2.5 ${
                localSettings.engine === 'browser_tts'
                  ? 'border-amber-500 bg-amber-50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Volume2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-slate-900">Giọng Nói Trực Tiếp</p>
                <p className="text-[11px] text-slate-500">Phản hồi siêu tốc, hoạt động mượt mà không độ trễ</p>
              </div>
            </button>
          </div>
        </div>

        {/* Fine Tuning Sliders */}
        <div className="mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Độ cao giọng (Pitch):</span>
              <span className="text-rose-600">
                {localSettings.pitch < 1 ? 'Trầm ấm' : localSettings.pitch > 1.2 ? 'Trong trẻo, cao vút' : 'Vừa vặn'} ({localSettings.pitch.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={localSettings.pitch}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }))
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
              <span>Tốc độ đọc (Speed):</span>
              <span className="text-rose-600">
                {localSettings.rate < 0.9 ? 'Chậm rãi cho bé nghe rõ' : localSettings.rate > 1.1 ? 'Nhanh nhẹn' : 'Bình thường'} ({localSettings.rate.toFixed(2)}x)
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={localSettings.rate}
              onChange={(e) =>
                setLocalSettings((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleTestVoice}
            disabled={isSpeaking}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 py-3 rounded-2xl font-bold text-sm transition active:scale-98 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isSpeaking ? 'animate-spin' : ''}`} />
            <span>{isSpeaking ? 'Đang đọc...' : 'Nghe Thử Ngay'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white py-3 rounded-2xl font-black text-sm shadow-lg shadow-rose-200 transition active:scale-98"
          >
            Lưu Cài Đặt
          </button>
        </div>
      </div>
    </div>
  );
};
