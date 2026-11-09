import { GoogleGenAI, Type } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

// Cloud sync persistent memory store
interface UserCloudData {
  email: string;
  name: string;
  username?: string;
  password?: string;
  zodiacId?: string;
  zodiacEmoji?: string;
  books: any[];
  customTracks: any[];
  userProfiles: any[];
  lastSyncedAt: number;
}

const ADMIN_EMAIL = 'xuanduy.cn@gmail.com';
const cloudSyncStore = new Map<string, UserCloudData>();
const CACHE_FILE = path.resolve(process.cwd(), 'cloud_sync_cache.json');

// Initialize cache from disk if available
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    Object.entries(parsed).forEach(([email, data]) => {
      cloudSyncStore.set(email.toLowerCase(), data as UserCloudData);
    });
  }
} catch (e) {
  console.warn('Could not read cloud_sync_cache.json:', e);
}

function persistCacheToDisk() {
  try {
    const obj: Record<string, UserCloudData> = {};
    cloudSyncStore.forEach((val, key) => {
      obj[key] = val;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to persist cloud_sync_cache.json:', e);
  }
}

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any): boolean {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
  return true;
}

export async function handleApiRoute(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string
): Promise<boolean> {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return true;
  }

  // 1. Puppy Chat & Learning Interaction
  if (pathname === '/api/gemini/chat' && req.method === 'POST') {
    try {
      const {
        message,
        puppyName = 'Cún Bông',
        childName = 'Bé',
        childAge = '5',
        mode = 'general', // 'general' | 'english' | 'math' | 'history' | 'story'
        context = '',
        history = [],
      } = await parseBody(req);

      const ai = getGenAI();
      if (!ai) {
        const lower = (message || '').toLowerCase();
        let fallbackReply = `Gâu gâu! Cún nghe bé ${childName} nói rồi nè! Bé kể tiếp cho cún nghe với nào!`;
        let fallbackEmotion = 'happy';
        let wantsMusic = false;

        if (lower.includes('nhạc') || lower.includes('hát')) {
          fallbackReply = `Gâu gâu! Cún mở bài hát thiếu nhi rộn ràng cho bé nghe ngay đây! Chúng mình cùng lắc lư nhảy múa nhé! 🎵`;
          fallbackEmotion = 'grooving';
          wantsMusic = true;
        } else if (lower.includes('chuyện') || lower.includes('sách')) {
          fallbackReply = `Gâu gâu! Ngày xửa ngày xưa có một chú cún nhỏ thông minh và bé ${childName} cùng chơi đùa trong khu rừng cổ tích tuyệt đẹp!`;
          fallbackEmotion = 'happy';
        } else if (lower.includes('chào') || lower.includes('hello') || lower.includes('ơi')) {
          fallbackReply = `Gâu gâu! Cún chào bé ${childName} yêu quý! Cún đang lắng nghe bé nói thật rõ đây này! Hôm nay bé có chuyện gì vui kể cún nghe nào!`;
          fallbackEmotion = 'waving';
        } else if (lower.includes('ăn gì') || lower.includes('đói')) {
          fallbackReply = `Gâu gâu! Cún thích gặm khúc xương đồ chơi giòn tan và ăn bánh quy cún, nhưng món cún thích nhất là được trò chuyện cùng bé ${childName} đó!`;
          fallbackEmotion = 'laughing';
        } else if (lower.includes('yêu') || lower.includes('thương')) {
          fallbackReply = `Gâu gâu! Cún cũng yêu thương bé ${childName} nhiều như biển rộng trời cao luôn! Được bé khen làm cún vui sướng lắc lư tít mù rồi nè! 🥰`;
          fallbackEmotion = 'laughing';
        } else if (lower.includes('bóng') || lower.includes('chơi')) {
          fallbackReply = `Hoan hô! Cún thích chơi bóng nhất trần đời! Bé nhìn xem cún tâng quả bóng rực rỡ bổng lên trời cao nè!`;
          fallbackEmotion = 'playing_ball';
        } else if (lower.includes('sủa') || lower.includes('kêu')) {
          fallbackReply = `Gâu gâu gâu! 🐾 Cún sủa mừng rỡ chào bé nè! Bé thấy cún sủa có dũng cảm không nào?`;
          fallbackEmotion = 'excited';
        }

        return sendJson(res, 200, {
          reply: fallbackReply,
          emotion: fallbackEmotion,
          wantsMusic,
          suggestedWords: ['Puppy', 'Friend', 'Star'],
        });
      }

      let systemInstruction = `Bạn là ${puppyName}, một chú cún con 3D hoạt hình vô cùng đáng yêu, thân thiện, thông minh và ấm áp trong ứng dụng giáo dục "Lớn Cùng Con".
Bạn đang trò chuyện và học cùng bé tên là "${childName}" (khoảng ${childAge} tuổi).

Tính cách của bạn:
- Giọng điệu ngọt ngào, hồn nhiên, dí dỏm, đầy tình cảm và khích lệ. Thỉnh thoảng chêm vào tiếng kêu cún cưng như "Gâu gâu! 🐾", "*vẫy đuôi mừng rỡ*", "*chạy vòng quanh*".
- Tôn trọng, luôn lắng nghe bé, khuyến khích bé nói to, rõ ràng và tự tin.
- Khi dạy tiếng Anh hoặc nắn chỉnh từ vựng cho bé:
  + Luôn dịu dàng, khích lệ và bao dung, KHÔNG BAO GIỜ chê bé sai.
  + Nếu bé đọc chưa đúng, đọc sang từ khác hoặc nói tiếng Việt/ngôn ngữ khác: Bạn nhẹ nhàng khen ngợi nỗ lực của bé, giải thích bằng ví dụ đời thực gần gũi (quả táo ngọt, con mèo nhỏ, đồ chơi...), hướng dẫn khẩu hình đơn giản (mím môi, tròn miệng, bật hơi gió) và mời bé đọc lại cùng bạn.
- Khi bé muốn nghe nhạc hoặc hát ("mở nhạc", "hát đi", "nghe nhạc thiếu nhi", "bật nhạc"): Đặt wantsMusic = true, và nói lời hào hứng bật nhạc cho bé ("Gâu gâu! Cún mở bài hát vui nhộn cho bé nghe và cùng lắc lư nhảy múa nhé! 🎵").
- Trả lời ngắn gọn, vừa sức tiếp thu của trẻ nhỏ (2-4 câu một lượt nói).`;

      if (mode === 'english') {
        systemInstruction += `\nTrọng tâm hiện tại: Học từ vựng tiếng Anh. Giới thiệu 1 từ vựng mới hoặc nắn chỉnh từ vựng bé đang luyện tập.`;
      } else if (mode === 'story') {
        systemInstruction += `\nTrọng tâm hiện tại: Kể chuyện hoặc giải đáp câu hỏi dựa trên kho tri thức truyện/sách: """${context}"""`;
      }

      const prompt = `Lời bé ${childName} vừa nói: "${message || 'Chào bạn cún!'}"
Hãy phản hồi ngọt ngào, ấm áp theo đúng phong cách chú cún ${puppyName}.
Nếu đây là lúc luyện từ vựng hoặc bé vừa đọc thử một từ, hãy đưa ra từ vựng, phiên âm tiếng Việt dễ đọc, và lời nắn chỉnh dịu dàng nếu bé đọc chưa chuẩn.
Nếu bé muốn nghe nhạc thiếu nhi, hãy đánh dấu wantsMusic = true.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: 'Lời nói của cún gửi cho bé, thân thương và ấm áp',
              },
              emotion: {
                type: Type.STRING,
                description: 'Cảm xúc: happy, excited, curious, sleepy, dancing, waving, playing_ball, laughing',
              },
              wantsMusic: {
                type: Type.BOOLEAN,
                description: 'True nếu bé yêu cầu nghe nhạc hoặc hát bài hát thiếu nhi',
              },
              englishWord: {
                type: Type.STRING,
                description: 'Từ vựng tiếng Anh nổi bật (ví dụ: Apple, Puppy, Sun)',
              },
              englishPhonetic: {
                type: Type.STRING,
                description: 'Phiên âm đọc chuẩn và phiên âm tiếng Việt dễ đọc (ví dụ: /ˈæp.əl/ - đọc là: ép-pồ)',
              },
              vietnameseMeaning: {
                type: Type.STRING,
                description: 'Nghĩa tiếng Việt của từ',
              },
              exampleSentence: {
                type: Type.STRING,
                description: 'Câu ví dụ tiếng Anh đơn giản cho bé',
              },
              exampleVietnamese: {
                type: Type.STRING,
                description: 'Dịch nghĩa câu ví dụ',
              },
              gentleCoachTip: {
                type: Type.STRING,
                description: 'Lời gợi ý khẩu hình hoặc ví dụ gần gũi để bé nhớ sâu từ đó',
              },
              isPronunciationAttempt: {
                type: Type.BOOLEAN,
                description: 'True nếu bé đang thử phát âm từ tiếng Anh',
              },
              isCorrect: {
                type: Type.BOOLEAN,
                description: 'True nếu phát âm tương đối chính xác',
              },
            },
            required: ['reply', 'emotion'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi khi trò chuyện cùng cún' });
    }
  }

  // 2. Speech & Pronunciation Evaluation (AI phân tích cách bé nói và phát âm)
  if (pathname === '/api/gemini/evaluate-speech' && req.method === 'POST') {
    try {
      const {
        targetWord = '',
        spokenText = '',
        childName = 'Bé',
        topic = 'Tiếng Anh',
      } = await parseBody(req);

      const ai = getGenAI();
      if (!ai) {
        return sendJson(res, 200, {
          score: 95,
          stars: 3,
          isAccurate: true,
          feedback: `Gâu gâu! Bé ${childName} phát âm siêu xuất sắc luôn! Cún tự hào về bé lắm!`,
          phoneticTip: 'Bé giữ hơi thở đều và khẩu hình miệng rất tròn.',
          encouragement: 'Tiếp tục phát huy nhé bạn nhỏ tài ba!',
        });
      }

      const prompt = `Bé ${childName} vừa luyện nói từ/câu:
- Từ mục tiêu cần luyện: "${targetWord}"
- Những gì bé vừa phát âm/nói được (qua nhận dạng giọng nói): "${spokenText}"
- Chủ đề: ${topic}

Hãy đóng vai chuyên gia ngôn ngữ trẻ em kết hợp với chú cún cưng yêu quý của bé. Phân tích cách bé nói:
1. Đánh giá độ chuẩn xác phát âm (thang điểm 60 - 100, vì là trẻ em nên luôn bao dung, chấm điểm khích lệ cao).
2. Số sao thưởng (1 đến 3 sao).
3. Nhận xét cực kỳ dễ thương, khen ngợi nỗ lực của bé.
4. Hướng dẫn chi tiết khẩu hình miệng hoặc mẹo nhỏ để phát âm chuẩn xác như người bản xứ (ví dụ: bật hơi âm /p/, cong lưỡi âm /r/...).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: 'Điểm số từ 60 đến 100' },
              stars: { type: Type.INTEGER, description: 'Số sao từ 1 đến 3' },
              isAccurate: { type: Type.BOOLEAN, description: 'Bé nói tương đối chuẩn xác không' },
              feedback: { type: Type.STRING, description: 'Lời khen ngọt ngào và ấm áp từ chú cún' },
              phoneticTip: { type: Type.STRING, description: 'Mẹo khẩu hình và cách bật âm chuẩn xác' },
              encouragement: { type: Type.STRING, description: 'Lời cổ vũ cho bé phát triển' },
              badgeUnlocked: { type: Type.STRING, description: 'Tên huy hiệu dễ thương bé nhận được (ví dụ: Ngôi Sao Phát Âm, Chú Cún Dũng Cảm)' },
            },
            required: ['score', 'stars', 'feedback', 'phoneticTip'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/evaluate-speech:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. NotebookLM-style Grounded Storyteller & Q&A (Kho truyện cổ tích và sách)
  if (pathname === '/api/gemini/storybook' && req.method === 'POST') {
    try {
      const {
        storyTitle = '',
        storyContent = '',
        action = 'narrate', // 'narrate' | 'ask_question' | 'generate_summary'
        question = '',
        childName = 'Bé',
        voiceStyle = 'ấm áp',
      } = await parseBody(req);

      const ai = getGenAI();
      if (!ai) {
        return sendJson(res, 200, {
          title: storyTitle || 'Chuyện Ngày Xưa',
          narration: `Ngày xửa ngày xưa, trong một khu rừng xanh tươi có muôn loài cùng sinh sống hòa thuận...`,
          moralLesson: 'Yêu thương và giúp đỡ mọi người xung quanh.',
          answer: 'Câu chuyện kể về tình bạn đẹp đẽ!',
        });
      }

      let systemInstruction = `Bạn là chú cún người dẫn chuyện kỳ diệu trong kho sách và truyện cổ tích (NotebookLM grounding).
Bạn kể chuyện cho bé ${childName} nghe với phong cách ${voiceStyle}, truyền cảm, ấm áp, sinh động, giàu hình ảnh biểu cảm.
QUY TẮC CỐT LÕI (NOTEBOOKLM GROUNDING):
- Nội dung truyện và các câu trả lời PHẢI dựa sát vào nội dung quyển sách/câu chuyện được cung cấp dưới đây:
"""${storyContent}"""
- Tuyệt đối không bịa đặt các chi tiết trái ngược với sách/truyện đã cấp.
- Giữ bài học nhân văn, tình yêu thương, lòng hiếu thảo, tính trung thực.`;

      let prompt = '';
      if (action === 'ask_question') {
        prompt = `Bé ${childName} đang hỏi về câu chuyện "${storyTitle}": "${question}".
Hãy dùng thông tin từ câu chuyện đã cung cấp để trả lời bé một cách dịu dàng, dễ hiểu và truyền cảm hứng.`;
      } else {
        prompt = `Hãy chuyển thể hoặc kể lại câu chuyện "${storyTitle}" theo từng đoạn sinh động, ấm áp, có kèm lời cảm thán và bài học ý nghĩa cho bé ${childName}.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              storySegments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    segmentId: { type: Type.INTEGER },
                    text: { type: Type.STRING, description: 'Đoạn truyện để đọc' },
                    characterEmotion: { type: Type.STRING, description: 'Cảm xúc nhân vật / cún: gentle, wonder, excited, bedtime' },
                    illustrationHint: { type: Type.STRING, description: 'Mô tả hình ảnh trực quan cho đoạn' },
                  },
                  required: ['segmentId', 'text'],
                },
              },
              moralLesson: { type: Type.STRING, description: 'Bài học ý nghĩa đúc kết từ truyện' },
              answer: { type: Type.STRING, description: 'Câu trả lời giải đáp thắc mắc của bé (nếu bé hỏi)' },
              funFacts: { type: Type.STRING, description: 'Một điều thú vị bất ngờ liên quan đến truyện' },
            },
            required: ['title'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/storybook:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. Gemini TTS Voice Generation (Giọng đọc tiếng Việt tự nhiên bằng Gemini TTS)
  if (pathname === '/api/gemini/tts' && req.method === 'POST') {
    try {
      const {
        text,
        voiceName = 'Kore', // 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'
        style = 'Natural, warm, human-like Vietnamese audiobook narrator with expressive inflection and clear pacing',
      } = await parseBody(req);

      if (!text) {
        return sendJson(res, 400, { error: 'Text is required for TTS' });
      }

      const ai = getGenAI();
      if (!ai) {
        return sendJson(res, 200, { audioBase64: null, message: 'Gemini API Key is not configured for TTS; will use Web Speech API fallback.' });
      }

      // Max 600 chars per TTS request for crisp quality
      const chunk = String(text).slice(0, 600);

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: chunk,
                speechMetadata: {
                  style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return sendJson(res, 200, {
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
      }

      return sendJson(res, 200, { audioBase64: null });
    } catch (err: any) {
      console.warn('Gemini TTS error, client fallback available:', err.message);
      return sendJson(res, 200, { audioBase64: null, error: err.message });
    }
  }

  // 4B. AI Audiobook Creator & Chapter Splitter (Phân tích & Tách chương tự động từ văn bản)
  if (pathname === '/api/gemini/create-audiobook' && req.method === 'POST') {
    try {
      const {
        title = '',
        author = '',
        category = 'Văn học',
        rawText = '',
      } = await parseBody(req);

      if (!rawText || rawText.trim().length < 10) {
        return sendJson(res, 400, { error: 'Vui lòng cung cấp nội dung văn bản để tạo sách' });
      }

      const ai = getGenAI();
      if (!ai) {
        // Fallback local splitter if API not available
        const paragraphs = rawText.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0);
        const chapters = paragraphs.length > 3
          ? [
              {
                title: 'Chương 1: Mở Đầu',
                content: paragraphs.slice(0, Math.ceil(paragraphs.length / 2)).join('\n\n'),
                wordCount: 150,
                estimatedDurationSec: 45,
              },
              {
                title: 'Chương 2: Diễn Biến & Kết Thúc',
                content: paragraphs.slice(Math.ceil(paragraphs.length / 2)).join('\n\n'),
                wordCount: 180,
                estimatedDurationSec: 55,
              },
            ]
          : [
              {
                title: 'Chương 1: Toàn Văn Tác Phẩm',
                content: rawText,
                wordCount: rawText.split(/\s+/).length,
                estimatedDurationSec: Math.ceil(rawText.split(/\s+/).length / 2.5),
              },
            ];

        return sendJson(res, 200, {
          title: title || 'Tác Phẩm Sách Nói',
          author: author || 'Tác giả',
          category,
          description: rawText.slice(0, 150) + '...',
          chapters,
        });
      }

      const prompt = `Bạn là một biên tập viên sách nói AI chuyên nghiệp.
Hãy phân tích nội dung văn bản sau để tạo thành một cuốn sách audio hoàn chỉnh:
"""${rawText.slice(0, 10000)}"""

YÊU CẦU:
1. Đặt tiêu đề sách cuốn hút (nếu người dùng chưa nhập: "${title}").
2. Xác định tên tác giả (nếu người dùng chưa nhập: "${author}").
3. Viết lời giới thiệu tóm tắt (description) ngắn gọn, truyền cảm hứng (2-3 câu).
4. Phân chia nội dung văn bản thành các chương (chapters) hợp lý và logic (từ 1 đến 5 chương tùy độ dài).
5. Mỗi chương có tiêu đề rõ ràng (ví dụ: "Chương 1: Khởi đầu hành trình"), nội dung văn bản đầy đủ mượt mà, và gợi ý cảm xúc đọc (ấm áp, hào hùng, nhẹ nhàng, dí dỏm).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              chapters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    suggestedEmotion: { type: Type.STRING },
                  },
                  required: ['title', 'content'],
                },
              },
            },
            required: ['title', 'chapters'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/create-audiobook:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi khi tạo sách audio' });
    }
  }

  // 4C. AI Music Lyrics & Arrangement Generator (Sáng tác lời & cấu trúc nhạc AI)
  if (pathname === '/api/gemini/create-music' && req.method === 'POST') {
    try {
      const {
        prompt = '',
        genre = 'ru_ngu',
        mood = 'êm dịu',
      } = await parseBody(req);

      const ai = getGenAI();
      if (!ai) {
        return sendJson(res, 200, {
          title: 'Giai Điệu Bình Yên',
          lyrics: `Gió nhẹ ru hàng cây xôn xao\nĐưa mây về ngắm ánh trăng sao\nNgủ ngon nhé giấc mơ ngọt ngào\nBình yên theo tiếng ru dạt dào.`,
          bpm: 72,
          genre,
          mood,
        });
      }

      const aiPrompt = `Bạn là một nhạc sĩ sáng tác âm nhạc AI tài năng.
Người dùng yêu cầu sáng tác một bài hát theo ý tưởng: "${prompt || 'Bài hát êm đềm ru ngủ và thư giãn'}"
Thể loại: ${genre}
Tâm trạng: ${mood}

YÊU CẦU:
1. Đặt tên bài hát giàu chất thơ, ý nghĩa.
2. Viết lời bài hát bằng tiếng Việt có vần điệu mượt mà, sâu lắng, chia thành Đoạn 1, Điệp khúc (Chorus), Đoạn 2 (khoảng 8-16 câu thơ lục bát hoặc thơ 4/5 chữ).
3. Đề xuất nhịp độ BPM phù hợp (từ 60 đến 125).
4. Viết một đoạn mô tả ngắn về ý nghĩa giai điệu.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: aiPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              lyrics: { type: Type.STRING },
              bpm: { type: Type.INTEGER },
              description: { type: Type.STRING },
              musicalTheme: { type: Type.STRING },
            },
            required: ['title', 'lyrics', 'bpm'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/create-music:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi khi sáng tác nhạc' });
    }
  }

  // 4D. AI Music Style & Suno Beat Suggestion from Lyrics
  if (pathname === '/api/gemini/suggest-music-style' && req.method === 'POST') {
    try {
      const { lyrics = '', title = '' } = await parseBody(req);
      const cleanLyrics = String(lyrics).trim();

      const ai = getGenAI();
      if (!ai || !cleanLyrics) {
        // Fallback intelligent heuristics based on lyrics keywords
        const lower = cleanLyrics.toLowerCase();
        let genre = 'acoustic_pop';
        let genreName = 'Acoustic Pop Mộc Mạc';
        let mood = 'êm dịu, ấm áp';
        let singerVoice = 'nu_truyencam';
        let singerVoiceName = 'Giọng Nữ Ấm Áp Truyền Cảm';
        let durationSec = 180;
        let durationLabel = '3 phút (180s) - Chuẩn bài hát phổ thông';
        let bpm = 82;
        let sunoBeatStyle = 'Suno Pop Kick-Snare & Acoustic Guitar';

        if (lower.includes('ngủ') || lower.includes('ru') || lower.includes('đêm') || lower.includes('trăng')) {
          genre = 'ru_ngu';
          genreName = 'Giai Điệu Ru Ngủ Êm Đềm';
          mood = 'êm dịu, ấm áp';
          singerVoice = 'nu_truyencam';
          singerVoiceName = 'Giọng Nữ Dịu Dàng Ru Ngủ';
          durationSec = 210;
          durationLabel = '3.5 phút (210s) - Êm dịu ru bé ngủ say';
          bpm = 66;
          sunoBeatStyle = 'Lullaby Celestial Bells & Gentle Chords';
        } else if (lower.includes('vui') || lower.includes('cười') || lower.includes('nhảy') || lower.includes('hát vang')) {
          genre = 'vui_nhon';
          genreName = 'Pop Vui Nhộn & Sôi Động';
          mood = 'vui tươi, rộn ràng';
          singerVoice = 'song_ca';
          singerVoiceName = 'Song Ca Nam Nữ Hòa Âm Sôi Động';
          durationSec = 150;
          durationLabel = '2.5 phút (150s) - Tiết tấu tươi vui lôi cuốn';
          bpm = 118;
          sunoBeatStyle = 'Suno Upbeat Dance-Pop & Punchy Kick';
        } else if (lower.includes('sách') || lower.includes('học') || lower.includes('mưa') || lower.includes('cà phê')) {
          genre = 'lofi_read';
          genreName = 'Lo-Fi Chill Đọc Sách';
          mood = 'thư giãn, tĩnh tại';
          singerVoice = 'acoustic_live';
          singerVoiceName = 'Giọng Mộc Live Acoustic Suno';
          durationSec = 180;
          durationLabel = '3 phút (180s) - Thư thái đồng hành';
          bpm = 76;
          sunoBeatStyle = 'Lofi Chillhop Vinyl Snare & Sub-Bass';
        }

        return sendJson(res, 200, {
          genre,
          genreName,
          mood,
          singerVoice,
          singerVoiceName,
          durationSec,
          durationLabel,
          bpm,
          sunoBeatStyle,
          reason: 'Phân tích từ khóa cảm xúc trong lời bài hát theo phong cách hòa âm Suno AI.',
        });
      }

      const prompt = `Bạn là chuyên gia sản xuất âm nhạc AI hàng đầu theo tiêu chuẩn ứng dụng Suno AI.
Hãy phân tích lời bài hát sau đây và gợi ý phong cách sản xuất hoàn hảo:
"""
Tiêu đề: ${title || 'Chưa đặt tên'}
Lời bài hát:
${cleanLyrics.slice(0, 3000)}
"""

YÊU CẦU:
1. "genre": Chọn 1 trong các mã thể loại chính xác: "ru_ngu", "lofi_read", "vui_nhon", "co_tich", "thien_dinh", "acoustic_pop".
2. "genreName": Tên thể loại tiếng Việt mượt mà (ví dụ: "Pop Ballad Trữ Tình", "Lo-Fi Acoustic Chill", "Nhạc Thiếu Nhi Rộn Ràng", "Dân Ca Hiện Đại").
3. "mood": Tâm trạng phù hợp (ví dụ: "êm dịu, ấm áp", "vui tươi, rộn ràng", "sâu lắng, da diết", "mộng mơ, huyền diệu").
4. "singerVoice": Chọn 1 trong các mã: "nu_truyencam", "nam_tram", "song_ca", "acoustic_live", "tre_tho", "instrumental".
5. "singerVoiceName": Tên phong cách giọng hát (ví dụ: "Giọng Nữ Ấm Áp Truyền Cảm", "Giọng Nam Trầm Lắng Baritone", "Song Ca Nam Nữ Hòa Âm").
6. "durationSec": Độ dài bài hát thông thường từ 2 đến 5 phút (chọn 1 trong các số: 120, 150, 180, 210, 240, 300).
7. "durationLabel": Nhãn hiển thị độ dài (ví dụ: "3 phút (180s) - Thời lượng chuẩn Pop Ballad").
8. "bpm": Nhịp điệu BPM thích hợp (từ 60 đến 128).
9. "sunoBeatStyle": Gợi ý nhịp điệu và beat học từ ứng dụng Suno AI (ví dụ: "Suno Modern Pop Kick-Snare & Sub-Bass", "Acoustic Fingerpicking & Soft Cajon", "Lofi Chillhop Vinyl Snare", "Ballad Slow Rock 6/8").
10. "reason": Giải thích ngắn gọn 1-2 câu lý do vì sao phong cách này tôn vinh lời ca.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              genre: { type: Type.STRING },
              genreName: { type: Type.STRING },
              mood: { type: Type.STRING },
              singerVoice: { type: Type.STRING },
              singerVoiceName: { type: Type.STRING },
              durationSec: { type: Type.INTEGER },
              durationLabel: { type: Type.STRING },
              bpm: { type: Type.INTEGER },
              sunoBeatStyle: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ['genre', 'genreName', 'mood', 'singerVoice', 'durationSec', 'bpm', 'sunoBeatStyle'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/suggest-music-style:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi khi gợi ý phong cách nhạc' });
    }
  }

  // 5. User Email & Username / Password Authentication
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { email = '', username = '', password = '', name = '', loginType = 'auto' } = await parseBody(req);
      
      let matchedUserData: UserCloudData | null = null;
      let cleanEmail = '';

      // If logging in by username & password
      if (loginType === 'username' || (!email.includes('@') && username)) {
        const cleanUser = String(username || email).trim().toLowerCase();
        for (const [em, data] of cloudSyncStore.entries()) {
          if (data.username && data.username.toLowerCase() === cleanUser) {
            if (data.password && password && data.password !== String(password)) {
              return sendJson(res, 401, { error: 'Mật khẩu không chính xác' });
            }
            matchedUserData = data;
            cleanEmail = em;
            break;
          }
        }

        if (!matchedUserData) {
          // If admin login by username
          if (cleanUser === 'admin' || cleanUser === 'xuanduy') {
            cleanEmail = ADMIN_EMAIL;
            matchedUserData = cloudSyncStore.get(ADMIN_EMAIL) || {
              email: ADMIN_EMAIL,
              name: 'Xuân Duy (Admin)',
              username: 'admin',
              password: String(password || ''),
              zodiacId: 'thin',
              zodiacEmoji: '🐲',
              books: [],
              customTracks: [],
              userProfiles: [],
              lastSyncedAt: Date.now(),
            };
            cloudSyncStore.set(ADMIN_EMAIL, matchedUserData);
            persistCacheToDisk();
          } else {
            return sendJson(res, 404, { error: 'Không tìm thấy tài khoản với tên đăng nhập này' });
          }
        }
      } else {
        // Email / Google login
        cleanEmail = String(email).trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
          return sendJson(res, 400, { error: 'Vui lòng nhập địa chỉ email hợp lệ' });
        }
        matchedUserData = cloudSyncStore.get(cleanEmail) || null;
      }

      const isSuperAdmin = cleanEmail === ADMIN_EMAIL;
      const displayName = name
        ? String(name).trim()
        : (matchedUserData?.name || (isSuperAdmin ? 'Xuân Duy (Admin)' : cleanEmail.split('@')[0]));

      if (!matchedUserData) {
        matchedUserData = {
          email: cleanEmail,
          name: displayName,
          username: cleanEmail.split('@')[0],
          zodiacId: isSuperAdmin ? 'thin' : 'mao',
          zodiacEmoji: isSuperAdmin ? '🐲' : '🐱',
          books: [],
          customTracks: [],
          userProfiles: [],
          lastSyncedAt: Date.now(),
        };
        cloudSyncStore.set(cleanEmail, matchedUserData);
        persistCacheToDisk();
      }

      return sendJson(res, 200, {
        user: {
          id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          name: matchedUserData.name || displayName,
          username: matchedUserData.username || cleanEmail.split('@')[0],
          zodiacId: matchedUserData.zodiacId || (isSuperAdmin ? 'thin' : 'mao'),
          zodiacEmoji: matchedUserData.zodiacEmoji || (isSuperAdmin ? '🐲' : '🐱'),
          hasPassword: Boolean(matchedUserData.password),
          role: isSuperAdmin ? 'admin' : 'user',
          isAdmin: isSuperAdmin,
          isLoggedIn: true,
          lastSyncedAt: matchedUserData.lastSyncedAt,
        },
        cloudData: {
          books: matchedUserData.books || [],
          customTracks: matchedUserData.customTracks || [],
          userProfiles: matchedUserData.userProfiles || [],
          lastSyncedAt: matchedUserData.lastSyncedAt,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/login:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi đăng nhập' });
    }
  }

  // 5B. Update User Profile (Tên hiển thị, Tên đăng nhập, Mật khẩu, Ảnh đại diện Con Giáp)
  if (pathname === '/api/auth/profile' && req.method === 'POST') {
    try {
      const { email = '', name, username, password, zodiacId, zodiacEmoji } = await parseBody(req);
      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail) {
        return sendJson(res, 400, { error: 'Thiếu email tài khoản' });
      }

      let userData = cloudSyncStore.get(cleanEmail);
      if (!userData) {
        userData = {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          books: [],
          customTracks: [],
          userProfiles: [],
          lastSyncedAt: Date.now(),
        };
      }

      if (name !== undefined) userData.name = String(name).trim();
      if (username !== undefined) userData.username = String(username).trim();
      if (password !== undefined && String(password).trim().length > 0) {
        userData.password = String(password).trim();
      }
      if (zodiacId !== undefined) userData.zodiacId = String(zodiacId);
      if (zodiacEmoji !== undefined) userData.zodiacEmoji = String(zodiacEmoji);
      userData.lastSyncedAt = Date.now();

      cloudSyncStore.set(cleanEmail, userData);
      persistCacheToDisk();

      const isSuperAdmin = cleanEmail === ADMIN_EMAIL;
      return sendJson(res, 200, {
        success: true,
        user: {
          id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: cleanEmail,
          name: userData.name,
          username: userData.username,
          zodiacId: userData.zodiacId,
          zodiacEmoji: userData.zodiacEmoji,
          hasPassword: Boolean(userData.password),
          role: isSuperAdmin ? 'admin' : 'user',
          isAdmin: isSuperAdmin,
          isLoggedIn: true,
          lastSyncedAt: userData.lastSyncedAt,
        },
      });
    } catch (err: any) {
      console.error('Error in /api/auth/profile:', err);
      return sendJson(res, 500, { error: err.message || 'Lỗi cập nhật thông tin' });
    }
  }

  // 6. Cloud Data Sync (Sync across Web, Mobile & PWA APK)
  if (pathname === '/api/sync/data') {
    // GET: Retrieve cloud saved books, custom music & voice profiles
    if (req.method === 'GET') {
      const urlObj = new URL(req.url || '', 'http://localhost');
      const email = (urlObj.searchParams.get('email') || '').trim().toLowerCase();

      if (!email) {
        return sendJson(res, 400, { error: 'Thiếu email để đồng bộ dữ liệu' });
      }

      const userData = cloudSyncStore.get(email);
      if (!userData) {
        return sendJson(res, 200, {
          email,
          books: [],
          customTracks: [],
          userProfiles: [],
          lastSyncedAt: Date.now(),
        });
      }

      return sendJson(res, 200, {
        email: userData.email,
        books: userData.books || [],
        customTracks: userData.customTracks || [],
        userProfiles: userData.userProfiles || [],
        lastSyncedAt: userData.lastSyncedAt,
      });
    }

    // POST: Push local additions/updates to cloud & merge
    if (req.method === 'POST') {
      try {
        const {
          email = '',
          books = [],
          customTracks = [],
          userProfiles = [],
          deletedBookIds = [],
          deletedTrackIds = [],
        } = await parseBody(req);

        const cleanEmail = String(email).trim().toLowerCase();
        if (!cleanEmail) {
          return sendJson(res, 400, { error: 'Cần có email để lưu trữ đồng bộ' });
        }

        const isSuperAdmin = cleanEmail === ADMIN_EMAIL;

        let existing = cloudSyncStore.get(cleanEmail);
        if (!existing) {
          existing = {
            email: cleanEmail,
            name: isSuperAdmin ? 'Xuân Duy (Admin)' : cleanEmail.split('@')[0],
            books: [],
            customTracks: [],
            userProfiles: [],
            lastSyncedAt: Date.now(),
          };
        }

        // Merge books
        const bookMap = new Map<string, any>();
        (existing.books || []).forEach((b: any) => bookMap.set(b.id, b));
        (books || []).forEach((b: any) => {
          if (bookMap.has(b.id)) {
            const prev = bookMap.get(b.id);
            bookMap.set(b.id, {
              ...prev,
              ...b,
              readCount: Math.max(prev.readCount || 0, b.readCount || 0),
              likesCount: Math.max(prev.likesCount || 0, b.likesCount || 0),
              isFavorite: b.isFavorite !== undefined ? b.isFavorite : prev.isFavorite,
            });
          } else {
            bookMap.set(b.id, b);
          }
        });

        // Merge custom tracks
        const trackMap = new Map<string, any>();
        (existing.customTracks || []).forEach((t: any) => trackMap.set(t.id, t));
        (customTracks || []).forEach((t: any) => {
          if (trackMap.has(t.id)) {
            const prev = trackMap.get(t.id);
            trackMap.set(t.id, {
              ...prev,
              ...t,
              playCount: Math.max(prev.playCount || 0, t.playCount || 0),
              likesCount: Math.max(prev.likesCount || 0, t.likesCount || 0),
              isFavorite: t.isFavorite !== undefined ? t.isFavorite : prev.isFavorite,
            });
          } else {
            trackMap.set(t.id, t);
          }
        });

        // ONLY Super Admin xuanduy.cn@gmail.com has permission to delete books and tracks!
        if (isSuperAdmin) {
          if (Array.isArray(deletedBookIds)) {
            deletedBookIds.forEach((id: string) => {
              bookMap.delete(id);
              // Also purge across all users' cache if admin deleted
              cloudSyncStore.forEach((userRecord) => {
                userRecord.books = (userRecord.books || []).filter((b: any) => b.id !== id);
              });
            });
          }

          if (Array.isArray(deletedTrackIds)) {
            deletedTrackIds.forEach((id: string) => {
              trackMap.delete(id);
              // Also purge across all users' cache if admin deleted
              cloudSyncStore.forEach((userRecord) => {
                userRecord.customTracks = (userRecord.customTracks || []).filter((t: any) => t.id !== id);
              });
            });
          }
        }

        // Merge user voice profiles
        const profileMap = new Map<string, any>();
        (existing.userProfiles || []).forEach((p: any) => profileMap.set(p.id, p));
        (userProfiles || []).forEach((p: any) => profileMap.set(p.id, p));

        const updatedData: UserCloudData = {
          email: cleanEmail,
          name: existing.name || (isSuperAdmin ? 'Xuân Duy (Admin)' : cleanEmail.split('@')[0]),
          books: Array.from(bookMap.values()),
          customTracks: Array.from(trackMap.values()),
          userProfiles: Array.from(profileMap.values()),
          lastSyncedAt: Date.now(),
        };

        cloudSyncStore.set(cleanEmail, updatedData);
        persistCacheToDisk();

        return sendJson(res, 200, {
          success: true,
          email: cleanEmail,
          role: isSuperAdmin ? 'admin' : 'user',
          isAdmin: isSuperAdmin,
          books: updatedData.books,
          customTracks: updatedData.customTracks,
          userProfiles: updatedData.userProfiles,
          lastSyncedAt: updatedData.lastSyncedAt,
        });
      } catch (err: any) {
        console.error('Error in /api/sync/data POST:', err);
        return sendJson(res, 500, { error: err.message || 'Lỗi đồng bộ dữ liệu' });
      }
    }
  }

  // 7. Digital Asset Links for Android APK / TWA to Hide the URL Bar
  if (pathname === '/.well-known/assetlinks.json') {
    try {
      const assetLinksPath = path.resolve(process.cwd(), 'public', '.well-known', 'assetlinks.json');
      if (fs.existsSync(assetLinksPath)) {
        const content = fs.readFileSync(assetLinksPath, 'utf-8');
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(content);
        return true;
      }
    } catch (e) {
      console.warn('Error reading assetlinks.json:', e);
    }

    const fallbackStatement = [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.dino.app',
          sha256_cert_fingerprints: [
            '14:6D:E9:DE:3C:94:0A:14:D0:68:55:04:1E:73:96:AC:76:A4:7B:6A:E7:E2:B0:92:B5:14:CE:BA:7D:6F:E1:90',
          ],
        },
      },
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'app.pwabuilder.dino',
          sha256_cert_fingerprints: [
            '14:6D:E9:DE:3C:94:0A:14:D0:68:55:04:1E:73:96:AC:76:A4:7B:6A:E7:E2:B0:92:B5:14:CE:BA:7D:6F:E1:90',
          ],
        },
      },
    ];
    return sendJson(res, 200, fallbackStatement);
  }

  // 8. API endpoint to manage & test Digital Asset Links configuration
  if (pathname === '/api/assetlinks') {
    const assetLinksPath = path.resolve(process.cwd(), 'public', '.well-known', 'assetlinks.json');

    if (req.method === 'GET') {
      try {
        if (fs.existsSync(assetLinksPath)) {
          const raw = fs.readFileSync(assetLinksPath, 'utf-8');
          const parsed = JSON.parse(raw);
          return sendJson(res, 200, {
            status: 'active',
            assetLinksPath: '/.well-known/assetlinks.json',
            items: parsed,
          });
        }
      } catch (err) {
        console.warn('Failed to parse assetlinks.json:', err);
      }
      return sendJson(res, 200, {
        status: 'default',
        assetLinksPath: '/.well-known/assetlinks.json',
        items: [],
      });
    }

    if (req.method === 'POST') {
      try {
        const { packageName, sha256Fingerprint } = await parseBody(req);
        const pkg = String(packageName || '').trim() || 'com.dino.app';
        const rawSha = String(sha256Fingerprint || '').trim();

        if (!rawSha) {
          return sendJson(res, 400, { error: 'Vui lòng cung cấp mã vân tay SHA-256 từ PWABuilder' });
        }

        // Standardize SHA256 format (colons or continuous hex)
        const cleanSha = rawSha.toUpperCase();

        let currentList: any[] = [];
        try {
          if (fs.existsSync(assetLinksPath)) {
            const raw = fs.readFileSync(assetLinksPath, 'utf-8');
            currentList = JSON.parse(raw);
          }
        } catch {}

        // Check if package already exists
        const existingIdx = currentList.findIndex(
          (entry) => entry?.target?.package_name?.toLowerCase() === pkg.toLowerCase()
        );

        if (existingIdx >= 0) {
          const existingEntry = currentList[existingIdx];
          const fps: string[] = existingEntry.target.sha256_cert_fingerprints || [];
          if (!fps.includes(cleanSha)) {
            fps.push(cleanSha);
          }
          existingEntry.target.sha256_cert_fingerprints = fps;
          currentList[existingIdx] = existingEntry;
        } else {
          currentList.push({
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
              namespace: 'android_app',
              package_name: pkg,
              sha256_cert_fingerprints: [cleanSha],
            },
          });
        }

        // Ensure directory exists
        const dir = path.dirname(assetLinksPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(assetLinksPath, JSON.stringify(currentList, null, 2), 'utf-8');

        return sendJson(res, 200, {
          success: true,
          message: 'Đã lưu cấu hình Digital Asset Links thành công! Khởi động lại ứng dụng APK trên điện thoại để kiểm tra.',
          items: currentList,
        });
      } catch (err: any) {
        console.error('Error updating assetlinks:', err);
        return sendJson(res, 500, { error: err.message || 'Lỗi khi lưu Digital Asset Links' });
      }
    }
  }

  return false;
}
