import type { Level } from './vocab'
// Định dạng mỗi chủ đề:
//   # mã|cấp|tên tiếng Việt|tên tiếng Anh|công thức
//   > giải thích
//   = so sánh với tiếng Việt
//   ! câu sai → câu đúng — vì sao (lỗi người Việt hay mắc)
//   p: ghi chú phát âm|các từ hoặc cụm mẫu để nghe, cách nhau bằng dấu phẩy
//   e: câu ví dụ tiếng Anh|nghĩa tiếng Việt
//   q: câu hỏi trắc nghiệm|A;B;C;D|vị trí đáp án đúng (từ 0)|giải thích
//   t: câu điền chỗ trống (tự gõ)|đáp án (các cách viết đúng cách nhau bằng " / ")|giải thích
//   s: câu mẫu tiếng Anh|nghĩa — app tự tạo bài sắp xếp từ thành câu từ các câu này
export type Kind = 'mcq' | 'gap' | 'order'
export interface Exercise { id: string; topic: string; kind: Kind; q: string; opts: string[]; a: number; answers: string[]; vi: string; why: string }
export interface Topic {
  id: string; level: Level; vi: string; en: string; formula: string; domain?: string
  notes: string[]; compare: string[]; mistakes: [string, string, string][]; sounds: [string, string[]][]; examples: [string, string][]; exercises: Exercise[]
}

/** Đọc khối văn bản thành danh sách chủ đề. prefix là tiền tố mã thẻ ("g" cho ngữ pháp, "p" cho mẫu câu). */
export function parseUnits(raw: string, prefix: string): Topic[] {
  const out: Topic[] = []
  const count = { q: 0, t: 0, s: 0 }
  for (const line of raw.trim().split('\n')) {
    const t = out[out.length - 1]
    const body = line.slice(line.indexOf(' ') + 1)
    const ex = (suffix: string, kind: Kind, rest: Partial<Exercise>): Exercise =>
      ({ id: `${prefix}:${t.id}:${suffix}`, topic: t.id, kind, q: '', opts: [], a: 0, answers: [], vi: '', why: '', ...rest })
    if (line.startsWith('# ')) {
      const [id, level, vi, en, formula, domain] = body.split('|')
      out.push({ id, level: level as Level, vi, en, formula: formula ?? '', domain, notes: [], compare: [], mistakes: [], sounds: [], examples: [], exercises: [] })
      count.q = count.t = count.s = 0
    } else if (line.startsWith('> ')) t.notes.push(body)
    else if (line.startsWith('= ')) t.compare.push(body)
    else if (line.startsWith('! ')) {
      const [wrong, rest] = body.split(' → ')
      const [right, why] = rest.split(' — ')
      t.mistakes.push([wrong, right, why ?? ''])
    } else if (line.startsWith('p: ')) {
      const [note, samples] = body.split('|')
      t.sounds.push([note, (samples ?? '').split(', ').filter(Boolean)])
    } else if (line.startsWith('e: ')) t.examples.push(body.split('|') as [string, string])
    else if (line.startsWith('q: ')) {
      const [q, opts, a, why] = body.split('|')
      t.exercises.push(ex(String(++count.q), 'mcq', { q, opts: opts.split(';'), a: Number(a), why }))
    } else if (line.startsWith('t: ')) {
      const [q, answers, why] = body.split('|')
      t.exercises.push(ex(`t${++count.t}`, 'gap', { q, answers: answers.split(' / '), why }))
    } else if (line.startsWith('s: ')) {
      const [q, vi] = body.split('|')
      const n = ++count.s
      t.exercises.push(ex(prefix === 'g' ? `s${n}` : String(n), 'order', { q, vi, answers: [q] }))
    }
  }
  return out
}

