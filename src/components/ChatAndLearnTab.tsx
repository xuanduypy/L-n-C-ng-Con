import React, { useState, useRef, useEffect } from 'react';
import {
  ChildProfile,
  ChatMessage,
  PuppyMood,
  PuppyCostume,
  VoiceSettings,
} from '../types';
import { PuppyAvatar } from './PuppyAvatar';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calculator,
  RefreshCw,
} from 'lucide-react';

interface ChatAndLearnTabProps {
  childProfile: ChildProfile;
  puppyMood: PuppyMood;
  setPuppyMood: (mood: PuppyMood) => void;
  puppyCostume: PuppyCostume;
  setPuppyCostume: (costume: PuppyCostume) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, mode?: string) => Promise<void>;
  isLoading: boolean;
  isSpeaking: boolean;
  onSpeakText: (text: string, lang?: string) => void;
  onStopSpeak: () => void;
  onOpenPronounceModal: (word: string, phonetic: string, meaning: string) => void;
  voiceSettings: VoiceSettings;
  autoSpeak: boolean;
  setAutoSpeak: (val: boolean) => void;
}

export const ChatAndLearnTab: React.FC<ChatAndLearnTabProps> = ({
  childProfile,
  puppyMood,
  setPuppyMood,
  puppyCostume,
  setPuppyCostume,
  messages,
  onSendMessage,
  isLoading,
  isSpeaking,
  onSpeakText,
  onStopSpeak,
  onOpenPronounceModal,
  voiceSettings,
  autoSpeak,
  setAutoSpeak,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // When speech recognition ends with text, auto populate input or send
  useEffect(() => {
    if (!isListening && transcript) {
      setInputText(transcript);
    }
  }, [isListening, transcript]);

  const handleSend = async (textToSend?: string, mode: string = 'general') => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    resetTranscript();
    await onSendMessage(text, mode);
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        handleSend(transcript.trim());
      }
    } else {
      resetTranscript();
      startListening('vi-VN');
    }
  };

  const quickPrompts = [
    { label: 'Chào cún yêu!', emoji: '👋', mode: 'general' },
    { label: 'Dạy bé 1 từ tiếng Anh', emoji: '🍎', mode: 'english' },
    { label: 'Đố toán vui', emoji: '🔢', mode: 'math' },
    { label: 'Kể chuyện anh hùng', emoji: '⚔️', mode: 'history' },
    { label: 'Tại sao mây lại bay?', emoji: '☁️', mode: 'general' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto px-3 sm:px-4 pb-2">
      {/* Top Interactive Puppy Stage */}
      <div className="relative bg-gradient-to-b from-amber-100/80 via-rose-50/50 to-white/90 rounded-3xl p-3 sm:p-4 shadow-sm border-2 border-amber-200/80 mb-3 flex items-center justify-between overflow-hidden shrink-0">
        <div className="flex items-center gap-3">
          <PuppyAvatar
            name={childProfile.puppyName}
            mood={puppyMood}
            isSpeaking={isSpeaking}
            costume={puppyCostume}
            size="md"
            onPet={() => {
              setPuppyMood('dancing');
              onSpeakText(`Gâu gâu! ${childProfile.puppyName} yêu bé ${childProfile.name} lắm nha!`);
              setTimeout(() => setPuppyMood('happy'), 2000);
            }}
          />

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                {childProfile.puppyName}
              </h2>
              <span className="text-xs bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                Bạn của {childProfile.name}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              {isSpeaking
                ? 'Đang trò chuyện cùng bé nè... 🎵'
                : isListening
                ? 'Đang lắng nghe bé nói... 👂'
                : 'Chạm vào cún để chơi đùa hoặc nói chuyện cùng cún nhé!'}
            </p>

            {/* Quick Costume Selector */}
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-400">Trang phục:</span>
              {(['none', 'glasses', 'bowtie', 'crown'] as PuppyCostume[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setPuppyCostume(c)}
                  className={`text-xs px-1.5 py-0.5 rounded-md border transition ${
                    puppyCostume === c
                      ? 'bg-amber-400 border-amber-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {c === 'none' ? '🐾' : c === 'glasses' ? '👓' : c === 'bowtie' ? '🎀' : '👑'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Speak Sound Toggle */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={() => {
              if (isSpeaking) onStopSpeak();
              setAutoSpeak(!autoSpeak);
            }}
            className={`p-2 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold ${
              autoSpeak
                ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
            title={autoSpeak ? 'Cún đang tự động nói' : 'Bật tự động đọc giọng cún'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoSpeak ? 'Tự Đọc Bật' : 'Tự Đọc Tắt'}</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {messages.map((msg) => {
          const isPuppy = msg.sender === 'puppy';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isPuppy ? 'justify-start' : 'justify-end'}`}
            >
              {isPuppy && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-base shadow-xs mt-1">
                  🐶
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-3.5 sm:p-4 shadow-sm text-sm ${
                  isPuppy
                    ? 'bg-white border-2 border-amber-200/90 text-slate-800 rounded-tl-xs'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-medium rounded-tr-xs shadow-rose-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className={`text-[11px] font-extrabold ${isPuppy ? 'text-amber-800' : 'text-amber-100'}`}>
                    {isPuppy ? childProfile.puppyName : childProfile.name}
                  </span>
                  <span className={`text-[10px] ${isPuppy ? 'text-slate-400' : 'text-rose-100'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* English Word Highlight Card if included in message */}
                {msg.englishHighlight && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 text-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-rose-600">
                          {msg.englishHighlight.word}
                        </span>
                        <span className="text-xs text-amber-700 font-semibold">
                          {msg.englishHighlight.phonetic}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {msg.englishHighlight.meaning}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        onOpenPronounceModal(
                          msg.englishHighlight!.word,
                          msg.englishHighlight!.phonetic,
                          msg.englishHighlight!.meaning
                        )
                      }
                      className="shrink-0 flex items-center gap-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Luyện Đọc</span>
                    </button>
                  </div>
                )}

                {/* Speaker playback button for puppy messages */}
                {isPuppy && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSpeakText(msg.text)}
                      className="inline-flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Nghe cún đọc</span>
                    </button>
                  </div>
                )}
              </div>

              {!isPuppy && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-base shadow-xs mt-1">
                  {childProfile.avatar || '🧒'}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs bg-white px-4 py-3 rounded-2xl border border-amber-200 w-fit animate-pulse">
            <span className="animate-spin text-base">🐾</span>
            <span className="font-bold text-slate-700">{childProfile.puppyName} đang suy nghĩ trả lời bé...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Topic Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar shrink-0">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.label, p.mode)}
            className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-amber-200 text-slate-700 font-bold text-xs hover:bg-amber-100/60 active:scale-95 shadow-2xs transition"
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input Bar with Child Voice Recognition */}
      <div className="relative bg-white rounded-3xl p-2 shadow-lg border-2 border-amber-300 shrink-0">
        {/* Listening Indicator overlay */}
        {isListening && (
          <div className="absolute -top-10 inset-x-0 flex justify-center">
            <div className="bg-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Cún đang nghe bé nói... (Bấm nút đỏ để gửi)</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Big Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-2xl transition active:scale-95 shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-200'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
            }`}
            title="Bấm để nói chuyện với cún"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={isListening ? 'Bé hãy nói to rõ ràng nhé...' : 'Nói chuyện hoặc hỏi cún điều gì đó...'}
            className="flex-1 text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder:text-slate-400 font-medium px-2"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white rounded-2xl disabled:opacity-40 transition active:scale-95 shrink-0 shadow-md shadow-rose-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
