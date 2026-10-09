import type { Module } from '../types'
import { T1_MODULES } from './t1'
import { T2_MODULES } from './t2'
import { T3_MODULES } from './t3'
import { T4_MODULES } from './t4'
import { T5_MODULES } from './t5'

export const ALL_MODULES: Module[] = [...T1_MODULES, ...T2_MODULES, ...T3_MODULES, ...T4_MODULES, ...T5_MODULES]

export const moduleById = new Map(ALL_MODULES.map((m) => [m.id, m]))