const RAW = `
# present|A2|Hiện tại đơn và hiện tại tiếp diễn|Present simple vs continuous|S + V(s/es)  ·  S + am/is/are + V-ing
> Hiện tại đơn nói về thói quen, sự thật, lịch cố định. Dấu hiệu: always, usually, often, every day.
> Hiện tại tiếp diễn nói về việc đang xảy ra ngay lúc nói hoặc tạm thời. Dấu hiệu: now, at the moment, Look!
> Động từ chỉ trạng thái (know, like, want, need, believe) thường không dùng ở dạng tiếp diễn.
e: She works in a bank.|Cô ấy làm ở ngân hàng. (công việc thường xuyên)
e: She is working from home this week.|Tuần này cô ấy đang làm ở nhà. (tạm thời)
q: Listen! Someone ___ at the door.|knocks;is knocking;knock;knocked|1|"Listen!" cho thấy việc đang xảy ra ngay lúc nói → hiện tại tiếp diễn.
q: My father ___ coffee every morning.|drinks;is drinking;drink;drinking|0|"every morning" là thói quen → hiện tại đơn, chủ ngữ số ít thêm -s.
q: I ___ what you mean.|am understanding;understand;understands;understanding|1|"understand" là động từ chỉ trạng thái, không dùng dạng tiếp diễn.
q: We ___ in a hotel until our flat is ready.|stay;stays;are staying;staying|2|Tình huống tạm thời → hiện tại tiếp diễn.
= Tiếng Việt dùng "đang" hoặc không cần đổi động từ; tiếng Anh bắt buộc đổi dạng động từ theo ý nghĩa thói quen hay đang diễn ra.
! She work in a bank. → She works in a bank. — Chủ ngữ he/she/it ở hiện tại đơn phải thêm -s/-es.
! I am knowing him. → I know him. — Động từ chỉ trạng thái không dùng dạng tiếp diễn.
t: He usually ___ (get) up at six.|gets|Thói quen với "usually" → hiện tại đơn, thêm -s.
t: Be quiet! The baby ___ (sleep).|is sleeping|Việc đang diễn ra ngay lúc nói → am/is/are + V-ing.
t: She ___ (not / like) spicy food.|does not like / doesn't like|Phủ định hiện tại đơn với she: does not + V.
s: I usually have breakfast at seven.|Tôi thường ăn sáng lúc bảy giờ.
s: What are you doing right now?|Bây giờ bạn đang làm gì vậy?
s: My brother works for a big company.|Anh trai tôi làm cho một công ty lớn.
s: We are waiting for the bus.|Chúng tôi đang đợi xe buýt.
p: Đuôi -s/-es có ba cách đọc: /s/ sau âm vô thanh, /z/ sau âm hữu thanh, /ɪz/ sau âm xuýt. Đừng bỏ âm cuối này khi nói.|works, plays, watches
# past|A2|Quá khứ đơn|Past simple|S + V2/V-ed  ·  S + did not + V  ·  Did + S + V?
> Dùng cho việc đã xảy ra và kết thúc ở một thời điểm xác định trong quá khứ. Dấu hiệu: yesterday, last week, in 2019, two days ago.
> Câu phủ định và câu hỏi dùng did, khi đó động từ trở về nguyên mẫu.
> Nhiều động từ thường gặp là bất quy tắc: go → went, see → saw, buy → bought, take → took.
e: We visited Hue last summer.|Mùa hè năm ngoái chúng tôi đã thăm Huế.
e: I didn't see him yesterday.|Hôm qua tôi không gặp anh ấy.
q: She ___ a new phone last week.|buys;bought;buyed;has bought|1|"last week" → quá khứ đơn; buy là động từ bất quy tắc: bought.
q: Where ___ you go on holiday?|do;did;were;have|1|Câu hỏi quá khứ đơn với động từ thường dùng "did".
q: They ___ to the party because they were tired.|didn't came;not came;didn't come;don't came|2|Sau "didn't" động từ ở dạng nguyên mẫu: come.
q: I ___ my keys two days ago.|lose;have lost;lost;was lose|2|"two days ago" là thời điểm xác định → quá khứ đơn: lost.
= Tiếng Việt thêm "đã" hoặc chỉ dựa vào từ chỉ thời gian; tiếng Anh phải đổi động từ sang dạng quá khứ.
! Yesterday I go to the market. → Yesterday I went to the market. — Có "yesterday" thì động từ phải ở quá khứ.
! Did you went there? → Did you go there? — Đã có "did" thì động từ trở về nguyên mẫu.
t: We ___ (have) dinner at home last night.|had|have là động từ bất quy tắc: had.
t: She ___ (not / call) me yesterday.|did not call / didn't call|Phủ định quá khứ đơn: did not + V nguyên mẫu.
t: I ___ (see) that film two weeks ago.|saw|see → saw.
s: I went to bed late last night.|Tối qua tôi đi ngủ muộn.
s: Did you have a good weekend?|Cuối tuần của bạn có vui không?
s: She didn't come to the meeting.|Cô ấy đã không đến cuộc họp.
s: We met at university ten years ago.|Chúng tôi gặp nhau ở đại học mười năm trước.
p: Đuôi -ed có ba cách đọc: /t/ sau âm vô thanh, /d/ sau âm hữu thanh, /ɪd/ sau t và d. Không đọc thành một âm tiết riêng trừ trường hợp /ɪd/.|worked, played, wanted
# compare|A2|So sánh hơn và so sánh nhất|Comparatives and superlatives|adj-er / more + adj + than  ·  the adj-est / the most + adj
> Tính từ ngắn: thêm -er và -est (tall → taller → the tallest).
> Tính từ dài từ hai âm tiết trở lên: dùng more và the most (expensive → more expensive → the most expensive).
> Bất quy tắc: good → better → the best; bad → worse → the worst; far → farther → the farthest.
e: This phone is cheaper than that one.|Điện thoại này rẻ hơn cái kia.
e: It is the most interesting book I have read.|Đó là cuốn sách thú vị nhất tôi từng đọc.
q: My sister is ___ than me.|more tall;taller;tallest;the taller|1|"tall" là tính từ ngắn → taller than.
q: This is ___ restaurant in town.|the better;the best;the most good;best|1|"good" bất quy tắc; so sánh nhất là "the best".
q: Travelling by plane is ___ than by bus.|expensiver;most expensive;more expensive;the more expensive|2|"expensive" là tính từ dài → more expensive than.
q: Today the weather is ___ than yesterday.|badder;worse;worst;more bad|1|"bad" bất quy tắc; so sánh hơn là "worse".
= Tiếng Việt chỉ thêm "hơn" và "nhất" sau tính từ; tiếng Anh phải đổi đuôi tính từ hoặc thêm more/most tùy độ dài của từ.
! She is more tall than me. → She is taller than me. — Tính từ ngắn dùng -er, không dùng more.
! This is the most cheap one. → This is the cheapest one. — Tính từ ngắn dùng -est.
t: This road is ___ (busy) than that one.|busier|Tính từ tận cùng bằng -y: đổi y thành i rồi thêm -er.
t: She is the ___ (good) student in the class.|best|good → better → the best.
t: Is English ___ (difficult) than Chinese?|more difficult|Tính từ dài dùng more.
s: My new job is better than my old one.|Công việc mới của tôi tốt hơn công việc cũ.
s: This is the cheapest hotel in the city.|Đây là khách sạn rẻ nhất thành phố.
s: Today is hotter than yesterday.|Hôm nay nóng hơn hôm qua.
s: Which is more expensive, the bus or the train?|Xe buýt hay tàu hỏa đắt hơn?
p: Trong câu so sánh, "than" được đọc nhẹ thành /ðən/, còn tính từ được nhấn mạnh.|taller than me, better than before
# quantity|A2|Much, many, some, any|Quantifiers|many + danh từ đếm được  ·  much + danh từ không đếm được
> many dùng với danh từ đếm được số nhiều; much dùng với danh từ không đếm được.
> some thường dùng trong câu khẳng định và lời mời; any thường dùng trong câu phủ định và câu hỏi.
> a few đi với danh từ đếm được; a little đi với danh từ không đếm được.
e: How many people came?|Có bao nhiêu người đã đến?
e: There isn't any milk left.|Không còn chút sữa nào.
q: How ___ time do we have?|many;much;few;any|1|"time" không đếm được → much.
q: There aren't ___ chairs in the room.|some;much;any;a little|2|Câu phủ định với danh từ đếm được số nhiều → any.
q: I have ___ friends in Da Nang.|a little;much;a few;any|2|"friends" đếm được → a few.
q: Would you like ___ tea?|some;any;many;a few|0|Lời mời dùng "some" dù là câu hỏi.
= Tiếng Việt dùng "nhiều" cho mọi danh từ; tiếng Anh phải chọn many hay much tùy danh từ đếm được hay không.
! How much people are there? → How many people are there? — people là danh từ đếm được số nhiều.
! I don't have some money. → I don't have any money. — Câu phủ định dùng any.
t: How ___ eggs do we need?|many|eggs đếm được → many.
t: There isn't ___ sugar in my coffee.|any|Câu phủ định → any.
t: Could I have ___ water, please?|some|Lời yêu cầu lịch sự dùng some.
s: How much does this cost?|Cái này giá bao nhiêu?
s: I don't have much time today.|Hôm nay tôi không có nhiều thời gian.
s: There are a few shops near my house.|Có vài cửa hàng gần nhà tôi.
s: Do you have any questions?|Bạn có câu hỏi nào không?
p: Chú ý phân biệt nguyên âm ngắn /ʌ/ trong much và /e/ trong many.|much, many, money
# future|A2|Will và be going to|Will vs be going to|S + will + V  ·  S + am/is/are going to + V
> will dùng cho quyết định ngay lúc nói, lời hứa, lời đề nghị và dự đoán theo ý kiến.
> be going to dùng cho kế hoạch đã định trước và dự đoán dựa trên dấu hiệu nhìn thấy được.
e: The phone is ringing. I'll answer it.|Điện thoại đang reo. Để tôi nghe. (quyết định tức thì)
e: I'm going to visit my grandparents this weekend.|Cuối tuần này tôi sẽ đi thăm ông bà. (đã lên kế hoạch)
q: Look at those black clouds. It ___ rain.|will;is going to;goes to;is|1|Có dấu hiệu rõ ràng (mây đen) → be going to.
q: "I'm cold." "I ___ close the window."|am going to;will;going to;am|1|Quyết định ngay lúc nói → will.
q: We have bought the tickets. We ___ fly to Hanoi on Friday.|will;are going to;go;flew|1|Kế hoạch đã định trước → be going to.
q: I promise I ___ tell anyone.|am not going to;won't;don't;not|1|Lời hứa → will; phủ định là won't.
= Tiếng Việt dùng "sẽ" cho cả hai trường hợp; tiếng Anh tách kế hoạch có sẵn (be going to) và quyết định tức thì (will).
! I will to call you. → I will call you. — Sau will là động từ nguyên mẫu không có to.
! I going to study tonight. → I am going to study tonight. — Không được bỏ am/is/are.
t: Don't worry, I ___ (help) you.|will help / 'll help|Lời đề nghị giúp ngay lúc nói → will.
t: She ___ (start) a new job next month. It is already arranged.|is going to start|Kế hoạch đã định → be going to.
t: I think it ___ (be) sunny tomorrow.|will be|Dự đoán theo ý kiến với "I think" → will.
s: I'm going to cook dinner tonight.|Tối nay tôi sẽ nấu bữa tối.
s: I'll call you back in five minutes.|Năm phút nữa tôi sẽ gọi lại cho bạn.
s: What are you going to do this weekend?|Cuối tuần này bạn định làm gì?
s: I think you will like this place.|Tôi nghĩ bạn sẽ thích nơi này.
p: Khi nói, will gần như luôn được rút gọn thành 'll; going to trong lời nói nhanh nghe như "gonna".|I'll call you, we'll see, I'm going to try
# perfect|B1|Hiện tại hoàn thành và quá khứ đơn|Present perfect vs past simple|S + have/has + V3
> Hiện tại hoàn thành nối quá khứ với hiện tại: việc bắt đầu trong quá khứ và còn tiếp diễn, trải nghiệm, hoặc việc vừa xảy ra có kết quả ở hiện tại.
> Dấu hiệu: for, since, ever, never, just, already, yet.
> Khi có thời điểm quá khứ xác định (yesterday, in 2020, last year) thì phải dùng quá khứ đơn.
e: I have lived here for five years.|Tôi đã sống ở đây được năm năm. (vẫn đang sống)
e: I lived in Hue in 2015.|Năm 2015 tôi sống ở Huế. (đã kết thúc)
q: She ___ in this company since 2020.|works;worked;has worked;is working|2|"since 2020" và việc còn tiếp diễn → hiện tại hoàn thành.
q: I ___ that film last night.|have seen;saw;see;had seen|1|"last night" là thời điểm xác định → quá khứ đơn.
q: ___ you ever ___ sushi?|Did / eat;Have / eaten;Do / eat;Have / ate|1|Hỏi về trải nghiệm với "ever" → Have you ever eaten.
q: We ___ finished the report yet.|didn't;haven't;don't;hadn't|1|"yet" trong câu phủ định → hiện tại hoàn thành: haven't finished.
= Tiếng Việt không có thì tương đương; "đã ... được 5 năm" (còn tiếp diễn) phải dùng hiện tại hoàn thành, không dùng quá khứ đơn.
! I have seen him yesterday. → I saw him yesterday. — Có thời điểm xác định thì dùng quá khứ đơn.
! I live here since 2020. → I have lived here since 2020. — since/for với việc còn tiếp diễn → hiện tại hoàn thành.
t: I ___ (know) her for ten years.|have known|Việc bắt đầu trong quá khứ và còn tiếp diễn.
t: He ___ (just / finish) his homework.|has just finished|"just" đứng giữa has và V3.
t: We ___ (go) to Da Lat in 2022.|went|Năm 2022 là thời điểm xác định → quá khứ đơn.
s: I have never been to Japan.|Tôi chưa bao giờ đến Nhật Bản.
s: How long have you worked here?|Bạn làm ở đây bao lâu rồi?
s: She has already finished her work.|Cô ấy đã làm xong việc rồi.
s: I haven't seen him since Monday.|Tôi chưa gặp anh ấy từ thứ Hai.
p: have và has thường được rút gọn và đọc nhẹ: I've /aɪv/, she's /ʃiːz/. Trọng âm rơi vào động từ chính.|I've finished, she's gone, we've met
# conditional|B1|Câu điều kiện loại 1 và loại 2|First and second conditionals|If + hiện tại đơn, will + V  ·  If + quá khứ đơn, would + V
> Loại 1: điều kiện có thể xảy ra ở hiện tại hoặc tương lai.
> Loại 2: điều kiện không có thật hoặc khó xảy ra ở hiện tại. Với động từ be, dùng were cho mọi ngôi trong văn trang trọng.
> Không dùng will hoặc would trong mệnh đề if.
e: If it rains, we will stay at home.|Nếu trời mưa, chúng tôi sẽ ở nhà.
e: If I had more time, I would learn Japanese.|Nếu có nhiều thời gian hơn, tôi sẽ học tiếng Nhật.
q: If you ___ hard, you will pass the exam.|study;will study;studied;would study|0|Loại 1: mệnh đề if dùng hiện tại đơn.
q: If I ___ you, I would accept the job.|am;was being;were;will be|2|Loại 2 với be → were: "If I were you".
q: We ___ late if we don't leave now.|are;would be;will be;were|2|Loại 1: mệnh đề chính dùng will + V.
q: If she ___ a car, she would drive to work.|has;had;will have;would have|1|Loại 2: mệnh đề if dùng quá khứ đơn.
= Tiếng Việt dùng "nếu ... thì" cho mọi loại; tiếng Anh đổi thì của động từ để cho biết điều kiện có thật hay không.
! If it will rain, I will stay home. → If it rains, I will stay home. — Không dùng will trong mệnh đề if.
! If I am you, I would go. → If I were you, I would go. — Điều kiện không có thật dùng quá khứ.
t: If I ___ (see) him, I will tell him.|see|Loại 1: mệnh đề if dùng hiện tại đơn.
t: If I ___ (win) the lottery, I would buy a house.|won|Loại 2: mệnh đề if dùng quá khứ đơn.
t: What ___ you do if you lost your phone?|would|Loại 2: mệnh đề chính dùng would + V.
s: If you need help, I will be here.|Nếu bạn cần giúp, tôi sẽ ở đây.
s: If I were you, I would talk to her.|Nếu tôi là bạn, tôi sẽ nói chuyện với cô ấy.
s: We will be late if we don't hurry.|Chúng ta sẽ muộn nếu không nhanh lên.
s: What would you do if you had more free time?|Bạn sẽ làm gì nếu có nhiều thời gian rảnh hơn?
p: would rút gọn thành 'd và đọc rất nhẹ: I'd /aɪd/. Đừng nhầm với had cũng rút gọn thành 'd.|I'd go, she'd like, we'd help
# passive|B1|Câu bị động|Passive voice|S + be + V3 (+ by ...)
> Dùng khi hành động quan trọng hơn người thực hiện, hoặc khi không biết hoặc không cần nêu người thực hiện.
> Động từ be chia theo thì của câu: is made, was made, has been made, will be made, can be made.
e: This bridge was built in 2010.|Cây cầu này được xây năm 2010.
e: English is spoken all over the world.|Tiếng Anh được nói trên khắp thế giới.
q: The letters ___ every morning.|deliver;are delivered;are delivering;delivered|1|Hiện tại đơn bị động: are + V3.
q: The window ___ by a ball yesterday.|was broken;broke;is broken;has broken|0|"yesterday" → quá khứ đơn bị động: was broken.
q: The report must ___ by Friday.|finish;be finished;finished;be finishing|1|Bị động sau động từ khuyết thiếu: must be + V3.
q: A new hospital ___ in our town next year.|will build;will be built;is built;builds|1|Tương lai bị động: will be + V3.
= Tiếng Việt dùng "được" hoặc "bị"; tiếng Anh dùng be + V3 và không phân biệt nghĩa tốt hay xấu.
! The house built in 1990. → The house was built in 1990. — Câu bị động không được thiếu động từ be.
! The room is cleaned yesterday. → The room was cleaned yesterday. — be phải chia đúng thì.
t: Rice ___ (grow) in many Asian countries.|is grown|Hiện tại đơn bị động: is + V3.
t: My bike ___ (steal) last week.|was stolen|Quá khứ đơn bị động: was + V3.
t: The results will ___ (announce) tomorrow.|be announced|Sau will: be + V3.
s: This phone was made in Vietnam.|Điện thoại này được sản xuất tại Việt Nam.
s: Breakfast is served from six to nine.|Bữa sáng được phục vụ từ sáu đến chín giờ.
s: The meeting has been cancelled.|Cuộc họp đã bị hủy.
s: When was this bridge built?|Cây cầu này được xây khi nào?
p: was và were trong câu bị động được đọc nhẹ /wəz/, /wər/; trọng âm rơi vào động từ V3.|was built, were made, is spoken
# relative|B1|Mệnh đề quan hệ|Relative clauses|who / which / that / whose / where
> who dùng cho người; which dùng cho vật; that có thể thay cho who hoặc which trong mệnh đề xác định.
> whose chỉ sự sở hữu; where chỉ nơi chốn.
> Có thể lược bỏ đại từ quan hệ khi nó làm tân ngữ: the book (that) I bought.
e: The woman who lives next door is a doctor.|Người phụ nữ sống nhà bên là bác sĩ.
e: This is the café where we first met.|Đây là quán cà phê nơi chúng tôi gặp nhau lần đầu.
q: The man ___ car was stolen called the police.|who;which;whose;that|2|Chỉ sự sở hữu (xe của người đàn ông) → whose.
q: The film ___ we watched last night was boring.|who;which;where;whose|1|"film" là vật → which (hoặc that).
q: That's the hotel ___ we stayed last year.|which;where;who;whose|1|Chỉ nơi chốn và sau đó là một mệnh đề đầy đủ → where.
q: People ___ exercise regularly are healthier.|which;whose;who;where|2|"People" là người → who.
= Tiếng Việt dùng "mà" hoặc bỏ luôn; tiếng Anh phải chọn who, which, where hay whose tùy danh từ đứng trước.
! The man which lives here is my uncle. → The man who lives here is my uncle. — Người dùng who.
! The book that I bought it is good. → The book that I bought is good. — Không lặp lại tân ngữ "it".
t: I have a friend ___ speaks four languages.|who / that|Chỉ người, làm chủ ngữ → who (hoặc that).
t: This is the shop ___ I bought my phone.|where|Chỉ nơi chốn → where.
t: She is the woman ___ son won the prize.|whose|Chỉ sở hữu → whose.
s: The people who live next door are very friendly.|Những người sống nhà bên rất thân thiện.
s: Is this the bag that you lost?|Đây có phải cái túi bạn làm mất không?
s: That is the restaurant where we had dinner.|Đó là nhà hàng nơi chúng tôi đã ăn tối.
s: I know someone who can help you.|Tôi biết một người có thể giúp bạn.
p: Đại từ quan hệ who, which, that được đọc nhẹ và nối liền với từ đứng sau, không ngắt nghỉ.|the man who lives here, the book that I bought
# gerund|B1|V-ing hay to V|Gerund or infinitive|enjoy + V-ing  ·  want + to V
> Theo sau bởi V-ing: enjoy, finish, avoid, mind, suggest, keep, và sau giới từ (interested in, good at).
> Theo sau bởi to V: want, decide, hope, plan, promise, need, would like.
> V-ing có thể làm chủ ngữ của câu: Swimming is good for you.
e: I enjoy reading in the evening.|Tôi thích đọc sách vào buổi tối.
e: She decided to change her job.|Cô ấy quyết định đổi việc.
q: He avoids ___ about his past.|to talk;talking;talk;talked|1|avoid + V-ing.
q: We hope ___ you again soon.|seeing;see;to see;saw|2|hope + to V.
q: She is interested in ___ abroad.|study;to study;studying;studied|2|Sau giới từ "in" dùng V-ing.
q: Would you mind ___ the door?|to close;close;closing;closed|2|mind + V-ing.
= Tiếng Việt đặt hai động từ liền nhau ("thích đọc", "muốn đi"); tiếng Anh phải chọn V-ing hay to V tùy động từ đứng trước.
! I enjoy to read. → I enjoy reading. — enjoy + V-ing.
! I want going home. → I want to go home. — want + to V.
t: She finished ___ (write) the report.|writing|finish + V-ing.
t: They decided ___ (move) to Da Nang.|to move|decide + to V.
t: I'm good at ___ (cook).|cooking|Sau giới từ dùng V-ing.
s: I enjoy listening to music.|Tôi thích nghe nhạc.
s: I want to improve my English.|Tôi muốn cải thiện tiếng Anh của mình.
s: Thank you for helping me.|Cảm ơn bạn đã giúp tôi.
s: Would you like to join us?|Bạn có muốn tham gia cùng chúng tôi không?
p: Đuôi -ing đọc là /ɪŋ/ với âm mũi cuối, không đọc thành /in/ và không thêm âm /g/ rõ ở cuối.|reading, working, going
# third|B2|Câu điều kiện loại 3 và wish|Third conditional and wish|If + had + V3, would have + V3  ·  wish + had + V3
> Loại 3 nói về điều không có thật trong quá khứ và kết quả tưởng tượng của nó.
> wish + quá khứ hoàn thành diễn tả sự tiếc nuối về quá khứ; wish + quá khứ đơn diễn tả mong muốn trái với hiện tại.
e: If I had studied harder, I would have passed.|Nếu tôi học chăm hơn thì tôi đã đậu rồi.
e: I wish I had taken that job.|Ước gì tôi đã nhận công việc đó.
q: If we ___ earlier, we wouldn't have missed the train.|left;had left;have left;would leave|1|Loại 3: mệnh đề if dùng had + V3.
q: She would have called you if she ___ your number.|had;has had;had had;would have|2|Loại 3 với động từ have: had had.
q: I wish I ___ more when I was young.|travel;travelled;had travelled;would travel|2|Tiếc nuối về quá khứ → wish + had + V3.
q: I wish I ___ speak French.|can;could;had could;will|1|Mong muốn trái với hiện tại → wish + quá khứ: could.
= Tiếng Việt nói "giá mà", "nếu hồi đó ... thì đã ..."; tiếng Anh thể hiện ý không có thật trong quá khứ bằng had + V3 và would have + V3.
! If I would have known, I would have come. → If I had known, I would have come. — Không dùng would trong mệnh đề if.
! I wish I studied harder last year. → I wish I had studied harder last year. — Tiếc nuối về quá khứ dùng had + V3.
t: If you ___ (tell) me, I would have helped you.|had told|Loại 3: if + had + V3.
t: If it hadn't rained, we ___ (go) to the beach.|would have gone|Loại 3: would have + V3.
t: I wish I ___ (not / say) that yesterday.|had not said / hadn't said|Tiếc nuối về quá khứ.
s: If I had known, I would have told you.|Nếu tôi biết thì tôi đã nói với bạn rồi.
s: I wish I had started learning English earlier.|Ước gì tôi đã bắt đầu học tiếng Anh sớm hơn.
s: We would have won if we had played better.|Chúng tôi đã thắng nếu chơi tốt hơn.
s: What would you have done in my situation?|Bạn sẽ làm gì nếu ở vào hoàn cảnh của tôi?
p: would have nói nhanh thành would've /ˈwʊdəv/, hadn't thành /ˈhædnt/. Nghe quen dạng rút gọn sẽ giúp bạn hiểu người bản ngữ.|would've gone, could've been, hadn't known
# reported|B2|Câu tường thuật|Reported speech|said (that) + lùi một thì
> Khi tường thuật, động từ thường lùi một thì: hiện tại → quá khứ, quá khứ đơn → quá khứ hoàn thành, will → would, can → could.
> Đổi đại từ và từ chỉ thời gian: today → that day, tomorrow → the next day, here → there.
> Câu hỏi tường thuật dùng trật tự câu khẳng định, không đảo trợ động từ.
e: "I am tired," she said. → She said she was tired.|Cô ấy nói rằng cô ấy mệt.
e: "Where do you live?" → He asked me where I lived.|Anh ấy hỏi tôi sống ở đâu.
q: "I will help you." → He said he ___ help me.|will;would;can;had|1|will lùi thành would.
q: "Do you like coffee?" → She asked me ___ coffee.|do I like;if I liked;did I like;that I like|1|Câu hỏi Yes/No tường thuật dùng if + trật tự khẳng định, lùi thì.
q: "I have finished." → He said he ___.|has finished;finished;had finished;was finishing|2|Hiện tại hoàn thành lùi thành quá khứ hoàn thành.
q: She asked me where ___.|did I work;I worked;do I work;worked I|1|Câu hỏi tường thuật không đảo trợ động từ: where I worked.
= Tiếng Việt chỉ thêm "rằng" và giữ nguyên câu; tiếng Anh phải lùi thì, đổi đại từ và từ chỉ thời gian.
! He said me that he was busy. → He told me that he was busy. — say không đi trực tiếp với người; dùng tell + người.
! She asked where did I live. → She asked where I lived. — Câu hỏi tường thuật không đảo ngữ.
t: "I am tired." → She said she ___ tired.|was|am lùi thành was.
t: "I can swim." → He said he ___ swim.|could|can lùi thành could.
t: "Where is the station?" → He asked where the station ___.|was|Trật tự khẳng định, lùi thì.
s: She said she was very busy.|Cô ấy nói rằng cô ấy rất bận.
s: He told me he would call later.|Anh ấy bảo tôi anh ấy sẽ gọi sau.
s: They asked me where I lived.|Họ hỏi tôi sống ở đâu.
s: She asked if I could help her.|Cô ấy hỏi tôi có thể giúp cô ấy không.
p: said đọc là /sed/, không phải /seɪd/; told có âm /oʊ/ dài.|said, told, asked
# modalperfect|B2|Động từ khuyết thiếu + have + V3|Modal perfects|should / must / might / can't + have + V3
> should have + V3: lẽ ra nên làm nhưng đã không làm.
> must have + V3: suy đoán chắc chắn về quá khứ; can't have + V3: chắc chắn đã không xảy ra.
> might have + V3: có thể đã xảy ra, không chắc.
e: You should have told me earlier.|Lẽ ra bạn nên nói với tôi sớm hơn.
e: He must have forgotten the meeting.|Chắc hẳn anh ấy đã quên cuộc họp.
q: The ground is wet. It ___ last night.|should have rained;must have rained;can't have rained;must rain|1|Có bằng chứng → suy đoán chắc chắn về quá khứ: must have + V3.
q: I failed the test. I ___ harder.|must have studied;should have studied;might study;can't have studied|1|Tiếc vì đã không làm → should have + V3.
q: She ___ the email. She was offline all day.|must have sent;should have sent;can't have sent;might send|2|Chắc chắn đã không xảy ra → can't have + V3.
q: I'm not sure where he is. He ___ home.|must have gone;might have gone;should go;can't go|1|Không chắc → might have + V3.
= Tiếng Việt nói "lẽ ra", "chắc là đã", "có lẽ đã"; tiếng Anh dùng should have, must have, might have + V3.
! You should told me. → You should have told me. — Nói về quá khứ phải có have + V3.
! He must forgot it. → He must have forgotten it. — must + have + V3.
t: I'm sorry, I should ___ (call) you earlier.|have called|should have + V3.
t: She isn't here. She must ___ (go) home.|have gone|Suy đoán chắc chắn về quá khứ.
t: He might ___ (miss) the bus.|have missed|Có thể đã xảy ra.
s: You should have asked me first.|Lẽ ra bạn nên hỏi tôi trước.
s: He must have left his phone at home.|Chắc hẳn anh ấy đã để quên điện thoại ở nhà.
s: I might have made a mistake.|Có thể tôi đã mắc lỗi.
s: She can't have forgotten our meeting.|Cô ấy không thể nào quên cuộc hẹn của chúng ta được.
p: should have, must have, might have nói nhanh thành should've, must've, might've với âm /əv/ nhẹ ở cuối.|should've called, must've forgotten, might've missed
# linking|B2|Từ nối chỉ sự tương phản|Linking words of contrast|although + mệnh đề  ·  despite + danh từ/V-ing  ·  However, + câu
> although, even though, whereas đi với một mệnh đề (có chủ ngữ và động từ).
> despite, in spite of đi với danh từ hoặc V-ing.
> however, nevertheless đứng đầu câu mới và theo sau là dấu phẩy.
e: Although it was raining, we went out.|Mặc dù trời mưa, chúng tôi vẫn ra ngoài.
e: Despite the rain, we went out.|Bất chấp cơn mưa, chúng tôi vẫn ra ngoài.
q: ___ being tired, she finished the report.|Although;Despite;However;Whereas|1|Sau chỗ trống là V-ing → despite.
q: ___ he is rich, he lives simply.|Despite;In spite of;Although;However|2|Sau chỗ trống là một mệnh đề → although.
q: The plan is expensive. ___, it is the best option.|Although;Despite;However;Whereas|2|Mở đầu câu mới, theo sau là dấu phẩy → However.
q: I prefer tea, ___ my husband prefers coffee.|despite;however;whereas;in spite of|2|So sánh đối lập hai mệnh đề trong cùng một câu → whereas.
= "Mặc dù ... nhưng" trong tiếng Việt dùng cả hai từ; tiếng Anh chỉ dùng một: although HOẶC but, không dùng cả hai.
! Although it rained, but we went out. → Although it rained, we went out. — Không dùng although và but trong cùng một câu.
! Despite it was late, he kept working. → Although it was late, he kept working. — despite không đi với mệnh đề.
t: ___ the traffic, we arrived on time.|Despite / In spite of|Sau chỗ trống là danh từ.
t: ___ she was ill, she went to work.|Although / Even though|Sau chỗ trống là mệnh đề.
t: He is rich. ___, he is not happy.|However / Nevertheless|Đầu câu mới, có dấu phẩy.
s: Although I was tired, I finished the work.|Mặc dù mệt, tôi vẫn làm xong việc.
s: Despite the bad weather, we enjoyed the trip.|Bất chấp thời tiết xấu, chúng tôi vẫn thích chuyến đi.
s: The food was good. However, the service was slow.|Đồ ăn ngon. Tuy nhiên, phục vụ chậm.
s: I like the city, whereas my wife prefers the countryside.|Tôi thích thành phố, trong khi vợ tôi thích nông thôn hơn.
p: Trọng âm của các từ nối: although /ɔːlˈðoʊ/ và despite /dɪˈspaɪt/ nhấn âm tiết thứ hai; however /haʊˈevər/ nhấn âm giữa.|although, despite, however
# inversion|B2|Đảo ngữ nhấn mạnh|Inversion for emphasis|Never / Not only / Hardly + trợ động từ + S + V
> Khi trạng từ phủ định đứng đầu câu (never, rarely, not only, hardly, under no circumstances), trợ động từ đảo lên trước chủ ngữ.
> Cấu trúc này dùng trong văn viết trang trọng và giúp tăng điểm ngữ pháp trong IELTS Writing.
e: Never have I seen such a beautiful place.|Chưa bao giờ tôi thấy một nơi đẹp như vậy.
e: Not only does he sing, but he also dances.|Anh ấy không chỉ hát mà còn nhảy.
q: Rarely ___ such a talented student.|I have met;have I met;I met;did I met|1|"Rarely" đứng đầu câu → đảo trợ động từ: have I met.
q: Not only ___ late, but he also forgot the documents.|he was;was he;he is;did he|1|Not only + be đảo lên trước chủ ngữ: was he.
q: Hardly ___ the house when it started to rain.|I had left;had I left;I left;did I left|1|Hardly + had + S + V3 ... when.
q: Under no circumstances ___ this door be opened.|should;it should;does;is|0|Đảo ngữ với động từ khuyết thiếu: should this door be opened.
= Tiếng Việt không đảo trật tự từ để nhấn mạnh; đây là cấu trúc trang trọng, chủ yếu gặp trong văn viết và bài nói chuẩn bị trước.
! Never I have seen this. → Never have I seen this. — Sau never đứng đầu câu phải đảo trợ động từ.
! Not only he is smart, but also kind. → Not only is he smart, but he is also kind. — Đảo "is" lên trước chủ ngữ.
t: Never ___ I heard such a strange story.|have|Never + have + S + V3.
t: Not only ___ she speak English, but she also speaks French.|does|Hiện tại đơn → mượn trợ động từ does.
t: Seldom ___ we see such kindness.|do|Seldom đứng đầu câu → đảo trợ động từ do.
s: Never have I been so happy.|Chưa bao giờ tôi hạnh phúc đến thế.
s: Not only is it cheap, but it is also good.|Nó không chỉ rẻ mà còn tốt.
s: Rarely do we get a chance like this.|Hiếm khi chúng ta có cơ hội như thế này.
s: Only then did I understand the problem.|Chỉ đến lúc đó tôi mới hiểu vấn đề.
p: Trong câu đảo ngữ, trạng từ phủ định đứng đầu được nhấn mạnh và lên giọng để tạo hiệu ứng.|Never have I seen this, Not only is it cheap
# be|A1|Động từ to be|The verb "to be"|I am  ·  he/she/it is  ·  you/we/they are
> Dùng to be để nói ai đó là ai, là gì, ở đâu, bao nhiêu tuổi, hoặc như thế nào.
> Phủ định: thêm not (I am not, he isn't, they aren't). Câu hỏi: đảo be lên trước chủ ngữ (Are you ...?).
> Dạng rút gọn rất thường gặp khi nói: I'm, you're, he's, she's, it's, we're, they're.
= Tiếng Việt nói "Tôi mệt", "Cô ấy đẹp" không cần động từ; tiếng Anh bắt buộc có to be: "I am tired", "She is beautiful".
! I tired. → I am tired. — Trước tính từ phải có to be.
! She are a teacher. → She is a teacher. — he/she/it đi với is.
e: I am a student.|Tôi là sinh viên.
e: They are not at home.|Họ không có ở nhà.
q: My parents ___ teachers.|is;am;are;be|2|Chủ ngữ số nhiều → are.
q: ___ she your sister?|Is;Are;Am;Does|0|Câu hỏi với she → Is.
q: I ___ from Vietnam.|is;am;are;be|1|I đi với am.
q: It ___ very hot today.|are;am;be;is|3|it đi với is.
t: We ___ (be) very happy today.|are|we đi với are.
t: He ___ (not / be) a doctor.|is not / isn't|Phủ định của is: is not.
t: ___ you tired?|Are|Câu hỏi với you → Are.
s: I am from Ho Chi Minh City.|Tôi đến từ Thành phố Hồ Chí Minh.
s: She is twenty-five years old.|Cô ấy hai mươi lăm tuổi.
s: Are you ready?|Bạn sẵn sàng chưa?
s: We are not late.|Chúng ta không bị muộn.
p: Dạng rút gọn là cách nói tự nhiên: I'm /aɪm/, he's /hiːz/, they're /ðer/. Chú ý đọc đủ âm cuối /z/ trong he's, she's.|I'm, he's, they're, isn't
# articles|A1|Mạo từ a, an, the|Articles: a, an, the|a/an + danh từ đếm được số ít  ·  the + thứ đã xác định
> a/an dùng khi nhắc đến một thứ lần đầu hoặc nói chung chung. Dùng an trước âm nguyên âm (an apple, an hour).
> the dùng khi cả người nói và người nghe đều biết đang nói đến cái nào, hoặc chỉ có một (the sun, the door).
> Không dùng mạo từ khi nói chung về danh từ số nhiều hoặc không đếm được: I like coffee. Dogs are friendly.
= Tiếng Việt không có mạo từ ("Tôi có xe"), nên người Việt rất hay bỏ sót a/an/the. Danh từ đếm được số ít trong tiếng Anh gần như luôn cần một từ đứng trước.
! I have car. → I have a car. — Danh từ đếm được số ít cần a/an.
! She is teacher. → She is a teacher. — Nghề nghiệp cần a/an.
e: I bought a book. The book is about history.|Tôi mua một cuốn sách. Cuốn sách đó nói về lịch sử.
e: Can you close the door?|Bạn đóng cửa giúp được không?
q: She is ___ engineer.|a;an;the;—|1|engineer bắt đầu bằng âm nguyên âm → an.
q: I have ___ dog. ___ dog is very friendly.|a / The;the / A;a / A;the / The|0|Lần đầu nhắc dùng a; lần sau đã xác định dùng the.
q: ___ sun rises in the east.|A;An;The;—|2|Chỉ có một mặt trời → the.
q: I like ___ music.|a;an;the;—|3|Nói chung về danh từ không đếm được → không dùng mạo từ.
t: He is ___ doctor.|a|Nghề nghiệp, âm phụ âm → a.
t: Could you open ___ window, please?|the|Cả hai đều biết cửa sổ nào → the.
t: I waited for ___ hour.|an|hour đọc bắt đầu bằng âm nguyên âm.
s: I have a question.|Tôi có một câu hỏi.
s: Where is the nearest bank?|Ngân hàng gần nhất ở đâu?
s: She works in an office.|Cô ấy làm việc trong một văn phòng.
s: The food here is very good.|Đồ ăn ở đây rất ngon.
p: a được đọc nhẹ là /ə/. the đọc là /ðə/ trước phụ âm và /ði/ trước nguyên âm. Âm /ð/ đặt lưỡi giữa hai hàm răng.|a book, the car, the apple
# questions|A1|Câu hỏi với Wh-|Wh- questions|Từ hỏi + trợ động từ + chủ ngữ + động từ?
> Các từ hỏi: what (gì), where (ở đâu), when (khi nào), who (ai), why (tại sao), how (như thế nào), how much/many (bao nhiêu).
> Trật tự: từ hỏi + do/does/did hoặc be + chủ ngữ + động từ chính.
> Khi who hoặc what là chủ ngữ thì không cần trợ động từ: Who called you?
= Tiếng Việt đặt từ hỏi ở cuối và không đổi trật tự ("Bạn sống ở đâu?"); tiếng Anh đưa từ hỏi lên đầu và phải có trợ động từ.
! Where you live? → Where do you live? — Thiếu trợ động từ do.
! What does she likes? → What does she like? — Sau does động từ không thêm -s.
e: Where do you work?|Bạn làm việc ở đâu?
e: What time does the shop open?|Mấy giờ cửa hàng mở cửa?
q: ___ do you live?|What;Where;Who;When|1|Hỏi nơi chốn → Where.
q: What ___ she do?|do;is;does;are|2|Chủ ngữ she → does.
q: ___ is your birthday?|When;Where;Who;How|0|Hỏi thời gian → When.
q: How ___ is this shirt?|many;much;long;old|1|Hỏi giá → How much.
t: Where ___ you from?|are|Câu hỏi với be và you.
t: What ___ you do yesterday?|did|Quá khứ → did.
t: ___ are you late? Because of the traffic.|Why|Câu trả lời bắt đầu bằng Because → hỏi Why.
s: What do you do?|Bạn làm nghề gì?
s: Where are you from?|Bạn đến từ đâu?
s: How long does it take?|Mất bao lâu?
s: Why are you learning English?|Tại sao bạn học tiếng Anh?
p: Câu hỏi Wh- xuống giọng ở cuối câu; câu hỏi Yes/No lên giọng ở cuối câu.|Where do you live, What do you do, Are you ready
# prepositions|A2|Giới từ in, on, at|Prepositions: in, on, at|at + giờ / điểm  ·  on + ngày / bề mặt  ·  in + tháng, năm / bên trong
> Thời gian: at dùng với giờ (at 7 o'clock, at night); on dùng với ngày (on Monday, on 5 May); in dùng với tháng, năm, mùa, buổi (in June, in 2024, in the morning).
> Nơi chốn: at chỉ một điểm (at the bus stop, at home); on chỉ trên bề mặt (on the table); in chỉ bên trong (in the room, in Hanoi).
= Tiếng Việt dùng "vào", "ở", "trên", "trong" khá tự do; tiếng Anh cố định theo loại thời gian và nơi chốn, nên phải học theo cụm.
! I was born in 5 May. → I was born on 5 May. — Ngày cụ thể dùng on.
! See you in Monday. → See you on Monday. — Thứ trong tuần dùng on.
e: The meeting is at 9 o'clock on Friday.|Cuộc họp lúc 9 giờ ngày thứ Sáu.
e: She lives in Da Nang.|Cô ấy sống ở Đà Nẵng.
q: I get up ___ 6 o'clock.|in;on;at;to|2|Giờ cụ thể → at.
q: My birthday is ___ July.|at;in;on;by|1|Tháng → in.
q: The keys are ___ the table.|in;at;on;to|2|Trên bề mặt → on.
q: We met ___ Saturday morning.|in;on;at;for|1|Có thứ trong tuần → on.
t: I'll see you ___ the weekend.|at / on|Anh-Anh nói at the weekend, Anh-Mỹ nói on the weekend.
t: He was born ___ 1998.|in|Năm → in.
t: She is waiting ___ the bus stop.|at|Một điểm cụ thể → at.
s: I usually study in the evening.|Tôi thường học vào buổi tối.
s: The shop closes at ten.|Cửa hàng đóng cửa lúc mười giờ.
s: I have a meeting on Monday.|Tôi có cuộc họp vào thứ Hai.
s: My phone is in my bag.|Điện thoại của tôi ở trong túi.
p: Giới từ thường được đọc nhẹ: at thành /ət/, in và on nối liền với từ đứng sau.|at seven, in the morning, on Monday
# modals|A2|Can, must, have to, should|Modal verbs|S + can / must / should + V  ·  S + have to + V
> can: có thể, có khả năng. could: lịch sự hơn khi nhờ vả hoặc khả năng trong quá khứ.
> must và have to: phải làm. mustn't: cấm làm. don't have to: không bắt buộc (làm cũng được, không cũng được).
> should: nên làm, dùng để khuyên.
= Tiếng Việt nói "không phải làm" cho cả hai nghĩa; tiếng Anh tách rõ: mustn't là cấm, don't have to là không cần.
! She can to swim. → She can swim. — Sau can, must, should là động từ nguyên mẫu không có to.
! He cans drive. → He can drive. — Động từ khuyết thiếu không thêm -s.
e: You mustn't smoke here.|Bạn không được hút thuốc ở đây.
e: You don't have to come if you are busy.|Bạn không cần đến nếu bạn bận.
q: You look tired. You ___ go to bed early.|should;mustn't;can't;don't have to|0|Lời khuyên → should.
q: It's Sunday tomorrow. I ___ get up early.|mustn't;don't have to;can't;should|1|Không bắt buộc → don't have to.
q: ___ you help me with this bag, please?|Must;Should;Could;Have|2|Nhờ vả lịch sự → Could.
q: You ___ park here. It is not allowed.|don't have to;mustn't;should;can|1|Bị cấm → mustn't.
t: I ___ speak three languages.|can|Khả năng → can.
t: Students ___ wear a uniform at this school. It is a rule.|must / have to|Quy định bắt buộc.
t: You ___ eat so much sugar. It is bad for you.|should not / shouldn't|Lời khuyên không nên.
s: Can you speak more slowly, please?|Bạn nói chậm hơn được không?
s: I have to work tomorrow.|Ngày mai tôi phải đi làm.
s: You should see a doctor.|Bạn nên đi khám bác sĩ.
s: You don't have to pay now.|Bạn không cần trả tiền ngay.
p: can trong câu khẳng định đọc nhẹ /kən/; can't đọc rõ và dài /kænt/. Nghe nhầm hai từ này sẽ hiểu ngược nghĩa. should đọc là /ʃʊd/, chữ l câm.|I can swim, I can't swim, should
# pastcont|A2|Quá khứ tiếp diễn|Past continuous|S + was/were + V-ing
> Diễn tả việc đang diễn ra tại một thời điểm trong quá khứ.
> Thường đi với quá khứ đơn: việc đang diễn ra (quá khứ tiếp diễn) thì việc khác xen vào (quá khứ đơn).
> when thường đi với việc xen vào; while thường đi với việc đang diễn ra.
= Tiếng Việt dùng "đang ... thì ..."; tiếng Anh chia hai thì khác nhau cho hai việc.
! When she called, I cooked. → When she called, I was cooking. — Việc đang diễn ra dùng was/were + V-ing.
! I was cook dinner. → I was cooking dinner. — Sau was/were phải là V-ing.
e: I was watching TV when the phone rang.|Tôi đang xem tivi thì điện thoại reo.
e: While we were walking, it started to rain.|Trong lúc chúng tôi đang đi bộ thì trời bắt đầu mưa.
q: What ___ you doing at 8 p.m. last night?|did;were;was;are|1|you đi với were.
q: I ___ a shower when you called.|had;was having;am having;have|1|Việc đang diễn ra → quá khứ tiếp diễn.
q: While she was driving, she ___ an accident.|was seeing;sees;saw;see|2|Việc xen vào → quá khứ đơn.
q: They ___ when I arrived.|slept;were sleeping;sleep;are sleeping|1|Việc đang diễn ra khi tôi đến.
t: He ___ (read) when I came in.|was reading|Quá khứ tiếp diễn với he.
t: We ___ (wait) for the bus when it started to rain.|were waiting|we đi với were.
t: I was walking home when I ___ (meet) an old friend.|met|Việc xen vào → quá khứ đơn.
s: I was sleeping when you called.|Tôi đang ngủ thì bạn gọi.
s: What were you doing yesterday evening?|Tối qua bạn đang làm gì?
s: It was raining when I left the house.|Trời đang mưa khi tôi ra khỏi nhà.
s: While I was cooking, he was cleaning.|Trong lúc tôi nấu ăn thì anh ấy dọn dẹp.
p: was và were đọc nhẹ /wəz/, /wər/; trọng âm rơi vào động từ V-ing.|I was working, they were sleeping
# frequency|A2|Trạng từ chỉ tần suất|Adverbs of frequency|always > usually > often > sometimes > rarely > never
> Trạng từ tần suất đứng trước động từ thường: I always get up early.
> Nhưng đứng sau động từ to be: She is always late.
> Câu hỏi về tần suất: How often do you ...? Trả lời: once a week, twice a month, every day.
= Tiếng Việt đặt "thường", "luôn" trước động từ giống tiếng Anh, nhưng với to be thì tiếng Anh đảo lại: "is always", không phải "always is".
! She always is late. → She is always late. — Trạng từ tần suất đứng sau to be.
! I go often to the gym. → I often go to the gym. — Đứng trước động từ thường.
e: I usually have lunch at noon.|Tôi thường ăn trưa lúc mười hai giờ.
e: He is never angry.|Anh ấy không bao giờ giận.
q: She ___ late for work.|is never;never is;never be;is never be|0|Sau to be → is never.
q: I ___ coffee in the morning.|drink always;always drink;am always drink;always drinking|1|Trước động từ thường → always drink.
q: How ___ do you exercise?|many;much;often;long|2|Hỏi tần suất → How often.
q: I go swimming ___ a week.|two;twice;second;two time|1|Hai lần một tuần → twice a week.
t: He ___ (usually / walk) to school.|usually walks|Trạng từ trước động từ, thêm -s.
t: They ___ (be / sometimes) late.|are sometimes|Trạng từ sau to be.
t: I visit my grandparents ___ a month.|once / twice|Một lần hoặc hai lần mỗi tháng.
s: I always have breakfast.|Tôi luôn ăn sáng.
s: How often do you go to the gym?|Bạn đi tập gym thường xuyên thế nào?
s: She is usually at home in the evening.|Buổi tối cô ấy thường ở nhà.
s: I sometimes work on Saturdays.|Thỉnh thoảng tôi làm việc vào thứ Bảy.
p: usually có ba âm tiết /ˈjuːʒuəli/ với âm /ʒ/; often có thể đọc /ˈɔːfən/, chữ t thường câm.|usually, often, sometimes
# tooenough|A2|Too và enough|Too and enough|too + tính từ  ·  tính từ + enough  ·  enough + danh từ
> too + tính từ: quá mức, mang nghĩa tiêu cực (too hot = nóng quá, không chịu được).
> tính từ + enough: đủ (old enough = đủ tuổi). enough + danh từ: đủ cái gì (enough money).
> Thường đi với to V: too tired to work, old enough to drive.
= "Quá" trong tiếng Việt có thể mang nghĩa khen ("đẹp quá"); too trong tiếng Anh luôn là mức gây vấn đề. Muốn khen thì dùng very hoặc so.
! She is too beautiful. → She is very beautiful. — too mang nghĩa tiêu cực; khen thì dùng very.
! He is enough tall. → He is tall enough. — enough đứng sau tính từ.
e: The coffee is too hot to drink.|Cà phê nóng quá, không uống được.
e: We don't have enough time.|Chúng ta không có đủ thời gian.
q: This bag is ___ heavy. I can't carry it.|enough;too;very much;so much|1|Mức gây vấn đề → too.
q: He isn't ___ to drive.|enough old;old enough;too old enough;enough of old|1|Tính từ + enough.
q: Do we have ___ for everyone?|chairs enough;enough chairs;too chairs;chairs too|1|enough + danh từ.
q: It is ___ late to call her now.|enough;too;too much;very much|1|too + tính từ + to V.
t: I'm ___ tired to go out tonight.|too|Mệt quá nên không đi được.
t: Is the room big ___ for ten people?|enough|Tính từ + enough.
t: We don't have ___ money to buy it.|enough|enough + danh từ.
s: This coffee is too sweet.|Cà phê này ngọt quá.
s: I don't have enough time.|Tôi không có đủ thời gian.
s: Is it warm enough for you?|Như vậy đã đủ ấm với bạn chưa?
s: He is too young to travel alone.|Cậu ấy còn quá nhỏ để đi một mình.
p: enough đọc là /ɪˈnʌf/, chữ gh đọc thành /f/ và trọng âm ở âm tiết thứ hai.|enough, too much, tough
# prescontfuture|A2|Hiện tại tiếp diễn chỉ tương lai|Present continuous for future plans|S + am/is/are + V-ing + thời gian tương lai
> Dùng hiện tại tiếp diễn cho kế hoạch đã sắp xếp chắc chắn với người khác: đã hẹn, đã đặt vé, đã ghi vào lịch.
> Luôn có từ chỉ thời gian tương lai hoặc ngữ cảnh rõ ràng: tonight, tomorrow, next week.
> Khác với be going to (ý định của riêng mình) và will (quyết định tức thì).
= Tiếng Việt chỉ nói "Tối nay tôi gặp anh ấy"; tiếng Anh dùng hiện tại tiếp diễn để cho biết cuộc hẹn đã được sắp xếp.
! I meet him tonight. → I am meeting him tonight. — Cuộc hẹn đã sắp xếp dùng hiện tại tiếp diễn.
! I am meet her tomorrow. → I am meeting her tomorrow. — Sau am/is/are phải là V-ing.
p: am, is, are thường rút gọn và nối với chủ ngữ; trọng âm rơi vào động từ và từ chỉ thời gian.|I'm meeting, we're flying, she's coming
e: I'm having dinner with a client tonight.|Tối nay tôi ăn tối với một khách hàng.
e: We're flying to Singapore on Monday.|Thứ Hai chúng tôi bay đi Singapore.
q: What ___ you doing this weekend?|do;are;will;did|1|Hỏi về kế hoạch đã sắp xếp → are you doing.
q: She ___ the dentist at 3 p.m. tomorrow. She made the appointment last week.|sees;will see;is seeing;saw|2|Lịch hẹn đã đặt → hiện tại tiếp diễn.
q: We ___ to Hanoi next Friday. We have the tickets.|fly;are flying;flew;flies|1|Đã có vé → hiện tại tiếp diễn.
q: I ___ anything tonight. Do you want to go out?|am not doing;don't do;didn't do;won't doing|0|Không có kế hoạch gì → am not doing.
t: They ___ (get) married in June.|are getting|Kế hoạch đã định → are + V-ing.
t: I ___ (not / work) tomorrow. It's my day off.|am not working / 'm not working|Phủ định: am not + V-ing.
t: What time ___ you leaving?|are|Câu hỏi với you → are.
s: I'm meeting a friend after work.|Tôi sẽ gặp một người bạn sau giờ làm.
s: Are you doing anything tomorrow?|Ngày mai bạn có bận gì không?
s: We're having a meeting at ten.|Chúng tôi có cuộc họp lúc mười giờ.
s: She isn't coming to the party.|Cô ấy sẽ không đến bữa tiệc.
# perfectintro|A2|Hiện tại hoàn thành: ever, never, just|Present perfect: ever, never, just|S + have/has + V3
> Dùng để nói về trải nghiệm trong đời mà không nói rõ khi nào: Have you ever ...? I have never ...
> just diễn tả việc vừa mới xảy ra. already là "rồi", yet là "chưa" (trong câu phủ định và câu hỏi).
> V3 của động từ có quy tắc là V-ed; động từ bất quy tắc phải học thuộc: be → been, go → gone, see → seen.
= Tiếng Việt dùng "đã từng", "chưa bao giờ", "vừa mới"; tiếng Anh dùng have/has + V3 cho tất cả những ý này.
! I never have been there. → I have never been there. — never đứng giữa have và V3.
! Did you ever eat sushi? → Have you ever eaten sushi? — Hỏi về trải nghiệm dùng hiện tại hoàn thành.
p: have và has đọc nhẹ, thường rút gọn: I've, he's. been đọc ngắn /bɪn/ khi nói nhanh.|I've been, she's just left, have you ever
e: I have never tried Korean food.|Tôi chưa bao giờ thử đồ ăn Hàn Quốc.
e: She has just arrived.|Cô ấy vừa mới đến.
q: Have you ever ___ to Thailand?|go;went;been;was|2|Have you ever + V3; "đã từng đến" dùng been.
q: I have ___ finished my lunch.|just;yet;ever;never yet|0|Vừa mới xong → just.
q: He ___ never driven a car.|have;has;is;did|1|he đi với has.
q: Have you done your homework ___?|just;never;yet;ever|2|Câu hỏi "chưa" → yet ở cuối câu.
t: I ___ (never / see) snow.|have never seen|have + never + V3.
t: She ___ (just / call) me.|has just called|has + just + V3.
t: ___ you ever met a famous person?|Have|Câu hỏi với you → Have.
s: Have you ever been abroad?|Bạn đã từng ra nước ngoài chưa?
s: I've never done this before.|Tôi chưa từng làm việc này trước đây.
s: He has just left the office.|Anh ấy vừa rời văn phòng.
s: I haven't finished yet.|Tôi chưa làm xong.
# irregular|A2|Động từ bất quy tắc thường gặp|Common irregular verbs|V1 → V2 → V3
> Khoảng 100 động từ dùng nhiều nhất trong tiếng Anh là bất quy tắc, nên phải thuộc để nói và nghe được.
> Nhóm không đổi: put – put – put, cut – cut – cut. Nhóm V2 và V3 giống nhau: buy – bought – bought, make – made – made.
> Nhóm ba dạng khác nhau: go – went – gone, see – saw – seen, take – took – taken, write – wrote – written.
= Tiếng Việt không đổi dạng động từ nên người Việt hay thêm -ed cho mọi động từ. Các động từ bất quy tắc nên học theo nhóm âm giống nhau.
! I buyed a new phone. → I bought a new phone. — buy là động từ bất quy tắc.
! She has went home. → She has gone home. — Sau has dùng V3: gone.
p: Nhiều V2 và V3 có cách đọc khó đoán: bought /bɔːt/, read (quá khứ) /red/, said /sed/, heard /hɜːrd/.|bought, read, said, heard
e: I went to the bank yesterday.|Hôm qua tôi đã đến ngân hàng.
e: Have you seen my keys?|Bạn có thấy chìa khóa của tôi không?
q: She ___ me an email last night.|sended;sent;send;sends|1|send → sent.
q: I have ___ this book twice.|read;readed;reading;reads|0|read – read – read (V3 đọc là /red/).
q: We ___ a lot of photos on holiday.|taked;taken;took;take|2|Quá khứ đơn của take là took.
q: He has ___ his wallet.|lose;losed;lost;losing|2|lose → lost → lost.
t: They ___ (come) home late last night.|came|come → came.
t: I have ___ (write) three emails this morning.|written|write → wrote → written.
t: She ___ (give) me a present yesterday.|gave|give → gave.
s: I bought it last week.|Tôi mua nó tuần trước.
s: We went there by bus.|Chúng tôi đến đó bằng xe buýt.
s: She told me the news.|Cô ấy báo tin cho tôi.
s: Have you eaten yet?|Bạn ăn chưa?
# pronouns|A2|Đại từ tân ngữ và đại từ sở hữu|Object and possessive pronouns|me, him, her, us, them  ·  mine, yours, his, hers, ours, theirs
> Đại từ tân ngữ đứng sau động từ hoặc giới từ: She called me. This is for him.
> Tính từ sở hữu đứng trước danh từ: my book. Đại từ sở hữu đứng một mình thay cho cả cụm: This book is mine.
> Không dùng mạo từ trước đại từ sở hữu: a friend of mine, không nói "a my friend".
= Tiếng Việt dùng cùng một từ "tôi", "anh ấy" ở mọi vị trí; tiếng Anh đổi dạng theo vai trò trong câu: I – me – my – mine.
! She gave the book to I. → She gave the book to me. — Sau giới từ dùng đại từ tân ngữ.
! This bag is my. → This bag is mine. — Đứng một mình dùng đại từ sở hữu.
p: him, her, them trong lời nói nhanh thường mất âm đầu và nối vào động từ: tell him nghe như "tellim".|tell him, give her, ask them
e: Can you help me?|Bạn giúp tôi được không?
e: Is this pen yours?|Cây bút này của bạn à?
q: I saw ___ at the market yesterday.|they;their;them;theirs|2|Sau động từ dùng tân ngữ → them.
q: That car is ___.|our;ours;us;we|1|Đứng một mình → ours.
q: Please give this to ___.|she;hers;her;she's|2|Sau giới từ to → her.
q: My phone is old, but ___ is new.|your;you;yours;you're|2|Thay cho "your phone" → yours.
t: Can you send ___ the file? (cho tôi)|me|Tân ngữ của send → me.
t: This isn't my coat. ___ is black. (của tôi)|Mine|Đại từ sở hữu đứng đầu câu.
t: We invited ___ to dinner. (họ)|them|Tân ngữ → them.
s: Can you tell me the time?|Bạn cho tôi biết mấy giờ được không?
s: I gave him the report.|Tôi đã đưa anh ấy bản báo cáo.
s: Is this seat yours?|Chỗ này của bạn à?
s: She is a friend of mine.|Cô ấy là một người bạn của tôi.
# adverbs|A2|Trạng từ chỉ cách thức|Adverbs of manner|tính từ + -ly  ·  động từ + trạng từ
> Trạng từ mô tả cách một hành động diễn ra, thường tạo bằng tính từ + -ly: slow → slowly, careful → carefully.
> Bất quy tắc: good → well, fast → fast, hard → hard, late → late.
> Tính từ bổ nghĩa cho danh từ (a careful driver); trạng từ bổ nghĩa cho động từ (He drives carefully).
= Tiếng Việt dùng cùng một từ cho cả hai: "lái xe cẩn thận", "người cẩn thận". Tiếng Anh phải chọn careful hay carefully tùy bổ nghĩa cho danh từ hay động từ.
! She speaks English very good. → She speaks English very well. — Bổ nghĩa cho động từ dùng well.
! He works hardly. → He works hard. — hard vừa là tính từ vừa là trạng từ; hardly nghĩa là "hầu như không".
p: Đuôi -ly đọc là /li/ và không mang trọng âm; trọng âm giữ nguyên như ở tính từ gốc.|slowly, carefully, quickly
e: Please speak slowly.|Làm ơn nói chậm.
e: She did the job well.|Cô ấy làm việc đó tốt.
q: He drives very ___.|careful;carefully;care;more careful|1|Bổ nghĩa cho động từ drives → carefully.
q: She is a ___ singer.|well;good;goodly;best of|1|Bổ nghĩa cho danh từ singer → tính từ good.
q: They worked ___ all day.|hard;hardly;harder than;hardily|0|Trạng từ của hard là hard.
q: Please listen ___.|careful;carefully;care;careless|1|Bổ nghĩa cho động từ listen.
t: She speaks ___ (quiet).|quietly|quiet + -ly.
t: He plays football very ___ (good).|well|good → well.
t: The train arrived ___ (late).|late|late không đổi dạng.
s: Could you speak more slowly, please?|Bạn nói chậm hơn được không?
s: He works very hard.|Anh ấy làm việc rất chăm chỉ.
s: She speaks English well.|Cô ấy nói tiếng Anh tốt.
s: Please drive carefully.|Hãy lái xe cẩn thận nhé.
# indefinite|A2|Something, anything, nothing|Indefinite pronouns|some- (khẳng định)  ·  any- (phủ định, câu hỏi)  ·  no- (nghĩa phủ định)
> some- dùng trong câu khẳng định và lời mời: somebody, something, somewhere.
> any- dùng trong câu phủ định và câu hỏi: anybody, anything, anywhere.
> no- đã mang nghĩa phủ định nên động từ ở dạng khẳng định: Nobody knows. Các từ này đi với động từ số ít.
= Tiếng Việt nói "không ai không biết" hay "không có gì"; tiếng Anh không dùng hai từ phủ định trong một mệnh đề.
! I don't know nothing. → I don't know anything. — Không dùng hai từ phủ định.
! Everybody are here. → Everybody is here. — everybody đi với động từ số ít.
p: Trọng âm rơi vào phần đầu: SOMEthing, ANYbody, NOwhere. Âm /θ/ trong thing đặt lưỡi giữa hai hàm răng.|something, anything, nothing
e: There is someone at the door.|Có ai đó ở cửa.
e: I didn't buy anything.|Tôi đã không mua gì cả.
q: I'm hungry. I want ___ to eat.|anything;something;nothing;everything not|1|Câu khẳng định → something.
q: Is there ___ in the room?|somebody not;anybody;nobody not;every|1|Câu hỏi → anybody.
q: ___ called while you were out. The phone was silent.|Somebody;Anybody;Nobody;Everybody|2|Không ai gọi → Nobody.
q: I can't find my keys ___.|somewhere;anywhere;nowhere;everywhere not|1|Câu phủ định → anywhere.
t: There is ___ in my eye. (cái gì đó)|something|Câu khẳng định.
t: She didn't say ___. (gì cả)|anything|Câu phủ định → anything.
t: ___ knows the answer. (không ai)|Nobody / No one|Nghĩa phủ định, động từ khẳng định.
s: Would you like something to drink?|Bạn muốn uống gì không?
s: I don't know anyone here.|Tôi không quen ai ở đây.
s: There is nothing in the fridge.|Không có gì trong tủ lạnh.
s: Is anything wrong?|Có chuyện gì không ổn à?
# zero|A2|Câu điều kiện loại 0|Zero conditional|If + hiện tại đơn, hiện tại đơn
> Dùng cho sự thật hiển nhiên, quy luật và thói quen: điều kiện xảy ra thì kết quả luôn xảy ra.
> Có thể thay if bằng when mà nghĩa gần như không đổi.
> Cũng dùng để hướng dẫn với câu mệnh lệnh: If you have a question, ask me.
= Tiếng Việt nói "Hễ ... là ...", "Nếu ... thì ..."; tiếng Anh dùng hiện tại đơn ở cả hai vế, không dùng will.
! If you heat ice, it will melts. → If you heat ice, it melts. — Sự thật hiển nhiên dùng hiện tại đơn ở cả hai vế.
! If it rain, I take a taxi. → If it rains, I take a taxi. — Chủ ngữ it thì động từ thêm -s.
p: Mệnh đề if lên giọng nhẹ ở cuối, ngắt một nhịp ngắn, rồi xuống giọng ở cuối mệnh đề chính.|If you heat ice, it melts
e: If you mix red and yellow, you get orange.|Nếu trộn đỏ với vàng thì được màu cam.
e: When I am tired, I go to bed early.|Khi mệt, tôi đi ngủ sớm.
q: If you ___ water to 100 degrees, it boils.|will heat;heat;heated;heating|1|Sự thật hiển nhiên → hiện tại đơn.
q: Plants die if they ___ enough water.|won't get;didn't get;don't get;not get|2|Hiện tại đơn phủ định.
q: If the price ___, demand usually falls.|rise;rises;will rise;rose|1|Quy luật kinh tế → hiện tại đơn; price số ít thêm -s.
q: If you have a problem, ___ me.|calling;called;call;to call|2|Hướng dẫn → câu mệnh lệnh.
t: If I drink coffee at night, I ___ (not / sleep) well.|do not sleep / don't sleep|Thói quen → hiện tại đơn.
t: When it ___ (rain), the roads get very busy.|rains|it + rains.
t: If interest rates rise, people ___ (borrow) less.|borrow|Quy luật → hiện tại đơn.
s: If you press this button, the machine stops.|Nếu bạn nhấn nút này, máy sẽ dừng.
s: If I am late, I take a taxi.|Nếu bị muộn, tôi đi taxi.
s: When prices go up, people buy less.|Khi giá tăng, người ta mua ít hơn.
s: If you need help, just ask.|Nếu cần giúp, bạn cứ hỏi.
# usedto|A2|Used to|Used to|S + used to + V  ·  S + didn't use to + V  ·  Did + S + use to + V?
> Diễn tả thói quen hoặc trạng thái trong quá khứ mà bây giờ không còn nữa.
> Trong câu phủ định và câu hỏi, used to trở thành use to vì đã có did.
> Không dùng used to cho việc chỉ xảy ra một lần; khi đó dùng quá khứ đơn.
= Tiếng Việt nói "hồi trước", "ngày xưa ... hay ..."; tiếng Anh dùng used to để nhấn mạnh rằng bây giờ đã khác.
! I use to smoke. → I used to smoke. — Câu khẳng định dùng used to.
! I didn't used to like coffee. → I didn't use to like coffee. — Sau didn't dùng use to.
p: used to đọc liền thành /ˈjuːstə/, âm s là /s/ chứ không phải /z/ như trong động từ use.|used to live, used to work, didn't use to
e: I used to live in Hue.|Tôi từng sống ở Huế.
e: She didn't use to like spicy food.|Trước đây cô ấy không thích đồ cay.
q: I ___ play football every weekend, but now I'm too busy.|use to;used to;am used;was used|1|Thói quen trong quá khứ → used to.
q: Did you ___ walk to school?|used to;use to;using to;uses to|1|Sau did dùng use to.
q: He ___ have a beard, but he shaved it off.|used to;uses to;is used to;use|0|Trạng thái trong quá khứ.
q: We ___ go to that café a lot. It closed last year.|use;were use to;used to;are used to|2|Việc thường làm trước đây.
t: She ___ (work) in a bank, but now she is a teacher.|used to work|used to + V.
t: I didn't ___ (like) vegetables when I was a child.|use to like|didn't + use to + V.
t: Where did you ___ (live) before you moved here?|use to live|Câu hỏi: did + S + use to + V.
s: I used to work in finance.|Tôi từng làm trong ngành tài chính.
s: We used to live near the beach.|Chúng tôi từng sống gần biển.
s: Did you use to play any sports?|Trước đây bạn có chơi môn thể thao nào không?
s: I didn't use to drink coffee.|Trước đây tôi không uống cà phê.
# conjunctions|A2|Liên từ: and, but, so, because|Conjunctions: and, but, so, because|mệnh đề + and / but / so / because + mệnh đề
> and thêm ý; but nêu ý trái ngược; so nêu kết quả; because nêu lý do.
> so và because nói cùng một quan hệ theo hai chiều: It was late, so I went home. = I went home because it was late.
> Khi viết, đặt dấu phẩy trước but và so nếu nối hai mệnh đề đầy đủ.
= Tiếng Việt hay dùng cặp "vì ... nên ..." và "tuy ... nhưng ..."; tiếng Anh chỉ dùng một từ trong mỗi câu.
! Because it rained, so we stayed home. → Because it rained, we stayed home. — Không dùng because và so trong cùng một câu.
! I like tea but I don't like coffee too. → I like tea, but I don't like coffee. — but đã đủ nêu ý trái ngược.
p: and thường đọc rất nhẹ thành /ən/ hoặc /n/; because trong lời nói thân mật rút thành /kəz/.|bread and butter, because of you, so much
e: I was tired, so I went to bed early.|Tôi mệt nên đi ngủ sớm.
e: She stayed at home because she was ill.|Cô ấy ở nhà vì bị ốm.
q: I wanted to buy it, ___ it was too expensive.|so;because;but;and so|2|Ý trái ngược → but.
q: He was hungry, ___ he made a sandwich.|but;so;because;or|1|Kết quả → so.
q: We cancelled the trip ___ the weather was bad.|so;but;because;and|2|Lý do → because.
q: She speaks English ___ French.|and;so;because;but so|0|Thêm ý → and.
t: It was raining, ___ we took a taxi.|so|Kết quả.
t: I didn't call you ___ I lost my phone.|because|Lý do.
t: The hotel was cheap ___ very clean.|but / and|Cả hai đều đúng nghĩa: rẻ nhưng sạch, hoặc rẻ và sạch.
s: I like the job, but the salary is low.|Tôi thích công việc đó, nhưng lương thấp.
s: I was late because of the traffic.|Tôi đến muộn vì kẹt xe.
s: It was cold, so I closed the window.|Trời lạnh nên tôi đóng cửa sổ.
s: She is smart and hard-working.|Cô ấy thông minh và chăm chỉ.
# subjpron|A1|Đại từ nhân xưng và tính từ sở hữu|Subject pronouns and possessive adjectives|I – my  ·  you – your  ·  he – his  ·  she – her  ·  it – its  ·  we – our  ·  they – their
> Đại từ nhân xưng làm chủ ngữ của câu: I, you, he, she, it, we, they.
> Tính từ sở hữu đứng trước danh từ để chỉ của ai: my book, her car, their house.
> its (của nó) không có dấu nháy; it's là viết tắt của it is.
= Tiếng Việt chọn "anh, chị, em, cô, chú" theo tuổi tác và quan hệ; tiếng Anh chỉ có một từ you cho mọi người, và phân biệt he (nam) với she (nữ).
! He name is Nam. → His name is Nam. — Trước danh từ dùng tính từ sở hữu.
! She is my brother. → He is my brother. — Nam giới dùng he.
p: Phân biệt he /hiː/ và she /ʃiː/: âm /ʃ/ tròn môi, khác với âm /s/. your đọc là /jʊr/, their và there đọc giống nhau /ðer/.|he, she, his, her, their
e: This is my sister. Her name is Lan.|Đây là chị tôi. Chị ấy tên là Lan.
e: They love their children.|Họ yêu con của họ.
q: ___ is my friend. His name is Tom.|She;He;His;Him|1|Tom là nam → He.
q: This is Mary and this is ___ husband.|his;she;her;hers|2|Của Mary (nữ) → her.
q: We live in Hanoi. ___ house is small.|We;Us;Our;Ours|2|Trước danh từ house → Our.
q: The dog is eating ___ food.|it;its;it's;his is|1|Của nó → its, không có dấu nháy.
t: I have a brother. ___ name is Minh.|His|Của anh ấy → His.
t: ___ are students. (chúng tôi)|We|Chủ ngữ → We.
t: Is this ___ phone? (của bạn)|your|Trước danh từ → your.
s: What is your name?|Bạn tên là gì?
s: My name is Nam.|Tôi tên là Nam.
s: This is her bag.|Đây là túi của cô ấy.
s: They are my friends.|Họ là bạn của tôi.
# plurals|A1|Danh từ số ít và số nhiều|Singular and plural nouns|danh từ + -s / -es  ·  bất quy tắc: man → men
> Phần lớn danh từ thêm -s: book → books. Thêm -es sau s, x, ch, sh: box → boxes, watch → watches.
> Tận cùng bằng phụ âm + y: đổi y thành ies: city → cities.
> Bất quy tắc: man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth.
= Tiếng Việt dùng "những", "các" hoặc số đếm và không đổi danh từ ("hai quyển sách"); tiếng Anh bắt buộc đổi danh từ sang số nhiều.
! I have two brother. → I have two brothers. — Sau số từ hai trở lên phải dùng số nhiều.
! There are many childs. → There are many children. — child là danh từ bất quy tắc.
p: Đuôi -s số nhiều có ba cách đọc như đuôi -s của động từ: /s/, /z/, /ɪz/. Đây là âm cuối người Việt hay bỏ nhất khi nói.|books, cars, boxes
e: She has three children.|Cô ấy có ba người con.
e: There are two boxes on the table.|Có hai cái hộp trên bàn.
q: I have two ___.|sister;sisters;sisteres;sister's|1|Số nhiều thêm -s.
q: There are five ___ in the room.|person;persons;people;peoples|2|Số nhiều của person là people.
q: She bought three ___.|dress;dresss;dresses;dressies|2|Tận cùng bằng s thêm -es.
q: Vietnam has many big ___.|city;citys;cityes;cities|3|Phụ âm + y → ies.
t: Two ___ (man) are waiting outside.|men|man → men.
t: I need two ___ (box).|boxes|Tận cùng bằng x thêm -es.
t: How many ___ (child) do you have?|children|child → children.
s: I have two brothers.|Tôi có hai anh em trai.
s: There are many people here.|Ở đây có nhiều người.
s: She has three cats.|Cô ấy có ba con mèo.
s: The children are at school.|Bọn trẻ đang ở trường.
# demonstr|A1|This, that, these, those|This, that, these, those|this/these (gần)  ·  that/those (xa)
> this và these chỉ vật ở gần người nói; that và those chỉ vật ở xa.
> this và that đi với danh từ số ít; these và those đi với danh từ số nhiều.
> Dùng this để giới thiệu người: This is my wife. Khi nghe điện thoại: This is Nam speaking.
= Tiếng Việt nói "cái này", "những cái này" bằng cách thêm từ; tiếng Anh đổi hẳn sang một từ khác cho số nhiều: this → these, that → those.
! This books are mine. → These books are mine. — Danh từ số nhiều dùng these.
! That are my friends. → Those are my friends. — Số nhiều ở xa dùng those.
p: this có nguyên âm ngắn /ɪ/ và kết thúc bằng /s/; these có nguyên âm dài /iː/ và kết thúc bằng /z/. Âm đầu /ð/ đặt lưỡi giữa hai hàm răng.|this, these, that, those
e: This is my desk.|Đây là bàn làm việc của tôi.
e: Those buildings are very tall.|Những tòa nhà kia rất cao.
q: ___ is my phone here.|These;This;Those;They|1|Một vật ở gần → This.
q: Look at ___ birds over there.|this;that;these;those|3|Nhiều vật ở xa → those.
q: Are ___ your keys in my hand?|this;that;these;those|2|Nhiều vật ở gần → these.
q: Who is ___ man across the street?|this;that;these;those|1|Một người ở xa → that.
t: ___ shoes here are too small. (gần)|These|Số nhiều, ở gần.
t: What is ___ over there? (xa, một vật)|that|Số ít, ở xa.
t: ___ is my friend Hoa. (giới thiệu)|This|Giới thiệu người dùng This.
s: This is my office.|Đây là văn phòng của tôi.
s: What is that?|Kia là cái gì?
s: These are my colleagues.|Đây là các đồng nghiệp của tôi.
s: How much are those?|Những cái kia giá bao nhiêu?
# thereis|A1|There is, there are|There is, there are|There is + số ít  ·  There are + số nhiều
> Dùng để nói có cái gì ở đâu đó. There is đi với danh từ số ít hoặc không đếm được; there are đi với số nhiều.
> Phủ định: There isn't, There aren't. Câu hỏi: Is there ...? Are there ...?
> Sau khi đã giới thiệu bằng there is, lần sau dùng it hoặc they: There is a bank. It is near the station.
= Tiếng Việt dùng "có" cho cả sở hữu lẫn tồn tại; tiếng Anh tách hai ý: have (tôi có) và there is (ở đó có).
! Have a bank near here. → There is a bank near here. — Nói về sự tồn tại dùng there is, không dùng have.
! There is two chairs. → There are two chairs. — Danh từ số nhiều dùng there are.
p: there is thường rút gọn thành there's /ðerz/; there are đọc nhẹ /ðərə/ và nối liền với từ sau.|there's a bank, there are two, is there
e: There is a café on the corner.|Có một quán cà phê ở góc đường.
e: Are there any questions?|Có câu hỏi nào không?
q: ___ a supermarket near my house.|There are;There is;It has;Have|1|Một siêu thị → There is.
q: ___ three people in the meeting room.|There is;There are;They are;Have|1|Số nhiều → There are.
q: ___ any milk in the fridge?|Are there;Is there;Have there;Does there|1|milk không đếm được → Is there.
q: There ___ any chairs in this room.|isn't;aren't;don't;not|1|Số nhiều phủ định → aren't.
t: There ___ a problem with my computer.|is|Số ít.
t: ___ there many students in your class?|Are|Số nhiều → Are there.
t: There ___ (not) any water left.|is not / isn't|Không đếm được → isn't.
s: There is a bank near here.|Gần đây có một ngân hàng.
s: Is there a toilet here?|Ở đây có nhà vệ sinh không?
s: There are two meetings today.|Hôm nay có hai cuộc họp.
s: There isn't much time.|Không còn nhiều thời gian.
# havegot|A1|Have và have got|Have and have got|S + have/has (got) + danh từ
> have và have got đều nghĩa là "có" (sở hữu). have got phổ biến trong tiếng Anh-Anh; tiếng Anh-Mỹ thường chỉ dùng have.
> he/she/it dùng has. Phủ định: don't have / doesn't have (hoặc haven't got / hasn't got).
> Câu hỏi: Do you have ...? Does she have ...? (hoặc Have you got ...?)
= "Có" trong tiếng Việt không đổi theo chủ ngữ; tiếng Anh đổi have thành has với he, she, it.
! She have a car. → She has a car. — he/she/it đi với has.
! Do she has a car? → Does she have a car? — Sau does dùng have.
p: have đọc /hæv/ với âm /æ/ mở miệng rộng; has đọc /hæz/ kết thúc bằng /z/. Đừng đọc have thành "hép".|have, has, I've got
e: I have two sisters.|Tôi có hai chị em gái.
e: Does he have a laptop?|Anh ấy có máy tính xách tay không?
q: My brother ___ a new job.|have;has;having;is have|1|he → has.
q: ___ you have any brothers?|Does;Are;Do;Have|2|Câu hỏi với you → Do.
q: She ___ have a car.|don't;doesn't;isn't;hasn't|1|she → doesn't.
q: We ___ a meeting at three.|has;have;having;are have|1|we → have.
t: He ___ (have) a big house.|has|he → has.
t: I ___ (not / have) any money.|do not have / don't have|Phủ định với I.
t: ___ she have a phone?|Does|Câu hỏi với she.
s: I have a question.|Tôi có một câu hỏi.
s: Do you have a pen?|Bạn có bút không?
s: She has a meeting now.|Cô ấy đang có cuộc họp.
s: We don't have time.|Chúng ta không có thời gian.
# pressimple|A1|Hiện tại đơn: khẳng định, phủ định, câu hỏi|Present simple: all forms|S + V(s/es)  ·  S + don't/doesn't + V  ·  Do/Does + S + V?
> Dùng cho thói quen, sự thật và việc lặp lại. Với he/she/it, động từ thêm -s hoặc -es.
> Phủ định: don't + V (I, you, we, they) và doesn't + V (he, she, it).
> Câu hỏi: Do/Does + chủ ngữ + V? Trả lời ngắn: Yes, I do. / No, she doesn't.
= Tiếng Việt thêm "không" để phủ định và "không?" cuối câu để hỏi; tiếng Anh cần trợ động từ do/does cho cả hai.
! He don't like coffee. → He doesn't like coffee. — he/she/it dùng doesn't.
! Does she works here? → Does she work here? — Sau does động từ không thêm -s.
p: do you nói nhanh thành /dəjə/; does đọc /dʌz/, doesn't đọc /ˈdʌznt/. Câu hỏi Yes/No lên giọng ở cuối.|do you, does she, doesn't
e: I work in an office.|Tôi làm việc ở văn phòng.
e: Does he speak English?|Anh ấy có nói tiếng Anh không?
q: She ___ in a bank.|work;works;working;is work|1|she → thêm -s.
q: ___ you like tea?|Does;Are;Do;Is|2|you → Do.
q: They ___ live here.|doesn't;don't;aren't;isn't|1|they → don't.
q: Does he ___ football?|plays;playing;play;played|2|Sau does dùng V nguyên mẫu.
t: My father ___ (watch) TV every evening.|watches|Tận cùng bằng ch thêm -es.
t: We ___ (not / work) on Sundays.|do not work / don't work|we → don't.
t: ___ she live near here?|Does|she → Does.
s: I work from nine to five.|Tôi làm việc từ chín giờ đến năm giờ.
s: Do you speak English?|Bạn có nói tiếng Anh không?
s: She doesn't eat meat.|Cô ấy không ăn thịt.
s: Where does he work?|Anh ấy làm việc ở đâu?
# can|A1|Can và can't|Can and can't|S + can / can't + V
> can diễn tả khả năng (I can swim) và xin phép hoặc nhờ vả (Can I sit here? Can you help me?).
> can không đổi theo chủ ngữ và theo sau luôn là động từ nguyên mẫu không có to.
> Phủ định: can't hoặc cannot. Câu hỏi: đảo can lên trước chủ ngữ.
= "Có thể", "biết", "được" trong tiếng Việt đều có thể dịch là can: biết bơi = can swim, được vào = can come in.
! I can to drive. → I can drive. — Sau can không có to.
! She cans cook. → She can cook. — can không thêm -s.
p: can trong câu khẳng định đọc nhẹ /kən/ và trọng âm rơi vào động từ; can't đọc rõ /kænt/. Nghe nhầm là hiểu ngược nghĩa.|I can swim, I can't swim, Can you help
e: I can speak a little English.|Tôi nói được một chút tiếng Anh.
e: Can I use your phone?|Tôi dùng điện thoại của bạn được không?
q: She ___ play the piano very well.|can;cans;can to;is can|0|can không đổi dạng.
q: ___ you help me, please?|Do;Can;Are;Does|1|Nhờ vả → Can.
q: I ___ come tomorrow. I am busy.|can;can't;don't can;am not can|1|Không thể → can't.
q: Can he ___ a car?|drives;to drive;drive;driving|2|Sau can dùng V nguyên mẫu.
t: I ___ swim, but I can't dive.|can|Khả năng.
t: ___ I open the window?|Can|Xin phép.
t: Sorry, I ___ (not) hear you.|cannot / can't|Phủ định.
s: Can you help me?|Bạn giúp tôi được không?
s: I can't find my keys.|Tôi không tìm thấy chìa khóa.
s: Can I pay by card?|Tôi trả bằng thẻ được không?
s: She can speak three languages.|Cô ấy nói được ba thứ tiếng.
# imperative|A1|Câu mệnh lệnh|Imperatives|V + ...  ·  Don't + V + ...  ·  Let's + V
> Dùng động từ nguyên mẫu, không có chủ ngữ, để hướng dẫn, yêu cầu hoặc chỉ đường: Turn left. Open the door.
> Phủ định: Don't + V. Thêm please để lịch sự hơn.
> Let's + V dùng để rủ cùng làm: Let's go. Let's have lunch.
= Tiếng Việt thêm "đi", "nhé", "đừng"; tiếng Anh dùng thẳng động từ và thêm please để giữ lịch sự.
! Don't to touch that. → Don't touch that. — Sau don't không có to.
! Let's to go. → Let's go. — Sau let's là động từ nguyên mẫu.
p: Câu mệnh lệnh xuống giọng ở cuối. Thêm please và nói nhẹ giọng để không nghe như ra lệnh.|Sit down please, Don't worry, Let's go
e: Please sit down.|Mời ngồi.
e: Don't be late.|Đừng đến muộn.
q: ___ the door, please.|Closing;Close;To close;Closes|1|Câu mệnh lệnh dùng V nguyên mẫu.
q: ___ worry. Everything is fine.|Not;Doesn't;Don't;No|2|Phủ định: Don't + V.
q: ___ have lunch together.|Let;Let's;Lets to;Let's to|1|Rủ cùng làm → Let's + V.
q: Please ___ quiet in the library.|is;are;be;being|2|Mệnh lệnh với be → Be quiet.
t: ___ (not / forget) your passport.|Do not forget / Don't forget|Don't + V.
t: ___ left at the traffic lights. (turn)|Turn|V nguyên mẫu.
t: ___ go for a coffee. (rủ)|Let's|Let's + V.
s: Please wait here.|Xin hãy đợi ở đây.
s: Don't worry about it.|Đừng lo về chuyện đó.
s: Let's start the meeting.|Chúng ta bắt đầu cuộc họp nhé.
s: Turn right at the corner.|Rẽ phải ở góc đường.
# liking|A1|Like, love, hate + V-ing|Like, love, hate + -ing|S + like / love / hate + V-ing
> Sau like, love, enjoy, hate, don't like thường dùng V-ing để nói về sở thích.
> Cách thêm -ing: bỏ e cuối (dance → dancing), gấp đôi phụ âm cuối với từ ngắn (swim → swimming).
> would like + to V dùng để nói muốn làm gì ngay lúc này, lịch sự hơn want.
= Tiếng Việt nói "thích đọc sách" với động từ giữ nguyên; tiếng Anh phải đổi sang reading.
! I like read books. → I like reading books. — Sau like dùng V-ing.
! I would like going. → I would like to go. — would like + to V.
p: Đuôi -ing đọc là /ɪŋ/, âm mũi phát ra ở cuối lưỡi, không bật âm /g/. would like nói nhanh thành I'd like.|reading, swimming, I'd like
e: I love cooking.|Tôi rất thích nấu ăn.
e: She doesn't like getting up early.|Cô ấy không thích dậy sớm.
q: I like ___ to music.|listen;listening;listens;to listening|1|like + V-ing.
q: He hates ___ in traffic.|drive;drives;driving;drove|2|hate + V-ing.
q: I would like ___ a coffee, please.|having;have;to have;has|2|would like + to V.
q: Do you enjoy ___?|swim;swiming;swimming;to swimming|2|swim gấp đôi m → swimming.
t: She loves ___ (dance).|dancing|Bỏ e rồi thêm -ing.
t: I don't like ___ (wait).|waiting|like + V-ing.
t: We would like ___ (order) now.|to order|would like + to V.
s: I like reading books.|Tôi thích đọc sách.
s: Do you like cooking?|Bạn có thích nấu ăn không?
s: He loves playing football.|Anh ấy rất thích chơi bóng đá.
s: I would like to book a table.|Tôi muốn đặt một bàn.
# placeprep|A1|Giới từ chỉ vị trí|Prepositions of place|in, on, under, next to, between, behind, in front of, opposite
> in: bên trong; on: trên bề mặt; under: bên dưới; next to: bên cạnh; between: ở giữa hai thứ.
> behind: phía sau; in front of: phía trước; opposite: đối diện; near: gần.
> Dùng với to be để nói vị trí: The bank is next to the post office.
= Tiếng Việt nói "ở trên bàn", "ở trong túi"; tiếng Anh không cần từ "ở", chỉ dùng to be và giới từ: It is on the table.
! The bank is next the hotel. → The bank is next to the hotel. — next luôn đi với to.
! He is in front the door. → He is in front of the door. — in front luôn đi với of.
p: Các cụm giới từ được đọc liền thành một khối: next to /ˈnekstə/, in front of /ɪnˈfrʌntəv/.|next to, in front of, between
e: The keys are in my bag.|Chìa khóa ở trong túi của tôi.
e: The pharmacy is opposite the bank.|Hiệu thuốc ở đối diện ngân hàng.
q: The cat is ___ the table. It is sleeping on the floor.|on;in;under;between|2|Nằm trên sàn, bên dưới bàn → under.
q: The café is ___ the bank and the hotel.|between;next;under;in|0|Ở giữa hai nơi → between.
q: There is a car park ___ the building.|behind;between;in;on top|0|Phía sau → behind.
q: My office is ___ the station.|next;near;front;between of|1|Gần → near.
t: The book is ___ the table. (trên)|on|Trên bề mặt.
t: She is standing ___ to me. (bên cạnh)|next|next to.
t: Please wait in ___ of the building. (phía trước)|front|in front of.
s: The bank is next to the hotel.|Ngân hàng ở cạnh khách sạn.
s: My phone is on the desk.|Điện thoại của tôi ở trên bàn.
s: The toilet is behind the stairs.|Nhà vệ sinh ở phía sau cầu thang.
s: I'm in front of the building.|Tôi đang ở trước tòa nhà.
# waswere|A1|Quá khứ của to be: was, were|Past of "to be": was, were|I/he/she/it was  ·  you/we/they were
> was và were là dạng quá khứ của am, is, are, dùng để nói về trạng thái hoặc vị trí trong quá khứ.
> Phủ định: wasn't, weren't. Câu hỏi: Was he ...? Were you ...?
> was born dùng để nói nơi và năm sinh: I was born in 1995.
= Tiếng Việt nói "Hôm qua tôi mệt" không cần động từ; tiếng Anh cần was: I was tired yesterday.
! I am tired yesterday. → I was tired yesterday. — Quá khứ dùng was.
! They was at home. → They were at home. — they đi với were.
p: was và were thường đọc nhẹ /wəz/ và /wər/ khi ở giữa câu; đọc rõ khi đứng cuối câu trả lời ngắn: Yes, I was.|I was tired, they were late, Yes I was
e: I was at home last night.|Tối qua tôi ở nhà.
e: Were you busy yesterday?|Hôm qua bạn có bận không?
q: We ___ in Da Nang last week.|was;were;are;be|1|we → were.
q: She ___ very tired after work.|were;was;is being;be|1|she → was.
q: ___ you at the meeting yesterday?|Was;Were;Did;Are|1|you → Were.
q: I ___ born in 1998.|am;were;was;did|2|I was born.
t: The weather ___ (be) nice yesterday.|was|Số ít → was.
t: They ___ (not / be) happy with the result.|were not / weren't|they → weren't.
t: Where ___ you last night?|were|you → were.
s: I was very busy yesterday.|Hôm qua tôi rất bận.
s: Where were you last night?|Tối qua bạn ở đâu?
s: She wasn't at work today.|Hôm nay cô ấy không đi làm.
s: The food was delicious.|Đồ ăn rất ngon.
# perfcont|B1|Hiện tại hoàn thành tiếp diễn|Present perfect continuous|S + have/has been + V-ing
> Nhấn mạnh hành động kéo dài từ quá khứ đến hiện tại và vẫn còn tiếp diễn, hoặc vừa dừng và còn để lại dấu vết.
> Thường đi với for, since, how long, all day, recently.
> Động từ trạng thái (know, like, have với nghĩa sở hữu) không dùng dạng này mà dùng hiện tại hoàn thành: I have known her for years.
= Tiếng Việt nói "đã làm ... được ba tiếng rồi" và không phân biệt kết quả với quá trình; tiếng Anh dùng dạng tiếp diễn khi muốn nhấn mạnh quá trình và thời gian.
! I am working here for five years. → I have been working here for five years. — Kéo dài từ quá khứ đến nay dùng have been + V-ing.
! I have been knowing him for years. → I have known him for years. — know không dùng dạng tiếp diễn.
p: have been nói nhanh thành /əvbɪn/ và rút gọn: I've been, she's been. Trọng âm rơi vào động từ V-ing.|I've been working, she's been waiting, how long have you been
e: I have been waiting for an hour.|Tôi đã đợi một tiếng rồi.
e: It has been raining all day.|Trời mưa suốt cả ngày.
q: She ___ English for three years.|is learning;has been learning;learns;was learning|1|Kéo dài đến hiện tại với for → have been + V-ing.
q: How long ___ you been working here?|are;do;have;did|2|How long + have + S + been + V-ing.
q: Your eyes are red. ___ you been crying?|Are;Did;Have;Do|2|Dấu vết của việc vừa xảy ra → Have you been crying.
q: I ___ this book for weeks, and I still haven't finished it.|have been reading;am read;read;have been read|0|Quá trình còn tiếp diễn.
t: We ___ (wait) since nine o'clock.|have been waiting|have been + V-ing.
t: He ___ (work) on this report all morning.|has been working|he → has been + V-ing.
t: I ___ (know) her for ten years.|have known|know là động từ trạng thái → hiện tại hoàn thành.
s: I've been working here for two years.|Tôi đã làm ở đây được hai năm.
s: How long have you been waiting?|Bạn đã đợi bao lâu rồi?
s: She has been studying all day.|Cô ấy đã học cả ngày.
s: We've been looking for a new office.|Chúng tôi đang tìm một văn phòng mới.
# pastperfect|B1|Quá khứ hoàn thành|Past perfect|S + had + V3
> Dùng để nói một việc xảy ra trước một việc khác trong quá khứ. Việc xảy ra trước dùng had + V3; việc xảy ra sau dùng quá khứ đơn.
> Thường đi với when, before, after, by the time, already, just.
> Nếu trình tự đã rõ nhờ before hoặc after thì có thể dùng quá khứ đơn cho cả hai.
= Tiếng Việt dùng "đã ... rồi" hoặc "trước đó"; tiếng Anh dùng had + V3 để đánh dấu việc nào xảy ra trước.
! When I arrived, the train left. → When I arrived, the train had left. — Tàu đi trước khi tôi đến nên dùng had left.
! I had went there before. → I had gone there before. — Sau had dùng V3.
p: had thường rút gọn thành 'd và đọc rất nhẹ: I'd finished, she'd left. Trọng âm rơi vào V3.|I'd finished, she'd left, they'd already gone
e: When we arrived, the meeting had already started.|Khi chúng tôi đến, cuộc họp đã bắt đầu rồi.
e: She had never flown before that trip.|Trước chuyến đi đó cô ấy chưa bao giờ đi máy bay.
q: When I got to the station, the train ___.|left;has left;had left;leaves|2|Việc xảy ra trước → had + V3.
q: He was tired because he ___ well.|didn't sleep;hadn't slept;hasn't slept;doesn't sleep|1|Nguyên nhân xảy ra trước → hadn't slept.
q: By the time she called, I ___ dinner.|already finished;have already finished;had already finished;finish|2|by the time + quá khứ → had + V3.
q: I recognised him because we ___ before.|met;had met;have met;meet|1|Gặp trước lúc nhận ra → had met.
t: After they ___ (eat), they went for a walk.|had eaten|Việc xảy ra trước.
t: The film ___ (already / start) when we arrived.|had already started|had + already + V3.
t: I didn't have my wallet. I ___ (leave) it at home.|had left|Việc xảy ra trước.
s: The meeting had already started when I arrived.|Cuộc họp đã bắt đầu khi tôi đến.
s: I had never seen it before.|Trước đó tôi chưa từng thấy nó.
s: She had left before I called.|Cô ấy đã đi trước khi tôi gọi.
s: We had finished the report by Friday.|Chúng tôi đã hoàn thành báo cáo trước thứ Sáu.
# tagq|B1|Câu hỏi đuôi|Question tags|Câu khẳng định, + đuôi phủ định?  ·  Câu phủ định, + đuôi khẳng định?
> Câu hỏi đuôi dùng để xác nhận thông tin hoặc mở lời trò chuyện. Vế trước khẳng định thì đuôi phủ định, và ngược lại.
> Đuôi dùng cùng trợ động từ với vế trước; nếu là động từ thường thì mượn do, does, did.
> Trường hợp đặc biệt: I am ..., aren't I? Let's ..., shall we?
= Tiếng Việt chỉ cần thêm "phải không?", "nhỉ?" cho mọi câu; tiếng Anh phải chọn đuôi khớp với trợ động từ và thì của câu.
! You are a student, isn't it? → You are a student, aren't you? — Đuôi phải khớp với chủ ngữ và động từ của vế trước.
! She works here, isn't she? → She works here, doesn't she? — Động từ thường mượn does.
p: Xuống giọng ở đuôi khi bạn khá chắc và chỉ muốn người nghe đồng tình; lên giọng khi bạn thật sự không chắc và muốn hỏi.|isn't it, don't you, aren't they
e: It's a nice day, isn't it?|Hôm nay trời đẹp nhỉ?
e: You don't work here, do you?|Bạn không làm ở đây, phải không?
q: You are from Vietnam, ___?|isn't it;aren't you;don't you;are you|1|are → aren't you.
q: She can speak French, ___?|can she;doesn't she;can't she;isn't she|2|can → can't she.
q: They didn't call, ___?|didn't they;did they;do they;were they|1|Vế trước phủ định → đuôi khẳng định did they.
q: He works in finance, ___?|isn't he;doesn't he;does he;works he|1|Động từ thường hiện tại → doesn't he.
t: It's cold today, ___ it?|isn't|is → isn't.
t: You haven't finished, ___ you?|have|Phủ định → đuôi khẳng định.
t: Let's take a break, ___ we?|shall|Let's → shall we.
s: It's a nice day, isn't it?|Hôm nay trời đẹp nhỉ?
s: You work here, don't you?|Bạn làm ở đây, phải không?
s: She isn't coming, is she?|Cô ấy không đến, phải không?
s: We've met before, haven't we?|Chúng ta đã gặp nhau rồi, phải không?
# indirectq|B1|Câu hỏi gián tiếp|Indirect questions|Could you tell me + từ hỏi + S + V?  ·  Do you know if + S + V?
> Câu hỏi gián tiếp lịch sự hơn câu hỏi trực tiếp, mở đầu bằng Could you tell me, Do you know, I'd like to know, I wonder.
> Sau cụm mở đầu, dùng trật tự của câu khẳng định: không đảo trợ động từ, không dùng do/does/did.
> Câu hỏi Yes/No chuyển thành if hoặc whether.
= Tiếng Việt thêm "cho tôi hỏi", "không biết" mà giữ nguyên câu hỏi; tiếng Anh phải đổi lại trật tự từ sau cụm mở đầu.
! Could you tell me where is the station? → Could you tell me where the station is? — Không đảo động từ trong câu hỏi gián tiếp.
! Do you know what time does it start? → Do you know what time it starts? — Không dùng does.
p: Câu hỏi gián tiếp mở đầu bằng Could you, Do you lên giọng ở cuối; mở đầu bằng I wonder, I'd like to know thì xuống giọng.|Could you tell me, Do you know, I wonder if
e: Could you tell me where the bank is?|Bạn cho tôi hỏi ngân hàng ở đâu?
e: Do you know if the shop is open?|Bạn có biết cửa hàng có mở không?
q: Could you tell me where ___?|is the toilet;the toilet is;does the toilet;the toilet does|1|Trật tự khẳng định: the toilet is.
q: Do you know what time ___?|does the meeting start;the meeting starts;starts the meeting;the meeting start|1|Không dùng does; động từ thêm -s.
q: I'd like to know ___ breakfast is included.|what;that;if;does|2|Câu hỏi Yes/No → if.
q: Can you tell me how much ___?|does this cost;this costs;costs this;is this cost|1|Trật tự khẳng định.
t: Do you know where she ___ (live)?|lives|Không dùng does, động từ thêm -s.
t: Could you tell me ___ the train has left? (có ... không)|if / whether|Câu hỏi Yes/No.
t: I wonder what time it ___ (be).|is|Trật tự khẳng định.
s: Could you tell me where the station is?|Bạn cho tôi hỏi nhà ga ở đâu?
s: Do you know what time it opens?|Bạn có biết mấy giờ nó mở cửa không?
s: I'd like to know how much it costs.|Tôi muốn biết nó giá bao nhiêu.
s: Do you know if he is in the office?|Bạn có biết anh ấy có ở văn phòng không?
# possibility|B1|May, might, could chỉ khả năng|May, might, could for possibility|S + may / might / could + V
> may, might, could diễn tả điều có thể xảy ra nhưng không chắc. might cho thấy khả năng thấp hơn may một chút.
> Phủ định: may not, might not (có thể không). Không dùng couldn't với nghĩa này.
> must diễn tả suy đoán gần như chắc chắn; can't diễn tả điều chắc chắn không đúng.
= Tiếng Việt dùng "có lẽ", "có thể", "chắc là" đứng đầu câu; tiếng Anh đặt động từ khuyết thiếu ngay trước động từ chính.
! It may rains tomorrow. → It may rain tomorrow. — Sau may là động từ nguyên mẫu, không thêm -s.
! Maybe he might come. → He might come. — Không dùng maybe và might cùng lúc.
p: might đọc /maɪt/ và could đọc /kʊd/, trong đó gh và l đều câm. Các từ này được đọc nhẹ, trọng âm rơi vào động từ chính.|might be, could be, may not
e: It might rain this afternoon.|Chiều nay có thể mưa.
e: She may not come to the meeting.|Có thể cô ấy sẽ không đến cuộc họp.
q: Take an umbrella. It ___ rain later.|must;might;can't;should to|1|Có thể xảy ra, không chắc → might.
q: He isn't answering. He ___ be in a meeting.|could;can't;mustn't;could to|0|Một khả năng → could.
q: Prices ___ rise next year, but nobody is sure.|must;may;can't;will to|1|Không chắc → may.
q: She ___ be at home. Her car is not there.|might;may not;must;could to|1|Có thể không → may not.
t: I'm not sure, but I ___ be late tomorrow.|may / might / could|Khả năng không chắc.
t: They ___ not agree with our plan.|may / might|Có thể không.
t: This ___ be the answer, but I need to check.|could / might / may|Khả năng.
s: It might rain later.|Lát nữa có thể mưa.
s: I may be a little late.|Có thể tôi sẽ đến muộn một chút.
s: That could be a good idea.|Đó có thể là một ý hay.
s: She might not know about it.|Có thể cô ấy chưa biết chuyện đó.
# asas|B1|So sánh bằng: as ... as|Equal comparison: as ... as|as + tính từ/trạng từ + as  ·  not as ... as  ·  the same as
> as + tính từ + as dùng để nói hai thứ ngang nhau. not as ... as nghĩa là kém hơn.
> Với số lượng: as much + danh từ không đếm được + as; as many + danh từ đếm được + as.
> twice as ... as, three times as ... as dùng để nói gấp hai, gấp ba.
= Tiếng Việt nói "bằng", "không bằng"; tiếng Anh kẹp tính từ giữa hai chữ as, và tính từ giữ nguyên dạng gốc.
! She is as taller as me. → She is as tall as me. — Giữa as ... as dùng tính từ nguyên dạng.
! This is not so good than that. → This is not as good as that. — Dùng as, không dùng than.
p: Cả hai chữ as đều đọc nhẹ thành /əz/; trọng âm rơi vào tính từ ở giữa.|as good as, as soon as, not as big as
e: This year's profit is as high as last year's.|Lợi nhuận năm nay cao bằng năm ngoái.
e: The second quarter was not as strong as the first.|Quý hai không mạnh bằng quý một.
q: My car is ___ yours.|as fast as;as faster as;so fast than;fast as|0|as + tính từ nguyên dạng + as.
q: This phone isn't ___ that one.|as expensive than;as expensive as;more expensive as;expensive as than|1|not as ... as.
q: We don't have ___ time as we thought.|as many;as much;so many;much as|1|time không đếm được → as much.
q: The new office is twice ___ the old one.|bigger as;as big as;as big than;so big|1|twice as ... as.
t: He is as tall ___ his father.|as|as + tính từ + as.
t: There aren't as ___ people as yesterday.|many|people đếm được → many.
t: Call me as ___ as possible. (sớm)|soon|as soon as possible.
s: It is not as difficult as it looks.|Nó không khó như vẻ ngoài.
s: Please reply as soon as possible.|Vui lòng trả lời sớm nhất có thể.
s: This one is as good as that one.|Cái này tốt bằng cái kia.
s: We sold twice as many units as last year.|Chúng tôi bán được gấp đôi số sản phẩm so với năm ngoái.
`
export const GRAMMAR = parseUnits(RAW, 'g')

// Các chủ đề sẽ được viết tiếp để đủ giáo trình A1 → B2 (hiện trong trang Ngữ pháp với nhãn "Sắp có").
export const PLANNED: Record<Level, string[]> = {
  A1: [],
  A2: [],
  B1: ['Tương lai tiếp diễn', 'So, such', 'Both, either, neither',
    'Mạo từ nâng cao', 'Be able to, manage to', 'Make, let, allow', 'Cụm động từ thông dụng', 'Mệnh đề chỉ mục đích',
     'Tính từ đuôi -ed và -ing', 'Câu bị động với hai tân ngữ', 'Unless, as long as, provided'],
  B2: ['Tương lai hoàn thành', 'Câu điều kiện hỗn hợp', 'Mệnh đề quan hệ không xác định', 'Rút gọn mệnh đề quan hệ', 'Bị động nâng cao: It is said that',
    'Have something done', 'Câu chẻ: It is ... that', 'Would rather, had better', 'Used to, be used to, get used to', 'Động từ + giới từ', 'Danh động từ hoàn thành',
    'Câu tường thuật với động từ đặc biệt', 'Từ nối nâng cao', 'Nhấn mạnh với do, does, did', 'Thức giả định'],
}
