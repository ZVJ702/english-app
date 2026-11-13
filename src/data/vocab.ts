// Định dạng: từ|loại từ|nghĩa tiếng Việt|câu ví dụ (từ cần học đặt trong {ngoặc nhọn})
export type Level = 'A2' | 'B1' | 'B2'
export interface Word { id: string; word: string; pos: string; vi: string; ex: string; level: Level }

const A2 = `
advice|n|lời khuyên|Can you give me some {advice} about learning English?
agree|v|đồng ý|I {agree} with you about the plan.
arrive|v|đến nơi|The train will {arrive} at six o'clock.
borrow|v|mượn|Can I {borrow} your pen for a minute?
busy|adj|bận rộn|She is too {busy} to go out tonight.
choose|v|lựa chọn|You can {choose} any colour you like.
crowded|adj|đông đúc|The bus is always {crowded} in the morning.
decide|v|quyết định|We need to {decide} where to eat.
describe|v|mô tả|Can you {describe} your hometown?
forget|v|quên|Don't {forget} to lock the door.
healthy|adj|khỏe mạnh, lành mạnh|Eating vegetables keeps you {healthy}.
improve|v|cải thiện|I want to {improve} my writing.
invite|v|mời|They will {invite} us to the wedding.
journey|n|chuyến đi|The {journey} to Da Lat takes seven hours.
lend|v|cho mượn|Could you {lend} me some money?
neighbour|n|hàng xóm|My {neighbour} has two dogs.
order|v|gọi món, đặt hàng|I would like to {order} a coffee.
prefer|v|thích hơn|I {prefer} tea to coffee.
quiet|adj|yên tĩnh|The library is very {quiet}.
receive|v|nhận được|Did you {receive} my email?
repair|v|sửa chữa|He can {repair} the bike today.
save|v|tiết kiệm; cứu|I try to {save} money every month.
spend|v|tiêu (tiền), dành (thời gian)|I {spend} two hours a day on my phone.
tidy|adj|gọn gàng|Her desk is always {tidy}.
weather|n|thời tiết|The {weather} is hot in April.
worry|v|lo lắng|Don't {worry} about the test.
explain|v|giải thích|Please {explain} this word to me.
cheap|adj|rẻ|Street food here is very {cheap}.
dangerous|adj|nguy hiểm|It is {dangerous} to drive so fast.
polite|adj|lịch sự|Be {polite} to customers.
ticket|n|vé|I bought a {ticket} for the concert.
skill|n|kỹ năng|Writing is an important {skill}.
enough|det|đủ|We don't have {enough} time.
almost|adv|gần như, suýt|I {almost} missed the bus.
instead|adv|thay vào đó|Let's walk {instead} of taking a taxi.
`
const B1 = `
achieve|v|đạt được|She worked hard to {achieve} her goal.
afford|v|đủ khả năng chi trả|We cannot {afford} a new car this year.
apply|v|nộp đơn; áp dụng|He decided to {apply} for the job.
attitude|n|thái độ|A positive {attitude} helps you learn faster.
avoid|v|tránh|Try to {avoid} making the same mistake.
benefit|n|lợi ích|Regular exercise has a clear {benefit} for your health.
challenge|n|thử thách|Learning to write well is a real {challenge}.
compare|v|so sánh|It is useful to {compare} the two options.
complain|v|phàn nàn|Customers often {complain} about slow service.
confident|adj|tự tin|I feel more {confident} when I prepare well.
consider|v|cân nhắc, xem xét|You should {consider} all the options.
convenient|adj|tiện lợi|Online shopping is very {convenient}.
damage|v|làm hư hại|Smoking can {damage} your lungs.
deal with|phr v|xử lý, đối phó|She knows how to {deal with} difficult customers.
depend on|phr v|phụ thuộc vào|The price will {depend on} the size.
develop|v|phát triển|Reading helps children {develop} their imagination.
disappointed|adj|thất vọng|He was {disappointed} with his exam result.
discuss|v|thảo luận|We need to {discuss} the problem together.
effort|n|nỗ lực|Success requires a lot of {effort}.
environment|n|môi trường|We must protect the {environment}.
encourage|v|khuyến khích|Teachers should {encourage} students to ask questions.
experience|n|kinh nghiệm, trải nghiệm|She has five years of {experience} in sales.
expect|v|mong đợi, dự kiến|I {expect} the results next week.
familiar|adj|quen thuộc|This song sounds {familiar}.
figure out|phr v|tìm ra, hiểu ra|I can't {figure out} how this machine works.
give up|phr v|từ bỏ|Don't {give up} when it gets hard.
habit|n|thói quen|Reading before bed is a good {habit}.
handle|v|xử lý|Can you {handle} this task alone?
increase|v|tăng|The company wants to {increase} its sales.
influence|v|ảnh hưởng|Friends can strongly {influence} your choices.
manage|v|xoay xở; quản lý|She can {manage} a team of ten people.
opportunity|n|cơ hội|This job is a great {opportunity}.
opinion|n|ý kiến|In my {opinion}, the plan is too risky.
pay attention|phr|chú ý|Please {pay attention} to the instructions.
prevent|v|ngăn ngừa|Washing your hands can {prevent} illness.
provide|v|cung cấp|The hotel will {provide} breakfast.
purpose|n|mục đích|What is the {purpose} of this meeting?
realise|v|nhận ra|I didn't {realise} it was so late.
reduce|v|giảm|We should {reduce} plastic waste.
refuse|v|từ chối|He may {refuse} to answer the question.
rely on|phr v|dựa vào, tin cậy|You can {rely on} her in an emergency.
require|v|yêu cầu, đòi hỏi|This job will {require} good English.
responsible|adj|có trách nhiệm|Parents are {responsible} for their children.
result|n|kết quả|The {result} was better than we expected.
solve|v|giải quyết|We need to {solve} this problem quickly.
suggest|v|đề xuất, gợi ý|I {suggest} taking a short break.
support|v|ủng hộ, hỗ trợ|My family will always {support} me.
affect|v|ảnh hưởng đến|Lack of sleep can {affect} your memory.
advantage|n|lợi thế, ưu điểm|Speaking two languages is a big {advantage}.
disadvantage|n|bất lợi, nhược điểm|The main {disadvantage} of the flat is the noise.
available|adj|có sẵn|Is this shirt {available} in blue?
common|adj|phổ biến|Traffic jams are {common} in big cities.
similar|adj|tương tự|Your idea is {similar} to mine.
necessary|adj|cần thiết|It is {necessary} to book in advance.
especially|adv|đặc biệt là|I love fruit, {especially} mangoes.
however|adv|tuy nhiên|The room is small. {However}, it is very clean.
although|conj|mặc dù|{Although} it was raining, we went out.
therefore|adv|vì vậy|He was ill. {Therefore}, he stayed at home.
on the other hand|phr|mặt khác|City life is exciting. {On the other hand}, it is expensive.
look forward to|phr v|mong chờ|I {look forward to} hearing from you.
`
const B2 = `
significant|adj|đáng kể, quan trọng|There has been a {significant} rise in prices.
contribute|v|đóng góp|Everyone can {contribute} to protecting the planet.
consequence|n|hậu quả|Pollution is a serious {consequence} of rapid growth.
approach|n|cách tiếp cận|We need a new {approach} to teaching writing.
factor|n|yếu tố|Cost is the most important {factor} in our decision.
issue|n|vấn đề|Unemployment is a major social {issue}.
impact|n|tác động|Social media has a strong {impact} on teenagers.
evidence|n|bằng chứng|There is clear {evidence} that exercise reduces stress.
establish|v|thành lập, thiết lập|The government plans to {establish} a new university.
maintain|v|duy trì|It is hard to {maintain} a healthy lifestyle.
essential|adj|thiết yếu|Clean water is {essential} for life.
tend to|phr|có xu hướng|Young people {tend to} spend more time online.
whereas|conj|trong khi (đối lập)|He likes the city, {whereas} his wife prefers the countryside.
furthermore|adv|hơn nữa|The plan is cheap. {Furthermore}, it is easy to carry out.
nevertheless|adv|tuy vậy|The task was hard. {Nevertheless}, she finished it on time.
despite|prep|bất chấp, mặc dù|{Despite} the rain, the match continued.
due to|prep|do, bởi vì|The flight was late {due to} bad weather.
in addition|phr|ngoài ra|{In addition}, students can borrow books for free.
as a result|phr|kết quả là|He rarely slept. {As a result}, his work suffered.
demand|n|nhu cầu|There is a growing {demand} for online courses.
decline|v|giảm sút|Sales began to {decline} last year.
emphasise|v|nhấn mạnh|I would like to {emphasise} the importance of practice.
enable|v|cho phép, giúp có thể|Technology can {enable} people to work from home.
ensure|v|đảm bảo|Please {ensure} that all doors are locked.
estimate|v|ước tính|Experts {estimate} that prices will double.
generate|v|tạo ra|Tourism can {generate} a lot of jobs.
indicate|v|chỉ ra, cho thấy|The results {indicate} a change in behaviour.
involve|v|bao gồm, liên quan đến|The job will {involve} a lot of travel.
lead to|phr v|dẫn đến|Too much sugar can {lead to} health problems.
obtain|v|đạt được, thu được|You need to {obtain} a visa first.
occur|v|xảy ra|Accidents often {occur} at this corner.
participate|v|tham gia|All students should {participate} in the discussion.
policy|n|chính sách|The school has a strict {policy} on phones.
potential|adj|tiềm năng|We discussed the {potential} risks of the project.
priority|n|sự ưu tiên|Safety is our top {priority}.
relevant|adj|liên quan, phù hợp|Give {relevant} examples to support your idea.
replace|v|thay thế|Robots may {replace} many workers.
resource|n|tài nguyên, nguồn lực|Water is a limited {resource}.
solution|n|giải pháp|There is no simple {solution} to traffic jams.
sufficient|adj|đủ|We do not have {sufficient} data to decide.
trend|n|xu hướng|There is a {trend} towards working from home.
widespread|adj|lan rộng, phổ biến|There is {widespread} concern about air quality.
rapid|adj|nhanh chóng|The city has seen {rapid} growth.
gradual|adj|dần dần|There was a {gradual} increase in temperature.
beneficial|adj|có lợi|Regular reading is {beneficial} for your vocabulary.
drawback|n|hạn chế, nhược điểm|The main {drawback} of this phone is its price.
outcome|n|kết quả, kết cục|We are waiting for the {outcome} of the meeting.
play a role|phr|đóng vai trò|Parents {play a role} in their children's education.
take into account|phr|tính đến, cân nhắc|You should {take into account} the cost of living.
raise awareness|phr|nâng cao nhận thức|The campaign aims to {raise awareness} of recycling.
to some extent|phr|ở một mức độ nào đó|I agree with this view {to some extent}.
in terms of|phr|xét về mặt|The two phones are similar {in terms of} price.
it is widely believed|phr|nhiều người tin rằng|{It is widely believed} that travel broadens the mind.
cope with|phr v|đương đầu với|Many students struggle to {cope with} stress.
carry out|phr v|tiến hành, thực hiện|Scientists will {carry out} a new study.
`
function parse(block: string, level: Level): Word[] {
  return block.trim().split('\n').map((l) => {
    const [word, pos, vi, ex] = l.split('|')
    return { id: 'v:' + word, word, pos, vi, ex, level }
  })
}
export const WORDS: Word[] = [...parse(A2, 'A2'), ...parse(B1, 'B1'), ...parse(B2, 'B2')]
