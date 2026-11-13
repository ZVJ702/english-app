import type { Level } from './vocab'
// Định dạng:
//   # mã|cấp|tên tiếng Việt|tên tiếng Anh|công thức
//   > giải thích
//   e: câu ví dụ tiếng Anh|nghĩa tiếng Việt
//   q: câu hỏi|đáp án A;B;C;D|vị trí đáp án đúng (từ 0)|giải thích
export interface Exercise { id: string; topic: string; q: string; opts: string[]; a: number; why: string }
export interface Topic { id: string; level: Level; vi: string; en: string; formula: string; notes: string[]; examples: [string, string][]; exercises: Exercise[] }

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
# future|A2|Will và be going to|Will vs be going to|S + will + V  ·  S + am/is/are going to + V
> will dùng cho quyết định ngay lúc nói, lời hứa, lời đề nghị và dự đoán theo ý kiến.
> be going to dùng cho kế hoạch đã định trước và dự đoán dựa trên dấu hiệu nhìn thấy được.
e: The phone is ringing. I'll answer it.|Điện thoại đang reo. Để tôi nghe. (quyết định tức thì)
e: I'm going to visit my grandparents this weekend.|Cuối tuần này tôi sẽ đi thăm ông bà. (đã lên kế hoạch)
q: Look at those black clouds. It ___ rain.|will;is going to;goes to;is|1|Có dấu hiệu rõ ràng (mây đen) → be going to.
q: "I'm cold." "I ___ close the window."|am going to;will;going to;am|1|Quyết định ngay lúc nói → will.
q: We have bought the tickets. We ___ fly to Hanoi on Friday.|will;are going to;go;flew|1|Kế hoạch đã định trước → be going to.
q: I promise I ___ tell anyone.|am not going to;won't;don't;not|1|Lời hứa → will; phủ định là won't.
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
# passive|B1|Câu bị động|Passive voice|S + be + V3 (+ by ...)
> Dùng khi hành động quan trọng hơn người thực hiện, hoặc khi không biết hoặc không cần nêu người thực hiện.
> Động từ be chia theo thì của câu: is made, was made, has been made, will be made, can be made.
e: This bridge was built in 2010.|Cây cầu này được xây năm 2010.
e: English is spoken all over the world.|Tiếng Anh được nói trên khắp thế giới.
q: The letters ___ every morning.|deliver;are delivered;are delivering;delivered|1|Hiện tại đơn bị động: are + V3.
q: The window ___ by a ball yesterday.|was broken;broke;is broken;has broken|0|"yesterday" → quá khứ đơn bị động: was broken.
q: The report must ___ by Friday.|finish;be finished;finished;be finishing|1|Bị động sau động từ khuyết thiếu: must be + V3.
q: A new hospital ___ in our town next year.|will build;will be built;is built;builds|1|Tương lai bị động: will be + V3.
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
# third|B2|Câu điều kiện loại 3 và wish|Third conditional and wish|If + had + V3, would have + V3  ·  wish + had + V3
> Loại 3 nói về điều không có thật trong quá khứ và kết quả tưởng tượng của nó.
> wish + quá khứ hoàn thành diễn tả sự tiếc nuối về quá khứ; wish + quá khứ đơn diễn tả mong muốn trái với hiện tại.
e: If I had studied harder, I would have passed.|Nếu tôi học chăm hơn thì tôi đã đậu rồi.
e: I wish I had taken that job.|Ước gì tôi đã nhận công việc đó.
q: If we ___ earlier, we wouldn't have missed the train.|left;had left;have left;would leave|1|Loại 3: mệnh đề if dùng had + V3.
q: She would have called you if she ___ your number.|had;has had;had had;would have|2|Loại 3 với động từ have: had had.
q: I wish I ___ more when I was young.|travel;travelled;had travelled;would travel|2|Tiếc nuối về quá khứ → wish + had + V3.
q: I wish I ___ speak French.|can;could;had could;will|1|Mong muốn trái với hiện tại → wish + quá khứ: could.
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
# inversion|B2|Đảo ngữ nhấn mạnh|Inversion for emphasis|Never / Not only / Hardly + trợ động từ + S + V
> Khi trạng từ phủ định đứng đầu câu (never, rarely, not only, hardly, under no circumstances), trợ động từ đảo lên trước chủ ngữ.
> Cấu trúc này dùng trong văn viết trang trọng và giúp tăng điểm ngữ pháp trong IELTS Writing.
e: Never have I seen such a beautiful place.|Chưa bao giờ tôi thấy một nơi đẹp như vậy.
e: Not only does he sing, but he also dances.|Anh ấy không chỉ hát mà còn nhảy.
q: Rarely ___ such a talented student.|I have met;have I met;I met;did I met|1|"Rarely" đứng đầu câu → đảo trợ động từ: have I met.
q: Not only ___ late, but he also forgot the documents.|he was;was he;he is;did he|1|Not only + be đảo lên trước chủ ngữ: was he.
q: Hardly ___ the house when it started to rain.|I had left;had I left;I left;did I left|1|Hardly + had + S + V3 ... when.
q: Under no circumstances ___ this door be opened.|should;it should;does;is|0|Đảo ngữ với động từ khuyết thiếu: should this door be opened.
`
export const GRAMMAR: Topic[] = []
for (const line of RAW.trim().split('\n')) {
  const t = GRAMMAR[GRAMMAR.length - 1]
  if (line.startsWith('# ')) {
    const [id, level, vi, en, formula] = line.slice(2).split('|')
    GRAMMAR.push({ id, level: level as Level, vi, en, formula, notes: [], examples: [], exercises: [] })
  } else if (line.startsWith('> ')) t.notes.push(line.slice(2))
  else if (line.startsWith('e: ')) t.examples.push(line.slice(3).split('|') as [string, string])
  else if (line.startsWith('q: ')) {
    const [q, opts, a, why] = line.slice(3).split('|')
    t.exercises.push({ id: `g:${t.id}:${t.exercises.length + 1}`, topic: t.id, q, opts: opts.split(';'), a: Number(a), why })
  }
}
export const EXERCISES = GRAMMAR.flatMap((t) => t.exercises)
