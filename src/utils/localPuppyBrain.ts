import { ChildProfile, StoryBookItem, EnglishWord, MusicTrack, PuppyMood } from '../types';

export interface PuppyBrainResponse {
  reply: string;
  emotion: PuppyMood;
  wantsMusic?: boolean;
  englishWord?: string;
  englishPhonetic?: string;
  vietnameseMeaning?: string;
  gentleCoachTip?: string;
}

export function processPuppySpeechOffline(
  spokenText: string,
  profile: ChildProfile,
  stories: StoryBookItem[] = [],
  words: EnglishWord[] = [],
  musicTracks: MusicTrack[] = []
): PuppyBrainResponse {
  const text = spokenText.toLowerCase().trim();
  const childName = profile.name || 'Bé';
  const puppyName = profile.puppyName || 'Cún Bông';

  // 1. Music requests
  if (
    text.includes('mở nhạc') ||
    text.includes('hát đi') ||
    text.includes('bật nhạc') ||
    text.includes('nghe nhạc') ||
    text.includes('hát bài') ||
    text.includes('nhạc thiếu nhi') ||
    text.includes('mở bài hát')
  ) {
    const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];
    const title = randomTrack ? `"${randomTrack.title}"` : 'thiếu nhi thật vui';
    return {
      reply: `Gâu gâu! Cún mở bài hát ${title} thật rộn ràng cho bé nghe ngay đây! Chúng mình cùng lắc lư nhảy múa nhé! 🎵`,
      emotion: 'grooving',
      wantsMusic: true,
    };
  }

  // 2. Story requests
  if (
    text.includes('kể chuyện') ||
    text.includes('đọc truyện') ||
    text.includes('truyện cổ tích') ||
    text.includes('kể cổ tích') ||
    text.includes('đọc sách')
  ) {
    if (stories.length > 0) {
      const story = stories[Math.floor(Math.random() * stories.length)];
      const preview = story.content.slice(0, 150).replace(/\n/g, ' ');
      return {
        reply: `Gâu gâu! Cún kể cho bé nghe chuyện "${story.title}" nhé! ${preview}... Bé thấy câu chuyện có hấp dẫn không nào?`,
        emotion: 'happy',
      };
    }
    return {
      reply: `Gâu gâu! Ngày xửa ngày xưa, trong một khu rừng xanh ngát có bạn cún nhỏ và bé ${childName} cùng chơi đùa thật vui vẻ, luôn yêu thương giúp đỡ nhau!`,
      emotion: 'happy',
    };
  }

  // 3. English practice requests
  if (
    text.includes('học tiếng anh') ||
    text.includes('dạy tiếng anh') ||
    text.includes('từ vựng') ||
    text.includes('tiếng anh')
  ) {
    const wordObj = words[Math.floor(Math.random() * words.length)] || {
      word: 'Apple',
      phonetic: '/ˈæp.əl/ - đọc là: ép-pồ',
      vietnamese: 'Quả táo',
      gentleCoachingNotes: 'Bé mím môi nhẹ rồi mở to miệng đọc ép-pồ nhé!',
    };
    return {
      reply: `Gâu gâu! Chúng mình cùng học tiếng Anh nhé! Từ hôm nay là "${wordObj.word}" nghĩa là ${wordObj.vietnamese}! Bé đọc to theo cún nào: ${wordObj.word}!`,
      emotion: 'happy',
      englishWord: wordObj.word,
      englishPhonetic: wordObj.phonetic,
      vietnameseMeaning: wordObj.vietnamese,
      gentleCoachTip: wordObj.gentleCoachingNotes,
    };
  }

  // 4. Greetings
  if (
    text.includes('chào cún') ||
    text.includes('chào bạn') ||
    text.includes('hello') ||
    text.includes('hi cún') ||
    text.includes('cún ơi') ||
    text === 'ơi' ||
    text.startsWith('chào')
  ) {
    const greetings = [
      `Gâu gâu! Cún chào bé ${childName} yêu quý! Cún đang lắng nghe bé nói thật rõ đây này! Hôm nay bé có chuyện gì vui kể cún nghe nào!`,
      `Chào bạn nhỏ ${childName} tài ba của cún! Cún nhớ bé cả ngày luôn đó! Chúng mình cùng trò chuyện và chơi đùa nhé!`,
      `Gâu gâu! ${puppyName} có mặt đây rồi nè! Bé gọi cún có chuyện gì vui thế, cún hào hứng quá đi mất!`,
    ];
    return {
      reply: greetings[Math.floor(Math.random() * greetings.length)],
      emotion: 'waving',
    };
  }

  // 5. Name questions
  if (text.includes('tên là gì') || text.includes('bạn tên gì') || text.includes('cún tên gì')) {
    return {
      reply: `Gâu gâu! Tớ là ${puppyName} đây! Tớ là bạn cún thông minh, trung thành và yêu quý bé ${childName} nhất trên đời luôn đó!`,
      emotion: 'happy',
    };
  }

  // 6. Child introducing name
  if (text.includes('tên là') || text.includes('con tên') || text.includes('bé tên')) {
    return {
      reply: `Oa, tên của bé nghe ngọt ngào và đáng yêu quá đi thôi! Cún khắc sâu tên bé vào trái tim cún rồi nhé!`,
      emotion: 'happy',
    };
  }

  // 7. Eating / Hunger
  if (
    text.includes('ăn gì') ||
    text.includes('đói không') ||
    text.includes('ăn cơm chưa') ||
    text.includes('thích ăn gì')
  ) {
    return {
      reply: `Gâu gâu! Cún thích gặm khúc xương đồ chơi giòn tan và ăn bánh quy cún, nhưng món ăn tinh thần cún thích nhất là được trò chuyện cùng bé ${childName} đó! Bé đã ăn ngoan uống sữa chưa nào?`,
      emotion: 'laughing',
    };
  }

  // 8. Age
  if (text.includes('mấy tuổi') || text.includes('bao nhiêu tuổi')) {
    return {
      reply: `Cún vẫn còn là một chú cún con nhỏ xíu ${profile.age || 5} tuổi như bé ${childName} nè! Hai đứa mình bằng tuổi nhau, cùng lớn lên bên nhau nhé!`,
      emotion: 'dancing',
    };
  }

  // 9. Love / Petting / Compliment
  if (
    text.includes('yêu cún') ||
    text.includes('thương cún') ||
    text.includes('đáng yêu') ||
    text.includes('cún ngoan') ||
    text.includes('cún đẹp')
  ) {
    return {
      reply: `Gâu gâu! Cún cũng yêu thương bé ${childName} nhiều như biển rộng trời cao luôn! Được bé khen làm cún vui sướng lắc lư tít mù rồi nè! 🥰`,
      emotion: 'laughing',
    };
  }

  // 10. Barking / Tricks
  if (text.includes('sủa đi') || text.includes('kêu đi') || text.includes('gâu gâu')) {
    return {
      reply: `Gâu gâu gâu! 🐾 Cún sủa vang mừng rỡ chào bé nè! Bé thấy cún sủa có dũng cảm và đáng yêu không nào?`,
      emotion: 'excited',
    };
  }

  // 11. Play ball / Games
  if (text.includes('chơi bóng') || text.includes('chơi đùa') || text.includes('chơi đi') || text.includes('đá bóng')) {
    return {
      reply: `Hoan hô! Cún thích chơi bóng nhất trần đời! Bé nhìn xem cún tâng quả bóng rực rỡ bổng lên trời cao nè! Vui ơi là vui!`,
      emotion: 'playing_ball',
    };
  }

  // 12. Sadness / Comforting
  if (
    text.includes('buồn') ||
    text.includes('khóc') ||
    text.includes('mệt') ||
    text.includes('không vui') ||
    text.includes('sợ')
  ) {
    return {
      reply: `Thương bé ${childName} quá à! Đừng buồn nữa nhé, có cún ở đây luôn luôn bên cạnh bảo vệ và yêu thương bé nè! Cún vẫy tai làm trò xiếc cho bé cười tươi nha!`,
      emotion: 'happy',
    };
  }

  // 13. Good accomplishments
  if (
    text.includes('điểm mười') ||
    text.includes('phiếu bé ngoan') ||
    text.includes('khen') ||
    text.includes('vẽ tranh') ||
    text.includes('được thưởng')
  ) {
    return {
      reply: `Oa, hoan hô bé ${childName}! Bé của cún tài giỏi và xuất sắc quá đi mất! Cún vẫy chân vẫy đuôi chúc mừng bé nè! Bé xứng đáng nhận 100 ngôi sao sáng rực rỡ!`,
      emotion: 'dancing',
    };
  }

  // 14. Bedtime / Good night
  if (
    text.includes('đi ngủ') ||
    text.includes('ngủ ngon') ||
    text.includes('buồn ngủ') ||
    text.includes('chúc ngủ ngon')
  ) {
    return {
      reply: `Gâu gâu! Chúc bé ${childName} yêu quý ngủ thật ngon, đắp chăn ấm và có những giấc mơ thần tiên bay vào xứ sở diệu kỳ nhé! Cún nằm ngoan canh giấc ngủ cho bé nè! Zzz... 💤`,
      emotion: 'sleeping',
    };
  }

  // 15. Smart contextual reflection (Extract topic and reply meaningfully)
  // Clean up common prefixes
  const cleanSnippet = text
    .replace(/^(hôm nay|con|bé|mẹ|ba|bố|cún|bạn)\s+/gi, '')
    .trim();

  const answers = [
    `Gâu gâu! Cún nghe bé ${childName} nói về "${cleanSnippet || text}" rồi nè! Hay quá, bé kể thêm chi tiết cho cún nghe nữa đi!`,
    `A, điều bé vừa kể thú vị ghê! Cún thích nghe giọng nói ngọt ngào của bé ${childName} lắm luôn!`,
    `Gâu gâu! Cún hiểu ý bé rồi nè! Bé của cún thông minh và nói chuyện đáng yêu nhất quả đất luôn!`,
    `Hi hi, nghe bé nói chuyện mà cún thấy vui ngập tràn trong lòng luôn! Bé muốn chúng mình cùng làm gì tiếp theo nào?`,
  ];

  return {
    reply: answers[Math.floor(Math.random() * answers.length)],
    emotion: 'happy',
  };
}
