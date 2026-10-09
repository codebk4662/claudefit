import type { Item } from '../types'
import { T1_ITEMS } from './t1'
import { T2_ITEMS } from './t2'
import { T3_ITEMS } from './t3'
import { T4_ITEMS } from './t4'
import { T5_ITEMS } from './t5'

export const ALL_ITEMS: Item[] = [...T1_ITEMS, ...T2_ITEMS, ...T3_ITEMS, ...T4_ITEMS, ...T5_ITEMS]

export const itemById = new Map(ALL_ITEMS.map((i) => [i.id, i]))
