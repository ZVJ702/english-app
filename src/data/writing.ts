import type { Level } from './vocab'
// Định dạng: cấp|điểm ngữ pháp|câu tiếng Việt|đáp án mẫu (các đáp án chấp nhận khác cách nhau bằng " / ")
export interface Sentence { id: string; level: Level; point: string; vi: string; answers: string[] }
const RAW = `
A2|Hiện tại đơn|Tôi thường đi làm bằng xe máy.|I usually go to work by motorbike. / I usually go to work by motorcycle.
A2|Hiện tại tiếp diễn|Cô ấy đang nấu bữa tối.|She is cooking dinner.
A2|Quá khứ đơn|Hôm qua tôi đã gặp một người bạn cũ.|I met an old friend yesterday. / Yesterday I met an old friend.
A2|So sánh hơn|Căn phòng này lớn hơn phòng của tôi.|This room is bigger than mine. / This room is bigger than my room.
A2|There is/are|Có hai quán cà phê gần nhà tôi.|There are two coffee shops near my house. / There are two cafes near my house.
A2|Tương lai gần|Tôi sẽ đi thăm bà vào cuối tuần này.|I am going to visit my grandmother this weekend.
A2|Can/could|Bạn có thể giúp tôi một chút được không?|Could you help me for a moment? / Can you help me for a moment?
A2|Số lượng|Tôi không có nhiều thời gian rảnh.|I do not have much free time.
A2|Giới từ thời gian|Cuộc họp bắt đầu lúc chín giờ sáng thứ Hai.|The meeting starts at nine o'clock on Monday morning. / The meeting starts at 9 o'clock on Monday morning.
A2|Like + V-ing|Em gái tôi thích đọc sách.|My sister likes reading books. / My younger sister likes reading books.
B1|Hiện tại hoàn thành|Tôi đã sống ở thành phố này được năm năm.|I have lived in this city for five years.
B1|Hiện tại hoàn thành|Bạn đã từng đến Hà Nội chưa?|Have you ever been to Hanoi? / Have you ever been to Ha Noi?
B1|Quá khứ tiếp diễn|Khi tôi về đến nhà, mẹ tôi đang xem tivi.|When I got home, my mother was watching TV. / When I arrived home, my mother was watching TV.
B1|Câu điều kiện loại 1|Nếu trời mưa, chúng tôi sẽ ở nhà.|If it rains, we will stay at home. / If it rains, we will stay home.
B1|Câu điều kiện loại 2|Nếu tôi có nhiều tiền hơn, tôi sẽ đi du lịch vòng quanh thế giới.|If I had more money, I would travel around the world.
B1|Câu bị động|Cây cầu này được xây vào năm 2010.|This bridge was built in 2010.
B1|Mệnh đề quan hệ|Người phụ nữ sống cạnh nhà tôi là bác sĩ.|The woman who lives next door is a doctor. / The woman who lives next to my house is a doctor.
B1|Used to|Tôi từng chơi bóng đá khi còn nhỏ.|I used to play football when I was a child. / I used to play football when I was young.
B1|Too / enough|Tôi quá mệt để làm bài tập.|I am too tired to do my homework.
B1|Although|Mặc dù công việc khó, anh ấy không bỏ cuộc.|Although the job was difficult, he did not give up. / Although the work was hard, he did not give up.
B1|Câu tường thuật|Cô ấy nói rằng cô ấy bận.|She said that she was busy. / She said she was busy.
B1|So sánh nhất|Đây là bộ phim hay nhất mà tôi từng xem.|This is the best film I have ever seen. / This is the best movie I have ever seen.
B1|V-ing làm chủ ngữ|Học một ngôn ngữ mới cần nhiều thời gian.|Learning a new language takes a lot of time.
B1|Should|Bạn nên đi ngủ sớm hơn.|You should go to bed earlier.
B1|Because / so|Tôi đến muộn vì tắc đường.|I was late because of the traffic jam. / I was late because of a traffic jam.
B1|Look forward to|Tôi mong sớm nhận được phản hồi của bạn.|I look forward to hearing from you soon.
B2|Câu điều kiện loại 3|Nếu tôi học chăm hơn, tôi đã đậu kỳ thi.|If I had studied harder, I would have passed the exam.
B2|Bị động với modal|Vấn đề này cần được giải quyết ngay.|This problem needs to be solved immediately. / This problem must be solved immediately.
B2|Wish|Ước gì tôi nói tiếng Anh trôi chảy hơn.|I wish I could speak English more fluently. / I wish I spoke English more fluently.
B2|Despite|Bất chấp giá cao, nhiều người vẫn mua sản phẩm này.|Despite the high price, many people still buy this product.
B2|Not only... but also|Đọc sách không chỉ mở rộng vốn từ mà còn cải thiện kỹ năng viết.|Reading not only expands your vocabulary but also improves your writing skills.
B2|The more... the more|Bạn càng luyện tập nhiều, bạn càng tự tin hơn.|The more you practise, the more confident you become. / The more you practice, the more confident you become.
B2|Câu IELTS: nêu quan điểm|Theo tôi, lợi ích của công nghệ nhiều hơn bất lợi.|In my opinion, the advantages of technology outweigh the disadvantages. / In my opinion, the benefits of technology outweigh the drawbacks.
B2|Câu IELTS: nguyên nhân|Ô nhiễm không khí chủ yếu do khí thải từ xe cộ gây ra.|Air pollution is mainly caused by emissions from vehicles. / Air pollution is mainly caused by vehicle emissions.
B2|Câu IELTS: xu hướng|Số người làm việc tại nhà đã tăng đáng kể trong những năm gần đây.|The number of people working from home has increased significantly in recent years.
B2|Câu IELTS: giải pháp|Chính phủ nên đầu tư nhiều hơn vào giao thông công cộng.|The government should invest more in public transport. / Governments should invest more in public transport.
B2|Mệnh đề quan hệ rút gọn|Những học sinh tham gia câu lạc bộ thường tự tin hơn.|Students participating in clubs are often more confident. / Students who participate in clubs are often more confident.
B2|It is + adj + that|Điều quan trọng là trẻ em học cách quản lý thời gian.|It is important that children learn how to manage their time. / It is important for children to learn how to manage their time.
B2|Whereas|Một số người thích sống ở thành phố, trong khi những người khác thích nông thôn.|Some people prefer living in cities, whereas others prefer the countryside. / Some people prefer to live in the city, whereas others prefer the countryside.
B2|Câu IELTS: kết luận|Tóm lại, cả hai quan điểm đều có điểm hợp lý.|In conclusion, both views have their merits. / In conclusion, both views are reasonable.
`
export const SENTENCES: Sentence[] = RAW.trim().split('\n').map((l, i) => {
  const [level, point, vi, ans] = l.split('|')
  return { id: 'w:' + (i + 1), level: level as Level, point, vi, answers: ans.split(' / ') }
})

