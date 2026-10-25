import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed as PWA or user dismissed this session
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Banner or Quick Install Action */}
      {(isInstallable || isIOS) && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white px-3 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md relative z-40">
          <div className="flex items-center gap-2.5">
            <img
              src="/apple-touch-icon.png"
              alt="Icon Lớn Cùng Con"
              className="w-7 h-7 rounded-lg shadow-sm border border-amber-200/60 object-cover shrink-0"
            />
            <span>
              Cài đặt <strong>Lớn Cùng Con</strong> vào màn hình chính điện thoại để học và nghe nhạc mọi lúc!
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 bg-white text-rose-600 px-3 py-1 rounded-full font-bold shadow hover:bg-rose-50 active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài Ngay</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1.5 bg-white text-rose-600 px-3 py-1 rounded-full font-bold shadow hover:bg-rose-50 active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài trên iPhone</span>
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border-4 border-amber-300">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <img
                  src="/apple-touch-icon.png"
                  alt="App Icon"
                  className="w-10 h-10 rounded-2xl shadow-md border-2 border-amber-300 object-cover"
                />
                <div>
                  <h3 className="text-base font-black text-rose-600 leading-tight">Cài đặt vào điện thoại</h3>
                  <p className="text-[11px] text-slate-500">Icon cún nhỏ trên nền vàng nhạt</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm">
              <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <div className="bg-blue-500 text-white p-2 rounded-xl mt-0.5">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Bước 1: Chạm nút Chia sẻ (Share)</p>
                  <p className="text-slate-600 text-xs">
                    Tìm biểu tượng hình vuông có mũi tên trỏ lên ở thanh công cụ dưới cùng của trình duyệt Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                <div className="bg-rose-500 text-white p-2 rounded-xl mt-0.5">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Bước 2: Chọn "Thêm vào MH chính"</p>
                  <p className="text-slate-600 text-xs">
                    Cuộn danh sách tùy chọn xuống và chọn <strong>"Add to Home Screen"</strong> (Thêm vào Màn hình chính).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-2xl mt-0.5">✨</span>
                <div>
                  <p className="font-bold text-slate-900">Bước 3: Mở ứng dụng</p>
                  <p className="text-slate-600 text-xs">
                    Biểu tượng chú cún xinh xắn sẽ xuất hiện ngay trên màn hình chính như một ứng dụng điện thoại thực thụ!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:opacity-95 active:scale-98 transition"
            >
              Đã Hiểu, Bé Cảm Ơn! 🐶
            </button>
          </div>
        </div>
      )}
    </>
  );
};
