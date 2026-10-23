import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Delete } from 'lucide-react';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  savedPin?: string;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  savedPin = '1234',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ num1: 4, num2: 5, answer: 9 });

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      const a = Math.floor(Math.random() * 6) + 3;
      const b = Math.floor(Math.random() * 6) + 2;
      setMathQuestion({ num1: a, num2: b, answer: a + b });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin === savedPin || parseInt(nextPin, 10) === mathQuestion.answer) {
        setTimeout(() => {
          onSuccess();
        }, 150);
      } else if (nextPin.length === 4) {
        setError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border-4 border-amber-300 text-center">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5 text-rose-600 font-extrabold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Khu Vực Phụ Huynh</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-1">
          Nhập mã PIN hoặc tính nhẩm kết quả:
        </p>
        <p className="text-base font-black text-slate-800 mb-3 bg-amber-50 py-1.5 rounded-xl border border-amber-200">
          {mathQuestion.num1} + {mathQuestion.num2} = ?
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'border-amber-500 bg-amber-500 scale-110'
                  : 'border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-rose-600 font-bold mb-2 animate-pulse">
            Mã chưa đúng, vui lòng thử lại! (Mặc định: {savedPin} hoặc kết quả phép tính)
          </p>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-amber-100 font-black text-lg text-slate-800 active:scale-95 transition"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={onClose}
            className="py-3 rounded-2xl bg-slate-50 text-slate-400 font-bold text-xs hover:bg-slate-100"
          >
            Hủy
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-2xl bg-slate-100 hover:bg-amber-100 font-black text-lg text-slate-800 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="py-3 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-600 font-bold flex items-center justify-center active:scale-95 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
