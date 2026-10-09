import { describe, it, expect } from 'vitest'
import { stripFrontmatterNotice } from '@/lib/docText'

describe('stripFrontmatterNotice', () => {
  it('실제 문서 형식의 안내 인용구를 제거한다 (대문자 Use 포함)', () => {
    const md = [
      '> ## Documentation Index',
      '> Fetch the complete documentation index at: https://code.claude.com/docs/llms.txt',
      '> Use this file to discover all available pages before exploring further.',
      '',
      '# 개요',
      '',
      '본문',
    ].join('\n')
    const out = stripFrontmatterNotice(md)
    expect(out.startsWith('# 개요')).toBe(true)
    expect(out).not.toContain('Documentation Index')
  })

  it('안내 인용구가 없으면 원문을 그대로 둔다', () => {
    const md = '# 제목\n\n본문'
    expect(stripFrontmatterNotice(md)).toBe(md)
  })
})
