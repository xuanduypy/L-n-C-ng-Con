import {
  ChildProfile,
  EnglishWord,
  MathChallenge,
  HistoryTopic,
  StoryBookItem,
  VoicePreset,
  VoiceSettings,
  SecuritySettings,
  MusicTrack,
} from '../types';

export const DEFAULT_CHILD_PROFILE: ChildProfile = {
  name: 'Bé Sam',
  age: 5,
  nickname: 'Sammy',
  puppyName: 'Cún Bông',
  avatar: '🧒',
  level: 'mầm non',
  dailyGoalMinutes: 15,
};

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'puppy',
    name: 'Cún Con Tinh Nghịch',
    description: 'Giọng chú chó nhỏ trong trẻo, vui tươi, tràn đầy năng lượng và dễ thương',
    icon: '🐶',
    pitch: 1.35,
    rate: 1.05,
    geminiVoice: 'Puck',
    geminiStylePrompt: 'Playful, cheerful, high-spirited puppy friend speaking to a 5-year-old child',
  },
  {
    id: 'mother',
    name: 'Mẹ Yêu Dịu Dàng',
    description: 'Giọng nói ngọt ngào, ấm áp như mẹ kể chuyện ru bé ngủ say',
    icon: '🌸',
    pitch: 1.0,
    rate: 0.9,
    geminiVoice: 'Kore',
    geminiStylePrompt: 'Warm, loving, extremely gentle mother reading bedtime stories to her beloved child',
  },
  {
    id: 'teacher',
    name: 'Cô Giáo Cảm Hứng',
    description: 'Phát âm tròn vành rõ chữ, giọng điệu truyền cảm khích lệ bé học',
    icon: '👩‍🏫',
    pitch: 1.1,
    rate: 0.95,
    geminiVoice: 'Zephyr',
    geminiStylePrompt: 'Clear, articulate, encouraging kindergarten teacher guiding a young child',
  },
  {
    id: 'grandpa',
    name: 'Ông Ngoại Kể Chuyện',
    description: 'Giọng trầm ấm, từ tốn, đầy tình cảm như câu chuyện bà kể bên bếp lửa',
    icon: '👴',
    pitch: 0.8,
    rate: 0.85,
    geminiVoice: 'Fenrir',
    geminiStylePrompt: 'Wise, soothing, cozy grandfather narrating ancient folklore by a warm fire',
  },
];

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  engine: 'browser_tts',
  presetId: 'puppy',
  pitch: 1.35,
  rate: 1.05,
  volume: 1,
  geminiVoice: 'Puck',
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  parentPin: '1234',
  historyRetentionHours: 72, // 3 days auto-delete by default
  autoPurgeEnabled: true,
  lastPurgedAt: Date.now(),
};

export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'music-1',
    title: 'Kìa Con Bướm Vàng',
    category: 'vui_nhon',
    icon: '🦋',
    description: 'Bài hát thiếu nhi rộn ràng, giai điệu đàn bướm vàng tung cánh bay lượn',
    lyrics: 'Kìa con bướm vàng, xòe đôi cánh, bay tung tăng tung tăng...',
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
  },
  {
    id: 'music-2',
    title: 'Twinkle Twinkle Little Star',
    category: 'tieng_anh',
    icon: '⭐',
    description: 'Ngôi sao nhỏ lấp lánh trên bầu trời đêm diệu kỳ',
    lyrics: 'Twinkle, twinkle, little star, how I wonder what you are...',
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
  },
  {
    id: 'music-3',
    title: 'Bé Tập Đếm Số 1 2 3',
    category: 'vui_nhon',
    icon: '🔢',
    description: 'Giai điệu vui tươi giúp bé ghi nhớ số đếm dễ thương',
    lyrics: 'Một với một là hai, hai thêm hai là bốn...',
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
  },
  {
    id: 'music-4',
    title: 'Chú Ếch Con Tinh Nghịch',
    category: 'dong_dao',
    icon: '🐸',
    description: 'Chú ếch con ngoan ngoãn ngồi học bài bên bờ ao',
    lyrics: 'Kìa chú ếch con có hai là hai mắt tròn...',
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
  },
  {
    id: 'music-5',
    title: 'Khúc Ca Ru Bé Ngủ Êm Đềm',
    category: 'ru_ngu',
    icon: '🌙',
    description: 'Âm thanh du dương, ngọt ngào đưa bé vào giấc ngủ say',
    lyrics: 'À ơi con ngủ cho ngoan, gió mát mây êm...',
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
    ],
  },
];

