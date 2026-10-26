import { Book } from '../types/book';
import { countWords, estimateDuration } from '../utils/textParser';

const deMenChapter1 = `Tôi sống độc lập từ thuở bé. Ấy là tục lệ lâu đời trong họ nhà dế chúng tôi. Vả lại, mẹ thường bảo chúng tôi rằng: "Phải như thế để các con biết kiếm ăn một mình cho quen đi."

Tôi ra ở một mình, trong một cái hang ở bờ đầm. Tôi đào sâu vào lòng đất, thành một ngách rộng rãi, có cửa ngách sau thông ra đầm. Bấy giờ tôi lên tuổi thiếu niên, chàng dế thanh niên cường tráng.

Đôi càng tôi mẫm bóng. Những cái vuốt ở chân, ở khoeo cứ cứng dần và nhọn hoắt. Thỉnh thoảng, muốn thử sự lợi hại của những chiếc vuốt, tôi co cẳng lên, đạp phanh phách vào các ngọn cỏ. Những ngọn cỏ gãy rạp, y như có nhát dao vừa lia qua.

Đôi cánh tôi, trước kia ngắn hủn hoẳn, bây giờ thành cái áo dài kín xuống tận chấm đuôi. Mỗi khi tôi vũ lên, đã nghe tiếng phành phạch giòn giã. Lúc tôi đi bách bộ thì cả người tôi rung rinh một màu nâu bóng mỡ soi gương được và rất ưa nhìn.

Hai cái răng đen nhánh lúc nào cũng nhai ngoàm ngoạp như hai lưỡi liềm máy làm việc. Sợi râu tôi dài và uốn cong một vẻ rất đỗi hùng dũng. Tôi lấy làm hãnh diện với bà con về cặp râu ấy lắm.`;

const deMenChapter2 = `Bên cạnh hang tôi có cái hang của Dế Choắt. Dế Choắt là tên tôi đã đặt cho nó một cách chế giễu và trịch thượng thế.

Chú mình nết ăn ở lôi thôi quá. Hang nông hoèn hoẹt, lại không có ngách sau. Người gầy nhẳng gầy nhơ như gã nghiện thuốc phiện. Đã thế lại còn lười nhác, không chịu đào bới tu bổ cho sâu rộng thêm.

Một hôm, thấy chị Cốc đi kiếm mồi gần đó, tôi chợt nảy ra ý nghĩ trêu chọc chị Cốc để trổ tài oai phong. Tôi bảo Dế Choắt: "Mày có dám trêu chị Cốc với tao không?"

Dế Choắt sợ hãi xua tay: "Thôi anh ơi! Em gầy yếu thế này, chị ấy mổ cho một nhát thì em chết ngay!" Tôi bĩu môi khinh bỉ, rồi nghển cổ lên cất giọng véo von trêu tức chị Cốc.

Chị Cốc tức giận, mắt quắc lên lùng sục. Thấy Dế Choắt đang ngơ ngác ngoài cửa hang, chị Cốc tưởng nhầm Choắt trêu mình, liền giáng những cú mổ trời giáng xuống lưng chú bé tội nghiệp.

Bài học đường đời đầu tiên đã đến với tôi bằng sự ân hận và muôn vàn giọt nước mắt xót xa trước cái chết của Dế Choắt. Tôi tự hứa từ nay sẽ không bao giờ kiêu ngạo, hung hăng càn quấy nữa.`;

