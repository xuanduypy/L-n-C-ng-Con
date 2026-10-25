import { MusicTrack } from '../types/book';

export const INITIAL_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Kìa Con Bướm Vàng',
    artist: 'Đồng dao thiếu nhi',
    category: 'vui_nhon',
    coverGradient: 'from-amber-600 via-yellow-700 to-[#121212]',
    coverBgColor: '#d97706',
    durationSec: 45,
    lyrics: `Kìa con bướm vàng, kìa con bướm vàng
Xòe đôi cánh, xòe đôi cánh
Bươm bướm bay đôi ba vòng, bươm bướm bay đôi ba vòng
Ra ngắm nhìn, ra ngắm nhìn!

Tung tăng bay lượn trên đồng cỏ hoa
Ánh nắng chan hòa, gió mát hiền hòa
Bé ngoan chăm học, hát ca tưng bừng!`,
    notes: [
      { note: 'C4', duration: 0.35 },
      { note: 'D4', duration: 0.35 },
      { note: 'E4', duration: 0.35 },
      { note: 'C4', duration: 0.35 },
      { note: 'C4', duration: 0.35 },
      { note: 'D4', duration: 0.35 },
      { note: 'E4', duration: 0.35 },
      { note: 'C4', duration: 0.35 },
      { note: 'E4', duration: 0.35 },
      { note: 'F4', duration: 0.35 },
      { note: 'G4', duration: 0.7 },
      { note: 'E4', duration: 0.35 },
      { note: 'F4', duration: 0.35 },
      { note: 'G4', duration: 0.7 },
      { note: 'G4', duration: 0.2 },
      { note: 'A4', duration: 0.2 },
      { note: 'G4', duration: 0.2 },
      { note: 'F4', duration: 0.2 },
      { note: 'E4', duration: 0.35 },
      { note: 'C4', duration: 0.35 },
      { note: 'C4', duration: 0.35 },
      { note: 'G4', duration: 0.35 },
      { note: 'C4', duration: 0.7 },
    ],
    isFavorite: true,
    isCustom: false,
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'track-2',
    title: 'Twinkle Twinkle Little Star',
    artist: 'English Nursery Rhyme',
    category: 'tieng_anh',
    coverGradient: 'from-indigo-600 via-blue-900 to-[#121212]',
    coverBgColor: '#4338ca',
    durationSec: 50,
    lyrics: `Twinkle, twinkle, little star,
How I wonder what you are!
Up above the world so high,
Like a diamond in the sky.

When the blazing sun is gone,
When he nothing shines upon,
Then you show your little light,
Twinkle, twinkle, all the night!`,
    notes: [
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'A4', duration: 0.4 },
      { note: 'A4', duration: 0.4 },
      { note: 'G4', duration: 0.8 },
      { note: 'F4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.8 },
    ],
    isFavorite: true,
    isCustom: false,
    createdAt: Date.now() - 9000000,
  },
  {
    id: 'track-3',
    title: 'Khúc Ca Ru Bé Ngủ Êm Đềm (Lullaby)',
    artist: 'Nhạc Ru Ngủ Gia Đình',
    category: 'ru_ngu',
    coverGradient: 'from-purple-700 via-slate-900 to-[#121212]',
    coverBgColor: '#7e22ce',
    durationSec: 65,
    lyrics: `À ơi... con ngủ cho ngoan
Gió thu phe phẩy, mây ngàn trôi êm
Trăng thanh soi bóng bên thềm
Cánh chim về tổ êm đềm ngủ say...

À ơi... con ngủ thật ngoan
Mẹ cha thương mãi muôn vàn vì sao
Ngoan ngoãn trong giấc mơ đào
Ngày mai thức dậy tươi màu ước mơ...`,
    notes: [
      { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.6 },
      { note: 'G4', duration: 0.6 },
      { note: 'C5', duration: 1.0 },
      { note: 'A4', duration: 0.6 },
      { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.8 },
      { note: 'D4', duration: 0.6 },
      { note: 'C4', duration: 1.2 },
      { note: 'G4', duration: 0.6 },
      { note: 'E4', duration: 0.6 },
      { note: 'C5', duration: 1.2 },
    ],
    isFavorite: true,
    isCustom: false,
    createdAt: Date.now() - 8000000,
  },
  {
    id: 'track-4',
    title: 'Chú Ếch Con Tinh Nghịch',
    artist: 'Hát Cùng Bé Yêu',
    category: 'vui_nhon',
    coverGradient: 'from-emerald-600 via-teal-900 to-[#121212]',
    coverBgColor: '#059669',
    durationSec: 40,
    lyrics: `Kìa chú là chú ếch con có hai là hai mắt tròn
Chú ngồi học bài một mình bên hố bom kề vườn xoan
Bao cô cá trê non cùng bao chú cá rô ron
Tung tăng vỗ tay khen ngợi chú ếch con ngoan thật ngoan!

Ếch ộp ộp, ộp ộp ộp!
Học bài chăm ngoan, mai sau nên người!`,
    notes: [
      { note: 'E4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'D4', duration: 0.3 },
      { note: 'C4', duration: 0.6 },
      { note: 'D4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'E4', duration: 0.6 },
    ],
    isFavorite: false,
    isCustom: false,
    createdAt: Date.now() - 7000000,
  },
  {
    id: 'track-5',
    title: 'Bé Tập Đếm 1 2 3',
    artist: 'Nhạc Phát Triển Tư Duy',
    category: 'vui_nhon',
    coverGradient: 'from-rose-600 via-red-950 to-[#121212]',
    coverBgColor: '#e11d48',
    durationSec: 35,
    lyrics: `Một với một là hai
Hai thêm hai là bốn
Bốn với một là năm
Năm ngón tay sạch đều!

Một bông hoa xinh tươi
Hai cánh bướm rập rờn
Ba chú chim líu lo
Bé đếm vui thật vui!`,
    notes: [
      { note: 'C4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'C5', duration: 0.6 },
      { note: 'B4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.6 },
      { note: 'F4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'D4', duration: 0.3 },
      { note: 'C4', duration: 0.6 },
    ],
    isFavorite: false,
    isCustom: false,
    createdAt: Date.now() - 6000000,
  },
  {
    id: 'track-6',
    title: 'Gia Đình Nhỏ, Hạnh Phúc To',
    artist: 'Nhạc Gia Đình Yêu Thương',
    category: 'ru_ngu',
    coverGradient: 'from-cyan-600 via-blue-950 to-[#121212]',
    coverBgColor: '#0891b2',
    durationSec: 55,
    lyrics: `Một nụ cười bé, cha vui cả ngày
Một vài tiếng khóc, mẹ lo hằng đêm
Nụ cười của con là niềm vui của cha mẹ
Ngôi nhà nhỏ ấm áp ngập tràn yêu thương...`,
    notes: [
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'G4', duration: 0.6 },
      { note: 'A4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'E4', duration: 0.6 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.8 },
    ],
    isFavorite: true,
    isCustom: false,
    createdAt: Date.now() - 5000000,
  },
];
