import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Download,
  Sparkles,
  Share2,
  Trash2,
  Check,
  Loader2,
} from 'lucide-react';

export interface ItemActionMenuProps {
  title: string;
  subtitle?: string;
  type: 'book' | 'music';
  onDownload: () => Promise<void> | void;
  onRemix: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
  buttonClassName?: string;
}

export const ItemActionMenu: React.FC<ItemActionMenuProps> = ({
  title,
  subtitle,
  type,
  onDownload,
  onRemix,
  onShare,
  onDelete,
  isAdmin = false,
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Position calculation to guarantee menu is NEVER clipped or covered by screen edges or bottom player
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 208; // 52 * 4 = 208px
    const menuHeight = isAdmin && onDelete ? 230 : 180;
    const bottomPlayerReserve = 110; // Reserve space for Spotify bottom player and nav bar

    // Check vertical space (open upwards if close to bottom of screen or player)
    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - bottomPlayerReserve) {
      // Flip upwards if there is enough space above, or clamp inside viewport
      const topUpwards = rect.top - menuHeight - 6;
      top = topUpwards >= 10 ? topUpwards : Math.max(10, window.innerHeight - bottomPlayerReserve - menuHeight);
    }

    // Check horizontal space (align to right of button, or clamp inside viewport)
    let left = rect.right - menuWidth;
    if (left < 10) {
      left = 10;
    }
    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }

    setMenuCoords({ top, left });
  };

  // Close when clicking outside or scrolling
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    showToast(`Đang chuẩn bị file âm thanh "${title}"...`);
    try {
      await onDownload();
      showToast(`Đã tải về file âm thanh thành công!`);
    } catch (err) {
      console.error('Download error:', err);
      showToast('Tải về thất bại, vui lòng thử lại.');
    } finally {
      setIsDownloading(false);
      setIsOpen(false);
    }
  };

  const handleRemixClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onRemix();
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Nghe "${title}"${subtitle ? ` - ${subtitle}` : ''} trên DiNo Audio Studio: ${window.location.href}`;

    if (onShare) {
      onShare();
      setIsOpen(false);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle || 'DiNo Sách Nói & Nhạc AI',
          url: window.location.href,
        });
        setIsOpen(false);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setIsOpen(false);
          return;
        }
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      showToast('Đã sao chép liên kết chia sẻ!');
    } catch {
      showToast('Không thể sao chép liên kết.');
    }
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onDelete) {
      const confirmMsg = `Bạn có chắc muốn xóa vĩnh viễn "${title}"?`;
      if (window.confirm(confirmMsg)) {
        onDelete();
      }
    }
  };

  return (
    <>
      {/* 3-Dot Trigger Button with touch target and crisp hover */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          updatePosition();
          setIsOpen((prev) => !prev);
        }}
        className={`w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center rounded-full transition-all border shadow cursor-pointer active:scale-90 ${
          isOpen
            ? 'bg-[#1ed760] text-black border-[#1ed760] ring-2 ring-[#1ed760]/30'
            : 'bg-[#222222]/90 hover:bg-[#333333] text-neutral-300 hover:text-white border-neutral-700/80 hover:border-neutral-500'
        } ${buttonClassName}`}
        title="Tùy chọn: Tải về, Phối lại (Remix), Chia sẻ"
        aria-label="Tùy chọn tác phẩm"
      >
        <MoreVertical className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Render menu portal directly into document.body to guarantee ZERO clipping */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop overlay to dismiss cleanly on outside tap/click */}
            <div
              className="fixed inset-0 z-[99998] bg-black/25 md:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
                zIndex: 99999,
              }}
              className="w-52 rounded-2xl bg-[#1c1c1c]/98 border border-neutral-700 shadow-2xl p-1.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-100 select-none text-white ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Title in Menu */}
              <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                <p className="text-xs font-black text-white truncate" title={title}>
                  {title}
                </p>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {type === 'book' ? 'Sách nói' : 'Bài hát AI'}
                </span>
              </div>

            {/* 1. Tải về âm thanh */}
            <button
              type="button"
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-800/90 transition-colors text-left disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
              ) : (
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{isDownloading ? 'Đang xuất file...' : 'Tải về (WAV)'}</span>
            </button>

            {/* 2. Remix (Phối lại / Chỉnh sửa) */}
            <button
              type="button"
              onClick={handleRemixClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-800/90 transition-colors text-left group cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform shrink-0" />
              <div className="flex flex-col min-w-0">
                <span>Remix (Phối lại)</span>
                <span className="text-[9px] text-neutral-400 font-normal truncate">
                  {type === 'book' ? 'Sửa văn bản, đổi giọng' : 'Sửa lời, đổi giai điệu'}
                </span>
              </div>
            </button>

            {/* 3. Chia sẻ */}
            <button
              type="button"
              onClick={handleShareClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-200 hover:text-white hover:bg-neutral-800/90 transition-colors text-left cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Chia sẻ tác phẩm</span>
            </button>

            {/* 4. Xóa (Dành riêng cho Admin) */}
            {isAdmin && onDelete && (
              <>
                <div className="border-t border-neutral-800 my-1" />
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors text-left cursor-pointer active:scale-98"
                >
                  <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Xóa tác phẩm (Admin)</span>
                </button>
              </>
            )}
          </div>
        </>,
        document.body
      )}

      {/* Global Toast Notification */}
      {toastMessage &&
        createPortal(
          <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[10000] px-4 py-2.5 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-bold shadow-2xl flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Check className="w-4 h-4 text-[#1ed760] shrink-0" />
            <span>{toastMessage}</span>
          </div>,
          document.body
        )}
    </>
  );
};
