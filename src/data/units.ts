import { GRAMMAR, type Exercise } from './grammar'
export const EXERCISES: Exercise[] = GRAMMAR.flatMap((t) => t.exercises)
