import { describe, it, expect } from 'vitest'
import { SearchIndex, tokenize } from '@/engine/search'

describe('tokenize', () => {
  it('한글은 2글자 이하면 통째로, 그 이상이면 2-gram으로 쪼갠다', () => {
    expect(tokenize('훅')).toEqual(['훅'])
    expect(tokenize('훅을')).toContain('훅')
    expect(tokenize('권한모드')).toEqual(expect.arrayContaining(['권한', '한모', '모드']))
  })

  it('영문/숫자는 단어 단위로 소문자화한다', () => {
    expect(tokenize('CLAUDE.md 파일')).toEqual(expect.arrayContaining(['claude.md', '파일']))
  })
})

describe('SearchIndex', () => {
  const idx = new SearchIndex()
  idx.addAll([
    { id: 'hooks', title: '훅 참조', body: 'PreToolUse 훅은 도구 실행 전에 실행되며 권한을 거부할 수 있다.' },
    { id: 'mcp', title: 'MCP 연결', body: 'MCP 서버를 연결하면 외부 도구를 사용할 수 있다.' },
  ])

  it('조사가 붙어도 검색된다 (훅을 -> 훅 문서 매칭)', () => {
    const hits = idx.search('훅을')
    expect(hits[0]?.id).toBe('hooks')
  })

  it('제목 매칭이 본문 매칭보다 점수가 높다', () => {
    const hits = idx.search('MCP')
    expect(hits[0]?.id).toBe('mcp')
  })

  it('매칭 없으면 빈 배열', () => {
    expect(idx.search('존재하지않는검색어zzz')).toEqual([])
  })
})
