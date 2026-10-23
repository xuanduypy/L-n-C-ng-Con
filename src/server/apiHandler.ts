import { GoogleGenAI, Type } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

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
        return sendJson(res, 200, {
          reply: `Gâu gâu! Chào ${childName}! Tớ là ${puppyName} đây! Hôm nay bé muốn cùng tớ khám phá điều gì nào?`,
          action: 'wag_tail',
          suggestedWords: ['Puppy', 'Friend', 'Star'],
          curiosityQuestion: 'Bé có biết chú cún thích ăn gì nhất không nào?',
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

  // 4. Gemini TTS Voice Generation (Giọng đọc tùy chỉnh bằng Gemini TTS)
  if (pathname === '/api/gemini/tts' && req.method === 'POST') {
    try {
      const {
        text,
        voiceName = 'Kore', // 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'
        style = 'Warm, gentle and affectionate bedtime storyteller for small kids',
      } = await parseBody(req);

      if (!text) {
        return sendJson(res, 400, { error: 'Text is required for TTS' });
      }

      const ai = getGenAI();
      if (!ai) {
        return sendJson(res, 200, { audioBase64: null, message: 'Gemini API Key is not configured for TTS; will use Web Speech API fallback.' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 400), // Kid-friendly sentence length
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

  return false;
}