const dacNhanTamChapter1 = `Nguyên tắc 1: Không chỉ trích, oán trách hay than phiền.

Ngày 7 tháng 5 năm 1931, một vụ vây bắt ngoạn mục nhất trong lịch sử New York đã diễn ra. Hơn một trăm năm mươi cảnh sát trang bị súng ngắn, súng máy bao vây căn hộ tầng trên cùng của tên sát nhân có biệt danh "Hai Khẩu Súng" Crowley.

Trong lúc đạn bay xối xả xuyên qua tường, Crowley đang viết một lá thư. Máu từ vết thương chảy ra làm ố trang giấy. Bức thư viết: "Dưới chiếc áo này là một trái tim mệt mỏi nhưng dịu dàng, một trái tim không hề có ác tâm và chẳng muốn làm hại ai bao giờ."

Trước đó không lâu, Crowley đã bắn chết một viên cảnh sát tuần tra chỉ vì viên cảnh sát yêu cầu hắn xuất trình giấy phép lái xe. Vậy mà hắn vẫn tự xem mình là người vô tội và có trái tim nhân từ!

Hầu hết mọi tội phạm lừng danh thế giới, khi bị giam cầm trong nhà tù Sing Sing, đều không bao giờ tự nhận mình là người xấu. Họ biện minh cho hành động của mình bằng muôn vàn lý lẽ.

Nếu những tên tội phạm nguy hiểm ấy còn không tự trách mình, thì những người bình thường quanh chúng ta sẽ phản ứng thế nào khi bị chỉ trích? Chỉ trích giống như chim bồ câu đưa thư: chúng luôn luôn quay trở về nơi xuất phát. Khi muốn thay đổi một ai đó, hãy nhớ rằng con người không phải là sinh vật của lý trí, mà là sinh vật của cảm xúc, tự ái và định kiến.`;

const dacNhanTamChapter2 = `Nguyên tắc 2: Thành thật khen ngợi và biết ơn người khác.

Chỉ có một cách duy nhất dưới ánh mặt trời có thể khiến bất kỳ ai làm bất cứ điều gì cho bạn. Bạn có biết cách đó là gì không? Đó là làm cho người ấy muốn thực hiện điều đó!

Sigmund Freud, một trong những nhà phân tâm học vĩ đại nhất thế giới, từng nói rằng mọi hành động của chúng ta đều bắt nguồn từ hai động cơ sâu xa: niềm khao khát tình dục và mong muốn trở thành người quan trọng.

John Dewey, triết gia sâu sắc của nước Mỹ, cũng khẳng định: "Động lực sâu sắc nhất trong bản chất con người là khao khát được khẳng định mình."

Charles Schwab, một trong những người đầu tiên trong giới kinh doanh Mỹ được trả lương hơn một triệu đô-la mỗi năm, đã tiết lộ bí quyết thành công phi thường của ông: "Tôi coi khả năng khơi gợi lòng nhiệt tình ở nhân viên là tài sản quý giá nhất của đời mình. Cách duy nhất để phát huy những phẩm chất tốt nhất của một người là khen ngợi và khuyến khích họ."

Hãy chân thành, đừng tiếc lời ngợi khen và hãy rộng lượng trong việc ghi nhận công sức của người khác. Những lời khen ngợi chân thành sẽ được ghi nhớ mãi trong trái tim người đón nhận, ngay cả khi người trao đi đã lãng quên từ lâu.`;

const hoangTuBeChapter1 = `Năm tôi lên sáu tuổi, tôi đã thấy một bức tranh tuyệt vời trong một cuốn sách viết về Rừng Nguyên Sinh mang tên "Những Câu Chuyện Thật". Bức tranh vẽ một con trăn khổng lồ đang nuốt chửng một con thú dữ.

Sách viết: "Trăn nuốt chửng cả con mồi mà không cần nhai. Sau đó chúng nằm im bất động trong suốt sáu tháng trời để tiêu hóa."

Tôi đã suy nghĩ rất nhiều về những cuộc phiêu lưu giữa rừng thẳm, và với một chiếc bút chì màu, tôi đã vẽ bức tranh đầu tiên của đời mình: Bức Tranh Số 1.

Tôi đưa kiệt tác ấy cho những người lớn xem và hỏi họ có sợ không. Nhưng họ lại đáp: "Sao lại phải sợ một chiếc mũ cơ chứ?"

Bức tranh của tôi đâu có vẽ chiếc mũ! Nó vẽ một con trăn đang tiêu hóa một con voi! Thế là tôi đành phải vẽ Bức Tranh Số 2, vẽ rõ ruột con trăn bên trong để người lớn có thể hiểu được. Người lớn bao giờ cũng cần phải được giải thích tỉ mỉ từng tí một.`;

