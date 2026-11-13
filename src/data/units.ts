import { GRAMMAR, type Exercise, type Topic } from './grammar'
import { PHRASES } from './phrases'
export const UNITS: Topic[] = [...GRAMMAR, ...PHRASES]
export const EXERCISES: Exercise[] = UNITS.flatMap((t) => t.exercises)
export const GRAMMAR_EXERCISES: Exercise[] = GRAMMAR.flatMap((t) => t.exercises)