export const DEFAULT_ENGLISH_WORDS: EnglishWord[] = [
  {
    id: 'eng-1',
    word: 'Puppy',
    phonetic: '/ˈpʌp.i/ (đọc là: pắp-pi)',
    vietnamese: 'Chú cún con',
    category: 'Động vật',
    exampleSentence: 'I love my cute puppy!',
    exampleVietnamese: 'Bé rất yêu chú cún con dễ thương!',
    iconEmoji: '🐶',
    mastered: true,
    bestScore: 98,
    gentleCoachingNotes:
      'Nhắc bé mím môi nhẹ và bật hơi âm "P" giòn tan: Pắp - pi! Giống như tiếng chú cún đang vẫy tai mừng rỡ vậy đó!',
  },
  {
    id: 'eng-2',
    word: 'Apple',
    phonetic: '/ˈæp.əl/ (đọc là: ép-pồ)',
    vietnamese: 'Quả táo đỏ',
    category: 'Trái cây',
    exampleSentence: 'An apple is sweet and red.',
    exampleVietnamese: 'Quả táo ngọt lịm và đỏ rực.',
    iconEmoji: '🍎',
    mastered: false,
    bestScore: 88,
    gentleCoachingNotes:
      'Bé mở miệng to âm "Ép" rồi cong lưỡi nhẹ ở âm "pồ" nhé! Giống như khi bé chuẩn bị cắn một miếng táo giòn ngọt lịm!',
  },
  {
    id: 'eng-3',
    word: 'Sun',
    phonetic: '/sʌn/ (đọc là: săn)',
    vietnamese: 'Mặt trời ấm áp',
    category: 'Thiên nhiên',
    exampleSentence: 'The sun shines brightly.',
    exampleVietnamese: 'Mặt trời tỏa nắng rực rỡ.',
    iconEmoji: '☀️',
    mastered: false,
    gentleCoachingNotes:
      'Bé cười nhẹ để lộ hàm răng và xì nhẹ âm "s-s-săn" nha! Giống như tia nắng sớm ấm áp sưởi ấm cho bé!',
  },
  {
    id: 'eng-4',
    word: 'Friend',
    phonetic: '/frend/ (đọc là: phen-đ)',
    vietnamese: 'Người bạn thân thiết',
    category: 'Cảm xúc & Giao tiếp',
    exampleSentence: 'You are my best friend!',
    exampleVietnamese: 'Bạn là người bạn thân nhất của tớ!',
    iconEmoji: '🤝',
    mastered: true,
    bestScore: 95,
    gentleCoachingNotes:
      'Bé đặt răng cửa hàm trên chạm nhẹ môi dưới phát âm "ph...ren-đ". Chú cún chính là best friend của bé nè!',
  },
  {
    id: 'eng-5',
    word: 'Star',
    phonetic: '/stɑːr/ (đọc là: x-ta)',
    vietnamese: 'Ngôi sao lấp lánh',
    category: 'Vũ trụ',
    exampleSentence: 'Twinkle, twinkle, little star!',
    exampleVietnamese: 'Lấp lánh lấp lánh, ngôi sao nhỏ ơi!',
    iconEmoji: '⭐',
    mastered: false,
    gentleCoachingNotes:
      'Bé phát âm gió nhẹ "x" rồi mở rộng miệng "ta": X-ta! Ngôi sao nhỏ đang nhấp nháy trên bầu trời đêm.',
  },
  {
    id: 'eng-6',
    word: 'Brave',
    phonetic: '/breɪv/ (đọc là: b-rây-v)',
    vietnamese: 'Dũng cảm, can đảm',
    category: 'Phẩm chất tốt',
    exampleSentence: 'Be brave and try again!',
    exampleVietnamese: 'Bé hãy dũng cảm và thử lại nhé!',
    iconEmoji: '🦁',
    mastered: false,
    gentleCoachingNotes:
      'Bé đọc nối âm "b-rây" và kết thúc bằng âm "v" thật êm nhé! Bé tự tin phát âm là một em bé dũng cảm tuyệt vời!',
  },
  {
    id: 'eng-7',
    word: 'Rainbow',
    phonetic: '/ˈreɪn.bəʊ/ (đọc là: rên-bâu)',
    vietnamese: 'Cầu vồng rực rỡ',
    category: 'Thiên nhiên',
    exampleSentence: 'Look at the beautiful rainbow!',
    exampleVietnamese: 'Nhìn cầu vồng 7 sắc xinh đẹp kìa!',
    iconEmoji: '🌈',
    mastered: false,
    gentleCoachingNotes:
      'Bé uốn lưỡi nhẹ âm "Rên" rồi tròn môi âm "Bâu". Cầu vồng có tận 7 màu rực rỡ sau cơn mưa rào!',
  },
  {
    id: 'eng-8',
    word: 'Family',
    phonetic: '/ˈfæm.əl.i/ (đọc là: phe-mơ-li)',
    vietnamese: 'Gia đình yêu thương',
    category: 'Gia đình',
    exampleSentence: 'I love my family so much.',
    exampleVietnamese: 'Bé yêu thương gia đình mình rất nhiều.',
    iconEmoji: '👨‍👩‍👧‍👦',
    mastered: false,
    gentleCoachingNotes:
      'Bé đọc liền 3 tiếng: Phe - mơ - li! Nơi có ba mẹ và những người yêu thương bé nhất trần đời.',
  },
];

