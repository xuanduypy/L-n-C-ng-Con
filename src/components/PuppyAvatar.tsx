import React, { useState } from 'react';
import { PuppyMood, PuppyCostume } from '../types';

interface PuppyAvatarProps {
  name: string;
  mood: PuppyMood;
  isSpeaking?: boolean;
  costume?: PuppyCostume;
  onPet?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showNameTag?: boolean;
}

export const PuppyAvatar: React.FC<PuppyAvatarProps> = ({
  name,
  mood,
  isSpeaking = false,
  costume = 'none',
  onPet,
  size = 'lg',
  showNameTag = true,
}) => {
  const [interactiveMood, setInteractiveMood] = useState<PuppyMood | null>(null);

  const joyfulCycle: PuppyMood[] = ['dancing', 'playing_ball', 'waving', 'laughing', 'grooving'];

  const handlePuppyClick = () => {
    // Pick next joyful activity randomly or sequentially
    const randomJoy = joyfulCycle[Math.floor(Math.random() * joyfulCycle.length)];
    setInteractiveMood(randomJoy);
    setTimeout(() => setInteractiveMood(null), 2400);
    onPet?.();
  };

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52 sm:w-60 sm:h-60',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  }[size];

  // Effective mood combines props, speaking, and interaction
  const currentMood: PuppyMood = interactiveMood || (isSpeaking ? 'talking' : mood);

  const isDancingOrGrooving = currentMood === 'dancing' || currentMood === 'grooving';
  const isPlayingBall = currentMood === 'playing_ball';
  const isWaving = currentMood === 'waving';
  const isLaughing = currentMood === 'laughing';

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Floating stars or musical notes when dancing, grooving, or excited */}
      {(isDancingOrGrooving || currentMood === 'excited') && (
        <div className="absolute -top-10 inset-x-0 flex justify-between pointer-events-none px-2 z-20">
          <span className="text-2xl animate-music-note-1">🎵</span>
          <span className="text-2xl animate-float-star">✨</span>
          <span className="text-3xl animate-music-note-2">🎶</span>
          <span className="text-xl animate-float-star delay-200">⭐</span>
          <span className="text-2xl animate-music-note-3">🎵</span>
        </div>
      )}

      {/* Laughing heart sparkles */}
      {isLaughing && (
        <div className="absolute -top-8 inset-x-0 flex justify-center gap-4 pointer-events-none z-20">
          <span className="text-2xl animate-bounce">💖</span>
          <span className="text-2xl animate-float-star">✨</span>
          <span className="text-2xl animate-bounce delay-100">🥰</span>
        </div>
      )}

      {/* Waving star greeting */}
      {isWaving && (
        <div className="absolute -top-6 right-2 text-2xl animate-bounce pointer-events-none z-20">
          🐾✨
        </div>
      )}

      {/* Sleeping Zzz */}
      {currentMood === 'sleeping' && (
        <div className="absolute -top-4 right-4 text-rose-500 font-black text-xl animate-pulse pointer-events-none">
          Zzz... 💤
        </div>
      )}

      {/* Sound wave rings when listening */}
      {currentMood === 'listening' && (
        <div className="absolute inset-0 rounded-full border-4 border-rose-400/40 animate-ping pointer-events-none" />
      )}

      {/* Main Puppy Character SVG Container */}
      <div
        onClick={handlePuppyClick}
        className={`relative ${sizeClasses} cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 filter drop-shadow-2xl ${
          isDancingOrGrooving
            ? 'animate-groove-dance'
            : isSpeaking
            ? 'animate-gentle-bounce'
            : ''
        }`}
        title={`Chạm vào ${name} để chơi đùa cùng cún!`}
      >
        {/* Playful Toy Ball that bounces above the puppy nose */}
        {isPlayingBall && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 z-30 pointer-events-none animate-ball-bounce">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#ballGrad)" />
              {/* White star on the ball */}
              <polygon
                points="50,22 58,38 76,40 62,52 66,70 50,60 34,70 38,52 24,40 42,38"
                fill="#FFFFFF"
              />
              <circle cx="36" cy="36" r="6" fill="#FFFFFF" opacity="0.6" />
            </svg>
          </div>
        )}

        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <linearGradient id="bodyFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>
            <linearGradient id="earFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FB7185" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Wagging Tail behind body */}
          <g
            className={
              isDancingOrGrooving || isPlayingBall
                ? 'animate-tail-wag-fast'
                : currentMood !== 'sleeping'
                ? 'animate-tail-wag'
                : ''
            }
          >
            <path
              d="M100 280 C60 250 50 200 80 180 C95 170 110 200 115 250 Z"
              fill="url(#earFur)"
            />
          </g>

          {/* Puppy Body */}
          <ellipse cx="200" cy="305" rx="90" ry="70" fill="url(#bodyFur)" />
          {/* White Chest Patch */}
          <ellipse cx="200" cy="315" rx="50" ry="45" fill="#FFFBEB" />

          {/* Left Paw (Normal resting forward) */}
          <ellipse cx="145" cy="355" rx="28" ry="18" fill="#FDBA74" />
          <circle cx="138" cy="358" r="4" fill="#EA580C" opacity="0.4" />
          <circle cx="146" cy="360" r="4" fill="#EA580C" opacity="0.4" />
          <circle cx="154" cy="358" r="4" fill="#EA580C" opacity="0.4" />

          {/* Right Paw: Waving Paw if isWaving or isPlayingBall, otherwise normal resting */}
          {isWaving || isPlayingBall ? (
            <g className="animate-paw-wave">
              {/* Arm reaching up */}
              <path
                d="M245 320 C265 310 295 270 285 240 C275 230 255 245 245 280 Z"
                fill="url(#bodyFur)"
              />
              {/* Cute Waving Paw */}
              <ellipse cx="285" cy="240" rx="22" ry="18" fill="#FDBA74" />
              {/* Pink Paw Pad */}
              <ellipse cx="285" cy="240" rx="10" ry="8" fill="#FB7185" opacity="0.85" />
              <circle cx="276" cy="230" r="3" fill="#FB7185" />
              <circle cx="284" cy="227" r="3" fill="#FB7185" />
              <circle cx="293" cy="230" r="3" fill="#FB7185" />
            </g>
          ) : (
            <>
              <ellipse cx="255" cy="355" rx="28" ry="18" fill="#FDBA74" />
              <circle cx="246" cy="358" r="4" fill="#EA580C" opacity="0.4" />
              <circle cx="254" cy="360" r="4" fill="#EA580C" opacity="0.4" />
              <circle cx="262" cy="358" r="4" fill="#EA580C" opacity="0.4" />
            </>
          )}

          {/* Left Ear */}
          <g className={currentMood !== 'sleeping' ? 'animate-ear-left' : ''}>
            <path
              d="M115 150 C70 190 70 280 120 295 C145 305 160 250 150 195 Z"
              fill="url(#earFur)"
            />
            {/* Inner ear soft pink */}
            <path
              d="M118 180 C90 215 90 270 120 280 C135 285 145 250 140 210 Z"
              fill="#FBCFE8"
              opacity="0.5"
            />
          </g>

          {/* Right Ear */}
          <g className={currentMood !== 'sleeping' ? 'animate-ear-right' : ''}>
            <path
              d="M285 150 C330 190 330 280 280 295 C255 305 240 250 250 195 Z"
              fill="url(#earFur)"
            />
            {/* Inner ear soft pink */}
            <path
              d="M282 180 C310 215 310 270 280 280 C265 285 255 250 260 210 Z"
              fill="#FBCFE8"
              opacity="0.5"
            />
          </g>

          {/* Puppy Head */}
          <ellipse
            cx="200"
            cy="195"
            rx="96"
            ry="85"
            fill="url(#bodyFur)"
            transform={
              currentMood === 'listening'
                ? 'rotate(-6 200 195)'
                : isDancingOrGrooving
                ? 'rotate(4 200 195)'
                : ''
            }
          />

          {/* Forehead cute fur tufts */}
          <path
            d="M190 115 Q200 95 208 115 Q216 102 218 120"
            fill="none"
            stroke="#FED7AA"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Cheerful Pink Cheeks */}
          <ellipse cx="140" cy="225" rx="18" ry="12" fill="url(#blushGrad)" />
          <ellipse cx="260" cy="225" rx="18" ry="12" fill="url(#blushGrad)" />

          {/* Muzzle (Snout) */}
          <ellipse cx="200" cy="225" rx="42" ry="32" fill="#FFFFFF" />

          {/* Nose */}
          <path
            d="M188 206 C188 202 212 202 212 206 C212 216 188 216 188 206 Z"
            fill="#1E293B"
          />
          <ellipse cx="196" cy="204" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" />

          {/* Puppy Eyes */}
          {currentMood === 'sleeping' ? (
            /* Closed sleeping eyes */
            <>
              <path
                d="M145 185 Q158 198 170 185"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M230 185 Q242 198 255 185"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </>
          ) : isLaughing || isDancingOrGrooving ? (
            /* Adorable joyful smiling crescent eyes (^ ^) */
            <>
              <path
                d="M145 185 Q158 165 171 185"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M229 185 Q242 165 255 185"
                fill="none"
                stroke="#1E293B"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </>
          ) : currentMood === 'thinking' ? (
            /* Looking up thoughtfully */
            <>
              <ellipse cx="158" cy="175" rx="12" ry="14" fill="#0F172A" />
              <circle cx="155" cy="170" r="5" fill="#FFFFFF" />
              <ellipse cx="242" cy="175" rx="12" ry="14" fill="#0F172A" />
              <circle cx="239" cy="170" r="5" fill="#FFFFFF" />
            </>
          ) : (
            /* Big, loving, sparkling eyes with gentle blink */
            <g className="animate-blink">
              <ellipse cx="158" cy="178" rx="13" ry="16" fill="#0F172A" />
              <ellipse cx="242" cy="178" rx="13" ry="16" fill="#0F172A" />
              {/* Highlights */}
              <circle cx="153" cy="173" r="5" fill="#FFFFFF" />
              <circle cx="163" cy="183" r="2.5" fill="#FFFFFF" />
              <circle cx="237" cy="173" r="5" fill="#FFFFFF" />
              <circle cx="247" cy="183" r="2.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Eyebrows */}
          <path
            d="M148 156 Q158 150 168 156"
            fill="none"
            stroke="#C2410C"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M232 156 Q242 150 252 156"
            fill="none"
            stroke="#C2410C"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Mouth & Tongue - Clean, joyful smile without up-down jitter */}
          {isLaughing || isDancingOrGrooving || isSpeaking || currentMood === 'happy' || currentMood === 'excited' ? (
            /* Sweet open joyful smile with pink tongue (stable, calm, clean) */
            <>
              <path
                d="M200 216 Q190 228 176 223"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M200 216 Q210 228 224 223"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Playful cute tongue */}
              <path d="M191 224 C191 242 209 242 209 224 Z" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
            </>
          ) : (
            /* Gentle relaxed smile */
            <>
              <path
                d="M200 217 Q190 227 180 222"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M200 217 Q210 227 220 222"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Reading Spectacles (if in reading mode or glasses costume) */}
          {(currentMood === 'reading' || costume === 'glasses') && (
            <g>
              <circle
                cx="158"
                cy="178"
                r="18"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
              />
              <circle
                cx="242"
                cy="178"
                r="18"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="4"
              />
              <path
                d="M176 178 Q200 172 224 178"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
              <path
                d="M140 176 L120 168"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
              <path
                d="M260 176 L280 168"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3.5"
              />
            </g>
          )}

          {/* Red Collar with Golden Bell */}
          <path
            d="M150 268 Q200 292 250 268"
            fill="none"
            stroke="url(#collarGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Shiny Golden Bell */}
          <circle
            cx="200"
            cy="288"
            r="12"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="2.5"
          />
          <circle cx="200" cy="290" r="2.5" fill="#78350F" />

          {/* Bowtie Costume */}
          {costume === 'bowtie' && (
            <g transform="translate(182, 276) scale(0.7)">
              <polygon points="0,0 25,15 0,30" fill="#3B82F6" />
              <polygon points="50,0 25,15 50,30" fill="#3B82F6" />
              <circle cx="25" cy="15" r="7" fill="#1D4ED8" />
            </g>
          )}

          {/* Crown Costume */}
          {costume === 'crown' && (
            <g transform="translate(160, 68) scale(0.8)">
              <polygon
                points="10,40 20,10 50,25 80,10 90,40"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="3"
              />
              <circle cx="20" cy="10" r="4" fill="#EF4444" />
              <circle cx="50" cy="25" r="4" fill="#3B82F6" />
              <circle cx="80" cy="10" r="4" fill="#10B981" />
            </g>
          )}
        </svg>
      </div>

      {/* Name Badge */}
      {showNameTag && (
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-white font-extrabold text-xs sm:text-sm shadow-md border-2 border-white">
          <span>🐾</span>
          <span>{name}</span>
          {isSpeaking && <span className="animate-spin text-xs">✨</span>}
        </div>
      )}
    </div>
  );
};