const hoangTuBeChapter2 = `Và thế là tôi sống cô đơn một mình, không có ai thực sự để chuyện trò cởi mở, cho tới khi máy bay của tôi gặp sự cố và rơi xuống sa mạc Sahara cách đây sáu năm. Động cơ máy bay hỏng nặng, và tôi chỉ còn đủ nước uống cầm cự trong tám ngày.

Sáng sớm hôm sau, tôi giật mình thức giấc bởi một giọng nói nhỏ nhẹ, kỳ lạ:
"Làm ơn... hãy vẽ cho tôi một con cừu!"

Tôi bật dậy như bị sét đánh. Tôi dụi mắt và nhìn thấy một chú bé vô cùng phi thường đang đứng chăm chú nhìn tôi với vẻ trang nghiêm lạ lùng. Cậu bé không hề có vẻ gì là đang lạc đường, mệt lả vì đói khát hay sợ hãi giữa sa mạc mênh mông ngút ngàn.

Khi tôi cuối cùng thốt nên lời: "Nhưng... em làm gì ở đây?", cậu bé chỉ dịu dàng lặp lại lời thỉnh cầu như một điều vô cùng quan trọng:
"Làm ơn... hãy vẽ cho tôi một con cừu đi mà!"

Và đó chính là khoảnh khắc kỳ diệu đầu tiên tôi gặp Hoàng Tử Bé, vị hoàng tử đến từ tiểu hành tinh B-612 xa xôi.`;

const thachSanhChapter1 = `Ngày xưa, ở quận Cao Bình có hai vợ chồng già sống rất phúc đức nhưng mãi vẫn chưa có con. Ngọc Hoàng thương tình bèn sai Thái tử giáng trần làm con của hai ông bà.

Người mẹ mang thai mãi mới sinh ra một cậu bé kháu khỉnh, đặt tên là Thạch Sanh. Nhưng chẳng bao lâu sau, cha mẹ đều lần lượt qua đời. Thạch Sanh sống cô đơn dưới gốc cây đa cổ thụ, gia tài duy nhất chỉ có một túp lều rách nát và một chiếc rìu sắt do cha để lại.

Năm Thạch Sanh lớn khôn, chàng được thiên thần xuống dạy cho đủ các môn võ nghệ và các phép thần thông biến hóa.

Một hôm, có gã buôn rượu tên là Lý Thông đi qua gốc đa. Thấy Thạch Sanh khỏe mạnh phi thường, Lý Thông liền nảy lòng tham, bèn gạ gẫm kết nghĩa anh em để sau này lợi dụng sức lực của chàng. Chàng Thạch Sanh thật thà, chất phác liền vui vẻ nhận lời và dọn về ở cùng mẹ con Lý Thông.`;

const cayVuSuaChapter1 = `Ngày xưa, có một cậu bé được mẹ nuông chiều từ nhỏ nên rất ham chơi và ngỗ nghịch. Một hôm, bị mẹ mắng vì mải chơi bỏ bữa, cậu giận dỗi vùng vằng bỏ nhà ra đi. Cậu lang thang khắp nơi, chẳng hề nghĩ đến việc mẹ ở nhà đang khắc khoải mong chờ.

Không biết cậu đã đi bao lâu. Cho đến một ngày mùa đông lạnh giá, cậu vừa đói, vừa rét, lại bị những đứa trẻ lớn hơn bắt nạt, cậu mới nhớ tới mẹ:
"Mẹ ơi, con đói quá! Con về với mẹ đây!"

Cậu tìm đường quay về nhà. Cảnh vật vẫn như xưa, nhưng ngôi nhà vắng tanh, mạng nhện giăng đầy. Cậu khản giọng gọi mẹ: "Mẹ ơi! Mẹ ở đâu?", nhưng chỉ có tiếng gió xào xạc đáp lại. Quá mệt mỏi và đau khổ, cậu bé gục xuống bên một gốc cây xanh tươi trong vườn mà khóc nức nở.

Cây xanh bỗng rung rinh cành lá. Những búp non nhú ra, hoa nở trắng ngần rồi rụng xuống, kết thành những quả căng tròn, bóng mịn. Một quả chín mọng rơi đúng vào lòng cậu. Cậu vừa cắn một miếng, một dòng sữa trắng ngọt ngào thơm phức tuôn ra, ngọt thơm như dòng sữa mẹ.

Cậu ngước nhìn lên, mặt dưới của lá cây ánh lên sắc đỏ hoe như đôi mắt mẹ khóc chờ con. Cậu ôm lấy thân cây mà nức nở. Cây cối như xoa đầu vỗ về cậu bé. Người ta gọi đó là cây Vú Sữa.`;