export const DEFAULT_MATH_CHALLENGES: MathChallenge[] = [
  {
    id: 'math-1',
    question: 'Cún Bông có 2 quả táo đỏ 🍎🍎, bé tặng thêm cho Cún 1 quả táo nữa 🍎. Hỏi Cún có tất cả mấy quả táo?',
    visualEmoji: '🍎',
    visualCountA: 2,
    visualCountB: 1,
    operation: '+',
    options: [2, 3, 4],
    correctAnswer: 3,
    hint: 'Bé hãy đếm cùng cún nhé: 1, 2, và thêm 1 là...?',
  },
  {
    id: 'math-2',
    question: 'Trên cành cây có 4 chú chim nhỏ 🐦🐦🐦🐦, 1 chú bay đi tìm mẹ 🐦. Hỏi trên cành còn lại bao nhiêu chú chim?',
    visualEmoji: '🐦',
    visualCountA: 4,
    visualCountB: 1,
    operation: '-',
    options: [2, 3, 5],
    correctAnswer: 3,
    hint: 'Bớt đi 1 chú chim thì còn lại mấy chú nào?',
  },
  {
    id: 'math-3',
    question: 'Bé nhìn lên bầu trời đêm và đếm xem có bao nhiêu ngôi sao vàng lấp lánh đang mỉm cười nhé! ⭐⭐⭐⭐⭐',
    visualEmoji: '⭐',
    visualCountA: 5,
    visualCountB: 0,
    operation: 'count',
    options: [4, 5, 6],
    correctAnswer: 5,
    hint: 'Chạm tay vào từng ngôi sao để cùng đếm 1, 2, 3, 4, 5!',
  },
  {
    id: 'math-4',
    question: 'Cún nhặt được 3 cục xương 🦴🦴🦴, mẹ cún mang thêm 2 cục xương 🦴🦴. Tổng cộng có bao nhiêu cục xương ngon lành?',
    visualEmoji: '🦴',
    visualCountA: 3,
    visualCountB: 2,
    operation: '+',
    options: [4, 5, 6],
    correctAnswer: 5,
    hint: '3 cộng thêm 2 bằng mấy ta?',
  },
];

