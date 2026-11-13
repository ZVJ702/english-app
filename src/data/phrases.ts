import { parseUnits } from './grammar'
// Mẫu câu giao tiếp theo tình huống. Định dạng: # mã|cấp|tên tiếng Việt|tên tiếng Anh||nhóm, rồi các dòng s: câu|nghĩa
export const DOMAINS: Record<string, string> = { daily: 'Đời sống hằng ngày', work: 'Công việc', travel: 'Du lịch', ielts: 'IELTS Speaking' }
const RAW = `
# greet|A1|Chào hỏi và làm quen|Greetings and introductions||daily
s: Nice to meet you.|Rất vui được gặp bạn.
s: How are you doing?|Bạn dạo này thế nào?
s: I'm fine, thanks. And you?|Tôi khỏe, cảm ơn. Còn bạn?
s: Where are you from?|Bạn đến từ đâu?
s: What do you do for a living?|Bạn làm nghề gì?
s: See you later.|Hẹn gặp lại sau.
# order|A2|Gọi món ở quán|Ordering food and drinks||daily
s: Could I see the menu, please?|Cho tôi xem thực đơn được không?
s: I'd like a coffee with milk, please.|Cho tôi một cà phê sữa.
s: What do you recommend?|Bạn gợi ý món nào?
s: Can I have the bill, please?|Cho tôi xin hóa đơn.
s: Is service included?|Đã bao gồm phí phục vụ chưa?
s: Can I pay by card?|Tôi trả bằng thẻ được không?
# meeting|B1|Trong cuộc họp|In a meeting||work
s: Shall we get started?|Chúng ta bắt đầu nhé?
s: Could you explain that in more detail?|Bạn giải thích chi tiết hơn được không?
s: I see your point, but I have a different view.|Tôi hiểu ý bạn, nhưng tôi có quan điểm khác.
s: Let's move on to the next item.|Chúng ta chuyển sang mục tiếp theo nhé.
s: Could you send me the report by Friday?|Bạn gửi tôi báo cáo trước thứ Sáu được không?
s: Sorry, could you say that again?|Xin lỗi, bạn nói lại được không?
# interview|B1|Phỏng vấn xin việc|Job interview||work
s: I have three years of experience in sales.|Tôi có ba năm kinh nghiệm bán hàng.
s: I'm good at working under pressure.|Tôi làm việc tốt dưới áp lực.
s: I'm looking for a new challenge.|Tôi đang tìm một thử thách mới.
s: My biggest strength is that I learn quickly.|Điểm mạnh nhất của tôi là học nhanh.
s: Could you tell me more about the role?|Bạn cho tôi biết thêm về vị trí này được không?
s: When can I expect to hear from you?|Khi nào tôi có thể nhận được phản hồi?
# airport|A2|Ở sân bay|At the airport||travel
s: Where is the check-in counter?|Quầy làm thủ tục ở đâu?
s: I'd like a window seat, please.|Tôi muốn ghế cạnh cửa sổ.
s: How many bags can I check in?|Tôi được ký gửi bao nhiêu kiện hành lý?
s: What time does boarding start?|Mấy giờ bắt đầu lên máy bay?
s: My flight has been delayed.|Chuyến bay của tôi bị hoãn.
s: Where can I collect my luggage?|Tôi lấy hành lý ở đâu?
# hotel|A2|Ở khách sạn|At the hotel||travel
s: I have a reservation under the name Nam.|Tôi đã đặt phòng dưới tên Nam.
s: What time is breakfast served?|Bữa sáng phục vụ lúc mấy giờ?
s: Could I have a late check-out?|Tôi trả phòng muộn được không?
s: The air conditioner isn't working.|Máy lạnh không hoạt động.
s: Is there free Wi-Fi in the room?|Trong phòng có Wi-Fi miễn phí không?
s: Could you call a taxi for me?|Bạn gọi taxi giúp tôi được không?
# opinion|B1|Nêu ý kiến|Giving opinions||ielts
s: In my opinion, it depends on the situation.|Theo tôi, điều đó tùy vào hoàn cảnh.
s: I strongly believe that education is important.|Tôi tin chắc rằng giáo dục rất quan trọng.
s: As far as I'm concerned, both options are fine.|Theo tôi thấy, cả hai lựa chọn đều ổn.
s: I'm not sure, but I think it is getting better.|Tôi không chắc, nhưng tôi nghĩ nó đang tốt lên.
s: That's a good question. Let me think.|Câu hỏi hay đấy. Để tôi nghĩ một chút.
s: The main reason is that it saves time.|Lý do chính là nó tiết kiệm thời gian.
# extend|B2|Kéo dài câu trả lời|Extending your answer||ielts
s: For example, I usually read before going to bed.|Ví dụ, tôi thường đọc sách trước khi đi ngủ.
s: On the one hand, it is convenient. On the other hand, it is expensive.|Một mặt thì tiện lợi. Mặt khác thì đắt.
s: What I mean is that people have less free time.|Ý tôi là mọi người có ít thời gian rảnh hơn.
s: Compared to the past, life is much faster now.|So với trước đây, cuộc sống bây giờ nhanh hơn nhiều.
s: It reminds me of a trip I took last year.|Nó làm tôi nhớ đến một chuyến đi năm ngoái.
s: To sum up, I think the benefits outweigh the drawbacks.|Tóm lại, tôi nghĩ lợi ích nhiều hơn hạn chế.
`
export const PHRASES = parseUnits(RAW, 'p', ['listen', 'speak', 'order'])