function buildChapter(id: string, title: string, content: string, order: number) {
  const words = countWords(content);
  return {
    id,
    title,
    content,
    order,
    wordCount: words,
    estimatedDurationSec: estimateDuration(words),
  };
}

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-de-men',
    title: 'Dế Mèn Phiêu Lưu Ký',
    author: 'Tô Hoài',
    category: 'Văn học thiếu nhi kinh điển',
    description: 'Kiệt tác văn học thiếu nhi Việt Nam kể về hành trình trưởng thành, lòng dũng cảm, tình bạn và bài học đường đời sâu sắc của chú Dế Mèn.',
    coverGradient: 'from-emerald-700 via-emerald-950 to-[#121212]',
    coverBgColor: '#047857',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 3,
    lastReadAt: Date.now() - 3600000 * 2,
    isFavorite: true,
    readCount: 3420,
    likesCount: 890,
    appliedVoiceType: 'user_voice',
    chapters: [
      buildChapter('dm-c1', 'Chương 1: Bài học đường đời đầu tiên', deMenChapter1, 1),
      buildChapter('dm-c2', 'Chương 2: Nỗi ân hận và lời hứa với Dế Choắt', deMenChapter2, 2),
    ],
  },
  {
    id: 'book-dac-nhan-tam',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    category: 'Kỹ năng & Phát triển bản thân',
    description: 'Cuốn sách nghệ thuật ứng xử kinh điển nhất mọi thời đại, chỉ dẫn cách lắng nghe, thấu cảm và thu phục lòng người bằng sự chân thành.',
    coverGradient: 'from-amber-600 via-amber-950 to-[#121212]',
    coverBgColor: '#b45309',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 5,
    lastReadAt: Date.now() - 3600000 * 5,
    isFavorite: true,
    readCount: 4890,
    likesCount: 1250,
    appliedVoiceType: 'gemini',
    chapters: [
      buildChapter('dnt-c1', 'Chương 1: Không chỉ trích, oán trách hay than phiền', dacNhanTamChapter1, 1),
      buildChapter('dnt-c2', 'Chương 2: Thành thật khen ngợi và biết ơn', dacNhanTamChapter2, 2),
    ],
  },
  {
    id: 'book-hoang-tu-be',
    title: 'Hoàng Tử Bé (Le Petit Prince)',
    author: 'Antoine de Saint-Exupéry',
    category: 'Văn học thế giới',
    description: 'Bản trường ca tuyệt đẹp về tình yêu thương, sự ngây thơ và những điều cốt lõi chỉ có thể nhìn thấu bằng trái tim.',
    coverGradient: 'from-indigo-700 via-indigo-950 to-[#121212]',
    coverBgColor: '#4338ca',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 8,
    lastReadAt: Date.now() - 3600000 * 24,
    isFavorite: false,
    readCount: 2650,
    likesCount: 670,
    appliedVoiceType: 'user_voice',
    chapters: [
      buildChapter('htb-c1', 'Chương 1: Con trăn khổng lồ và chiếc mũ', hoangTuBeChapter1, 1),
      buildChapter('htb-c2', 'Chương 2: Gặp gỡ giữa sa mạc Sahara', hoangTuBeChapter2, 2),
    ],
  },
  {
    id: 'book-co-tich-vn',
    title: 'Kho Tàng Cổ Tích Việt Nam',
    author: 'Nguyễn Đổng Chi',
    category: 'Cổ tích & Ngụ ngôn',
    description: 'Những câu chuyện nuôi dưỡng tâm hồn trẻ thơ và bài học đạo đức ngàn đời của ông cha ta.',
    coverGradient: 'from-rose-700 via-rose-950 to-[#121212]',
    coverBgColor: '#be123c',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 12,
    readCount: 3980,
    likesCount: 1105,
    isFavorite: true,
    appliedVoiceType: 'user_voice',
    chapters: [
      buildChapter('ct-c1', 'Chương 1: Sự tích cây Vú Sữa', cayVuSuaChapter1, 1),
      buildChapter('ct-c2', 'Chương 2: Thạch Sanh đánh Chằn Tinh', thachSanhChapter1, 2),
    ],
  },
];