export const DEFAULT_HISTORY_TOPICS: HistoryTopic[] = [
  {
    id: 'hist-1',
    title: 'Cậu Bé Thánh Gióng Đánh Giặc Ân',
    hero: 'Thánh Gióng (Phù Đổng Thiên Vương)',
    period: 'Thời vua Hùng Vương',
    summary: 'Cậu bé lên 3 không biết nói, bỗng vươn vai thành dũng sĩ cưỡi ngựa sắt, nhổ tre ngà đánh đuổi giặc bảo vệ quê hương.',
    storySnippet: 'Ngày xưa ở làng Gióng, có một cậu bé lên ba vẫn nằm im chẳng nói chẳng cười. Thế nhưng khi nghe tiếng sứ giả tìm người tài cứu nước, cậu bé bỗng cất tiếng: "Mẹ ơi, xin hãy mời sứ giả vào đây!". Cậu bé ăn bao nhiêu cơm cũng không no, thoắt cái đã lớn bổng thành một tráng sĩ phi thường...',
    moralLesson: 'Lòng yêu nước nồng nàn, tinh thần quả cảm và tình đoàn kết của nhân dân ta từ thuở nhỏ.',
    imageEmoji: '🐎⚡',
  },
  {
    id: 'hist-2',
    title: 'Hai Bà Trưng Cưỡi Voi Đánh Giặc',
    hero: 'Trưng Trắc & Trưng Nhị',
    period: 'Năm 40 sau Công Nguyên',
    summary: 'Hai nữ anh hùng kiên cường phất cờ khởi nghĩa, cưỡi voi ra trận giành lại giang sơn độc lập cho người Việt.',
    storySnippet: 'Hai chị em Trưng Trắc và Trưng Nhị là những cô gái tài ba, vừa giỏi võ vừa biết thương yêu trăm họ. Khi nước nhà bị xâm lăng, Hai Bà cưỡi trên lưng hai chú voi dũng mãnh, tiếng trống đồng vang rền khắp chốn non sông làm quân thù khiếp sợ...',
    moralLesson: 'Sự kiên cường, dũng cảm và niềm tự hào về truyền thống vẻ vang của phụ nữ Việt Nam.',
    imageEmoji: '🐘🛡️',
  },
  {
    id: 'hist-3',
    title: 'Sự Tích Bánh Chưng Bánh Dầy',
    hero: 'Chàng Hoàng Tử Lang Liêu',
    period: 'Thời Hùng Vương thứ 6',
    summary: 'Lang Liêu sáng tạo ra chiếc bánh Chưng vuông tượng trưng cho Đất và bánh Dầy tròn tượng trưng cho Trời từ hạt gạo bình dị.',
    storySnippet: 'Trong khi các anh trai đi tìm sơn hào hải vị xa xôi, chàng Lang Liêu chăm chỉ cày cấy hạt lúa trên nương đồng. Được thần nhân mách bảo trong giấc mơ: "Trong trời đất không gì quý bằng hạt gạo nuôi sống con người", chàng đã làm nên cặp bánh thơm lừng...',
    moralLesson: 'Biết quý trọng công sức lao động, hiếu thảo với cha mẹ và nâng niu hạt gạo ngọc ngà của đất trời.',
    imageEmoji: '🍃🌾',
  },
  {
    id: 'hist-4',
    title: 'Trần Hưng Đạo & Chiến Thắng Bạch Đằng Giang',
    hero: 'Đức Thánh Trần (Trần Quốc Tuấn)',
    period: 'Thời nhà Trần hào hùng',
    summary: 'Kế sách cọc gỗ Bạch Đằng đập tan đoàn thuyền giặc, giữ vững non sông Đại Việt.',
    storySnippet: 'Dưới sự lãnh đạo của tướng quân Trần Hưng Đạo, quân dân một lòng đoàn kết như người một nhà. Nhân lúc thủy triều lên xuống trên dòng sông Bạch Đằng lịch sử, đoàn thuyền giặc sa vào bãi cọc nhọn, mang lại nền thái bình cho muôn dân muôn đời...',
    moralLesson: 'Sức mạnh của trí tuệ, mưu trí và tinh thần "Vua tôi đồng lòng, anh em hòa thuận".',
    imageEmoji: '⛵🌊',
  },
];