export interface Topic { id: string; kind: string; en: string; vi: string }
export const TOPICS: Topic[] = [
  { id: 't1', kind: 'Đoạn văn · Paragraph', en: 'Describe your daily routine on a working day. (80–120 words)', vi: 'Mô tả một ngày làm việc của bạn.' },
  { id: 't2', kind: 'Đoạn văn · Paragraph', en: 'Write about a skill you want to learn and why. (80–120 words)', vi: 'Viết về một kỹ năng bạn muốn học và lý do.' },
  { id: 't3', kind: 'Email', en: 'Write an email to a friend inviting them to visit your city. Say what you will do together. (100–150 words)', vi: 'Viết email mời bạn đến thăm thành phố của bạn.' },
  { id: 't4', kind: 'Email', en: 'Write an email to a hotel to complain about a problem during your stay. (120–150 words)', vi: 'Viết email phàn nàn với khách sạn.' },
  { id: 't5', kind: 'IELTS Task 2', en: 'Some people think that working from home is better than working in an office. To what extent do you agree or disagree? (at least 250 words)', vi: 'Làm việc ở nhà tốt hơn ở văn phòng — bạn đồng ý đến mức nào?' },
  { id: 't6', kind: 'IELTS Task 2', en: 'Many people believe that social media has a negative effect on young people. Do you agree or disagree? (at least 250 words)', vi: 'Mạng xã hội ảnh hưởng xấu đến giới trẻ — bạn đồng ý không?' },
  { id: 't7', kind: 'IELTS Task 2', en: 'In many cities, traffic congestion is a serious problem. What are the causes, and what solutions can you suggest? (at least 250 words)', vi: 'Nguyên nhân và giải pháp cho kẹt xe ở thành phố.' },
  { id: 't8', kind: 'IELTS Task 2', en: 'Some people say children should learn a foreign language at primary school; others think they should wait until secondary school. Discuss both views and give your opinion. (at least 250 words)', vi: 'Nên học ngoại ngữ từ tiểu học hay đợi đến trung học? Bàn cả hai quan điểm.' },
]
