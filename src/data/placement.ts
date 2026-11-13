import type { Level } from './vocab'
export interface Q { level: Level; q: string; opts: string[]; a: number }
const RAW = `
A2|She ___ to school every day.|go;goes;going;gone|1
A2|There ___ any milk in the fridge.|isn't;aren't;don't;doesn't|0
A2|I ___ a great film last night.|see;seen;saw;was see|2
A2|This bag is ___ than that one.|more cheap;cheaper;cheapest;the cheaper|1
A2|How ___ money do you need?|many;long;much;often|2
A2|Look! It ___ outside.|rains;is raining;rain;rained|1
B1|I ___ here since 2020.|live;am living;have lived;lived|2
B1|If it ___ tomorrow, we will cancel the trip.|rains;will rain;rained;would rain|0
B1|The letter ___ yesterday.|sent;was sent;is sending;has sent|1
B1|He ___ smoke, but he stopped two years ago.|used to;use to;was used to;is used to|0
B1|The man ___ car was stolen called the police.|who;which;whose;whom|2
B1|I'm looking forward ___ you again.|to see;seeing;to seeing;see|2
B1|She asked me where ___.|did I live;I lived;do I live;I live did|1
B2|If I ___ about the meeting, I would have come.|knew;had known;have known;would know|1
B2|___ the bad weather, the event was a success.|Although;Despite;However;Even|1
B2|I wish I ___ more time to study last year.|have;had;had had;would have|2
B2|The report ___ by the end of next week.|will have been finished;will finish;is finishing;has finished|0
B2|Not only ___ late, but he also forgot the documents.|he was;was he;he is;did he|1
B2|The number of students ___ steadily over the past decade.|rose;has risen;rises;is rising|1
B2|It is high time we ___ action on climate change.|take;took;will take;have taken|1
`
export const QUESTIONS: Q[] = RAW.trim().split('\n').map((l) => {
  const [level, q, opts, a] = l.split('|')
  return { level: level as Level, q, opts: opts.split(';'), a: Number(a) }
})
