import type { Level } from './vocab'
// Định dạng mỗi chủ đề:
//   # mã|cấp|tên tiếng Việt|tên tiếng Anh|công thức
//   > giải thích
//   = so sánh với tiếng Việt
//   ! câu sai → câu đúng — vì sao (lỗi người Việt hay mắc)
//   e: câu ví dụ tiếng Anh|nghĩa tiếng Việt
//   q: câu hỏi trắc nghiệm|A;B;C;D|vị trí đáp án đúng (từ 0)|giải thích
//   t: câu điền chỗ trống (tự gõ)|đáp án (các cách viết đúng cách nhau bằng " / ")|giải thích
//   s: câu mẫu tiếng Anh|nghĩa — app tự tạo bài sắp xếp từ, nghe chép và nói từ các câu này
export type Kind = 'mcq' | 'gap' | 'order' | 'listen' | 'speak'
export interface Exercise { id: string; topic: string; kind: Kind; q: string; opts: string[]; a: number; answers: string[]; vi: string; why: string }
export interface Topic {
  id: string; level: Level; vi: string; en: string; formula: string; domain?: string
  notes: string[]; compare: string[]; mistakes: [string, string, string][]; examples: [string, string][]; exercises: Exercise[]
}

/** Đọc khối văn bản thành danh sách chủ đề. prefix là tiền tố mã thẻ ("g" cho ngữ pháp, "p" cho mẫu câu). */
export function parseUnits(raw: string, prefix: string, kinds: Kind[]): Topic[] {
  const out: Topic[] = []
  const count = { q: 0, t: 0, s: 0 }
  for (const line of raw.trim().split('\n')) {
    const t = out[out.length - 1]
    const body = line.slice(line.indexOf(' ') + 1)
    const ex = (suffix: string, kind: Kind, rest: Partial<Exercise>): Exercise =>
      ({ id: `${prefix}:${t.id}:${suffix}`, topic: t.id, kind, q: '', opts: [], a: 0, answers: [], vi: '', why: '', ...rest })
    if (line.startsWith('# ')) {
      const [id, level, vi, en, formula, domain] = body.split('|')
      out.push({ id, level: level as Level, vi, en, formula: formula ?? '', domain, notes: [], compare: [], mistakes: [], examples: [], exercises: [] })
      count.q = count.t = count.s = 0
    } else if (line.startsWith('> ')) t.notes.push(body)
    else if (line.startsWith('= ')) t.compare.push(body)
    else if (line.startsWith('! ')) {
      const [wrong, rest] = body.split(' → ')
      const [right, why] = rest.split(' — ')
      t.mistakes.push([wrong, right, why ?? ''])
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
      t.exercises.push(ex(prefix === 'g' ? `s${n}` : String(n), kinds[(n - 1) % kinds.length], { q, vi, answers: [q] }))
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
`
export const GRAMMAR = parseUnits(RAW, 'g', ['order', 'listen', 'speak', 'order'])

// Các chủ đề sẽ được viết tiếp để đủ giáo trình A1 → B2 (hiện trong trang Ngữ pháp với nhãn "Sắp có").
export const PLANNED: Record<Level, string[]> = {
  A1: ['Đại từ nhân xưng và tính từ sở hữu', 'Danh từ số ít, số nhiều', 'This, that, these, those', 'There is, there are', 'Have got',
    'Hiện tại đơn: khẳng định, phủ định, câu hỏi', 'Can, can\'t', 'Câu mệnh lệnh', 'Like + V-ing', 'Giới từ chỉ vị trí', 'Quá khứ của to be: was, were'],
  A2: ['Hiện tại tiếp diễn chỉ tương lai', 'Hiện tại hoàn thành: ever, never, just', 'Động từ bất quy tắc', 'Đại từ tân ngữ và đại từ sở hữu',
    'Trạng từ chỉ cách thức', 'Something, anything, nothing', 'Câu điều kiện loại 0', 'Used to', 'Liên từ: and, but, so, because', 'Have to, don\'t have to'],
  B1: ['Hiện tại hoàn thành tiếp diễn', 'Quá khứ hoàn thành', 'Tương lai tiếp diễn', 'Câu hỏi đuôi', 'Câu hỏi gián tiếp', 'So, such', 'Both, either, neither',
    'Mạo từ nâng cao', 'May, might, could (khả năng)', 'Be able to, manage to', 'Make, let, allow', 'Cụm động từ thông dụng', 'Mệnh đề chỉ mục đích',
    'So sánh bằng: as ... as', 'Tính từ đuôi -ed và -ing', 'Câu bị động với hai tân ngữ', 'Unless, as long as, provided'],
  B2: ['Tương lai hoàn thành', 'Câu điều kiện hỗn hợp', 'Mệnh đề quan hệ không xác định', 'Rút gọn mệnh đề quan hệ', 'Bị động nâng cao: It is said that',
    'Have something done', 'Câu chẻ: It is ... that', 'Would rather, had better', 'Used to, be used to, get used to', 'Động từ + giới từ', 'Danh động từ hoàn thành',
    'Câu tường thuật với động từ đặc biệt', 'Từ nối nâng cao', 'Nhấn mạnh với do, does, did', 'Thức giả định'],
}