export const DEFAULT_STORIES: StoryBookItem[] = [
  {
    id: 'story-1',
    title: 'Ăn Khế Trả Vàng',
    category: 'fairy_tale',
    author: 'Truyện cổ tích Việt Nam',
    coverEmoji: '⭐🕊️',
    summary: 'Chim phượng hoàng ăn khế ngọt và chở người em hiền lành ra đảo vàng, dạy bài học về tính trung thực và chia sẻ.',
    moralLesson: 'Ở hiền gặp lành, người tham lam ích kỷ sẽ không có kết cục tốt đẹp.',
    suggestedAge: '3-8 tuổi',
    isFavorite: true,
    dateAdded: '2026-10-20',
    content: `Ngày xưa, có hai anh em mồ côi cha mẹ. Người anh tham lam chiếm hết nhà cửa ruộng vườn, chỉ chia cho người em một túp lều rơm và một cây khế già ở góc vườn.

Người em không một lời oán thán, ngày ngày chăm chỉ tưới nước cho cây khế. Đến mùa, cây khế trĩu trịt những chùm quả vàng ươm, ngọt lịm. Bỗng một hôm, có một con chim phượng hoàng khổng lồ từ đâu bay đến, ngày ngày đáp xuống cành cây ăn quả khế chín mọng.

Người em thấy vậy liền buồn rầu nói với chim:
- "Chim ơi, nhà tôi nghèo chỉ có mỗi cây khế này để bán kiếm gạo. Chim ăn hết khế thì tôi lấy gì sinh sống?"

Con chim phượng hoàng cất giọng hiền từ trả lời:
- "Ăn một quả, trả một cục vàng, may túi ba gang, mang đi mà đựng!"

Hôm sau, chim đưa người em bay qua biển lớn đến một hòn đảo ngập tràn đá quý và vàng bạc. Người em chỉ nhặt vừa đủ túi ba gang rồi trở về, dùng vàng bạc giúp đỡ những người nghèo khổ trong làng.

Người anh biết chuyện, liền đổi hết gia tài lấy cây khế của em. Khi chim đến ăn và dặn may túi ba gang, người anh vì quá tham lam đã may chiếc túi khổng lồ mười hai gang. Trên đường bay qua biển lớn, vì túi vàng quá nặng, chim nghiêng cánh và người anh đã rơi tõm xuống biển sâu.`,
  },
  {
    id: 'story-2',
    title: 'Rùa và Thỏ Chạy Đua',
    category: 'fairy_tale',
    author: 'Ngụ ngôn Aesop',
    coverEmoji: '🐢🐇',
    summary: 'Chú thỏ nhanh nhẹn nhưng kiêu ngạo đã ngủ quên, trong khi chú rùa chậm rãi mà kiên trì đã về đích trước.',
    moralLesson: 'Kiên trì, nhẫn nại và không bao giờ kiêu căng khinh thường người khác.',
    suggestedAge: '3-6 tuổi',
    isFavorite: true,
    dateAdded: '2026-10-21',
    content: `Một buổi sáng đẹp trời trong khu rừng rực rỡ hoa cỏ, chú Thỏ trắng với đôi tai dài kiêu hãnh đang nhảy nhót khoe tài chạy nhanh của mình. Thấy bác Rùa đang cần mẫn từng bước chậm chạp trên đường mòn, Thỏ cười lớn:
- "Này bác Rùa ơi! Bác bò lề mề thế kia thì đến tối cũng chẳng qua được gốc cây sồi đâu! Có dám thi chạy với tôi một vòng quanh hồ không?"

Bác Rùa điềm đạm ngẩng đầu lên mỉm cười:
- "Được thôi bạn Thỏ, chúng ta cùng thi xem ai về đích trước nhé!"

Các bạn thú trong rừng như sóc con, chim gõ kiến, hươu sao đều reo hò cổ vũ. Khi tiếng còi hiệu xuất phát vang lên, Thỏ vọt nhanh như một mũi tên xé gió, chỉ trong chớp mắt đã bỏ xa Rùa hàng trăm bước chân.

Ngoái nhìn lại thấy Rùa còn cách một đoạn rất dài, Thỏ thầm nghĩ: "Còn lâu Rùa mới đuổi kịp ta! Dưới tán cây râm mát này nằm ngủ một giấc thật ngon, lúc nào Rùa đến gần ta chạy vèo một cái là thắng ngay thôi mà!". Nghĩ rồi, Thỏ nằm lim dim dưới bóng cây xanh mát và ngủ say lúc nào không hay.

Trong khi đó, bác Rùa dù mồ hôi ướt đẫm trán, vẫn kiên trì từng bước một, không hề dừng lại hay nản lòng. Từng bước... từng bước... Rùa vượt qua bóng cây nơi Thỏ đang ngủ say sưa.

Khi ánh hoàng hôn buông xuống, tiếng reo hò "Hoan hô bác Rùa dũng cảm!" vang dội khắp khu rừng làm Thỏ bừng tỉnh giấc. Thỏ hớt hải phóng thục mạng về đích, nhưng đã muộn rồi! Bác Rùa kiên trì đã ung dung chạm vạch đích từ lúc nào. Thỏ cúi gầm mặt hổ thẹn và từ đó không bao giờ dám kiêu ngạo nữa.`,
  },
  {
    id: 'story-3',
    title: 'Ba Chú Heo Con Xây Nhà',
    category: 'bedtime',
    author: 'Truyện đồng thoại thế giới',
    coverEmoji: '🐷🏠',
    summary: 'Ba chú heo con xây nhà bằng rơm, gỗ và gạch. Ngôi nhà gạch kiên cố đã giúp cả ba chú heo đánh bại chó sói hung ác.',
    moralLesson: 'Làm việc chăm chỉ, chu đáo và cẩn thận sẽ mang lại sự an toàn và thành công.',
    suggestedAge: '3-7 tuổi',
    isFavorite: false,
    dateAdded: '2026-10-21',
    content: `Ngày xửa ngày xưa, có ba chú heo con đáng yêu quyết định tự xây cho mình những ngôi nhà riêng để bắt đầu cuộc sống tự lập.

Chú heo anh cả lười biếng chỉ muốn nhanh được đi chơi, nên chọn những cọng rơm vàng óng để dựng ngôi nhà rơm chỉ trong vài tiếng đồng hồ. Chú vừa hát vang vừa chạy ra đồng cỏ nhảy nhót.

Chú heo thứ hai thích chơi đàn hơn là làm việc cực nhọc, nên gom những cành cây khô lại đóng thành ngôi nhà gỗ ọp ẹp trong nửa ngày rồi cũng chạy tót đi chơi.

Riêng chú heo út chăm chỉ và thông minh hiểu rằng trong rừng có chó sói rình rập, nên đã nhẫn nại khuân từng viên gạch đỏ, trộn hồ xi măng thật chắc chắn. Dù hai anh trêu chọc là tốn công vô ích, heo út vẫn cần mẫn xây từng bức tường kiên cố, có cả ống khói ấm cúng.

Ít lâu sau, một con chó sói gian ác mò đến. Sói gầm rú trước nhà rơm của heo anh cả:
- "Mau mở cửa ra, nếu không ta sẽ thổi bay ngôi nhà này!"
Sói hít một hơi thật sâu rồi thổi "Phùùù!", ngôi nhà rơm lập tức bay tung tóe. Heo anh cả hoảng sợ chạy thục mạng sang nhà gỗ của heo thứ hai.

Sói đuổi theo đến nơi, lại gầm lên và thổi "Phù... phù... phù!", ngôi nhà gỗ rung lắc dữ dội rồi sụp đổ hoàn toàn. Cả hai chú heo ôm đầu chạy thục mạng sang nhà gạch của heo út.

Heo út nhanh nhẹn khóa chặt cửa gỗ lim. Sói hung hãn chạy đến, dốc hết sức bình sinh thổi đến tím tái cả mặt mày, nhưng ngôi nhà gạch vững chãi vẫn trơ trơ không hề lay chuyển một viên ngói. Sói tức tối trèo lên mái nhà định chui qua ống khói để vào trong.

Nhưng chú heo út thông minh đã kịp thời đặt một nồi nước sôi sùng sục dưới đáy lò sưởi. Sói vừa tuột chân xuống ống khói liền bị bỏng đuôi, kêu la "Á á gâu gâu!" rồi ôm đuôi chạy biến vào rừng sâu không bao giờ dám quay trở lại. Ba chú heo ôm chầm lấy nhau nhảy múa vui sướng!`,
  },
  {
    id: 'story-4',
    title: 'Chú Bé Thông Minh Giải Đố Vua',
    category: 'science',
    author: 'Truyện dân gian Việt Nam',
    coverEmoji: '👑🧠',
    summary: 'Cậu bé làng quê nghèo dùng trí thông minh lém lỉnh giải những câu đố hóc búa của nhà vua và sứ thần nước láng giềng.',
    moralLesson: 'Trí thông minh, ham học hỏi và sự bình tĩnh sẽ giúp ta giải quyết mọi bài toán khó khăn trong cuộc sống.',
    suggestedAge: '5-10 tuổi',
    isFavorite: false,
    dateAdded: '2026-10-22',
    content: `Ngày xưa có một vị vua anh minh muốn tìm người tài giỏi giúp nước, bèn sai quan đi khắp chốn ra những câu đố hóc búa. Một hôm, quan thấy hai cha con đang cày ruộng bên đường, liền dừng ngựa hỏi:
- "Này bác nông phu! Trâu của bác cày một ngày được mấy đường?"

Người cha lúng túng chưa biết trả lời sao thì cậu bé chừng bảy tuổi đã lễ phép ngẩng lên hỏi ngược lại quan:
- "Dạ thưa quan, nếu ngài nói được ngựa của ngài đi một ngày được mấy bước, thì cha con cháu sẽ trả lời ngay trâu cày được mấy đường ạ!"

Viên quan sững sờ trước sự nhanh trí của đứa trẻ, liền quay về tâu lên vua. Nhà vua thử tài tiếp bằng cách ban cho làng cậu bé ba thúng gạo nếp và ba con trâu đực, truyền lệnh phải nuôi sao cho trâu đẻ thành chín con, nếu không cả làng sẽ bị phạt tội.

Cả làng hoang mang lo sợ vì trâu đực làm sao đẻ con được! Cậu bé liền an ủi dân làng mổ trâu nấu xôi ăn mừng, rồi dẫn cha lên kinh thành diện kiến vua. Đến sân rồng, cậu bé khóc nức nở. Vua hỏi nguyên do, cậu tâu:
- "Muôn tâu bệ hạ, mẹ con mất sớm, con xin cha sinh cho con một đứa em để chơi cùng mà cha không chịu sinh, nên con buồn tủi quá ạ!"

Vua bật cười ha hả:
- "Cha ngươi là đàn ông thì làm sao sinh con được mà ngươi đòi?"

Cậu bé liền nhanh nhẹn quỳ lạy tâu:
- "Dạ bệ hạ đã dạy thế, vậy cớ sao bệ hạ lại truyền cho làng con nuôi trâu đực đẻ con ạ?"

Vua khen ngợi hết lời và ban thưởng xứng đáng. Về sau, khi sứ thần phương Bắc đem sang một chiếc vỏ ốc xoắn ruột để thách xâu một sợi chỉ xuyên qua, cậu bé đã hát một bài ca dao chỉ cách bôi mỡ vào đầu sợi chỉ buộc vào lưng con kiến, kiến sẽ tự lần theo ruột ốc bò sang đầu bên kia. Nhờ thế, thể diện quốc gia được giữ vững và cậu bé được phong làm Trạng nguyên nhỏ tuổi nhất nước Nam.`,
  },
];
