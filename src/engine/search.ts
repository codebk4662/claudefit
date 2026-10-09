/**
 * 가벼운 전문 검색 인덱스. 한글은 음절 2-gram으로, 영문/숫자는 단어 단위로 토큰화한다.
 * (일반 영문 토크나이저는 한글 조사/활용 변화에 약해 "훅"으로 "훅을", "훅이"를 못 찾는다.)
 */

const HANGUL_RUN = /[가-힣]+/g
const LATIN_WORD = /[a-z0-9][a-z0-9._-]*/g

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase()
  const tokens: string[] = []

  let m: RegExpExecArray | null
  LATIN_WORD.lastIndex = 0
  while ((m = LATIN_WORD.exec(lower))) tokens.push(m[0])

  HANGUL_RUN.lastIndex = 0
  while ((m = HANGUL_RUN.exec(lower))) {
    const run = m[0]
    // 음절 단위(1-gram)를 항상 넣어 "훅을"처럼 조사가 붙은 2글자 단어에서도
    // "훅" 한 글자 검색이 걸리게 하고, 2글자 이상이면 bigram도 추가해 복합어 매칭 정밀도를 높인다.
    for (const ch of run) tokens.push(ch)
    if (run.length >= 2) {
      for (let i = 0; i < run.length - 1; i++) tokens.push(run.slice(i, i + 2))
    }
  }

  return tokens
}

export interface SearchDoc {
  id: string
  title: string
  body: string
  group?: string
}

export interface SearchHit {
  id: string
  title: string
  group?: string
  score: number
  snippet: string
}

interface Posting {
  freq: number
}

export class SearchIndex {
  private docs = new Map<string, SearchDoc>()
  private postings = new Map<string, Map<string, Posting>>() // token -> docId -> posting

  add(doc: SearchDoc): void {
    this.docs.set(doc.id, doc)
    const titleTokens = tokenize(doc.title)
    const bodyTokens = tokenize(doc.body)

    const freqs = new Map<string, number>()
    for (const t of titleTokens) freqs.set(t, (freqs.get(t) ?? 0) + 3) // 제목 가중치 3배
    for (const t of bodyTokens) freqs.set(t, (freqs.get(t) ?? 0) + 1)

    for (const [token, freq] of freqs) {
      let m = this.postings.get(token)
      if (!m) {
        m = new Map()
        this.postings.set(token, m)
      }
      m.set(doc.id, { freq })
    }
  }

  addAll(docs: SearchDoc[]): void {
    for (const d of docs) this.add(d)
  }

  search(query: string, limit = 20): SearchHit[] {
    const tokens = tokenize(query)
    if (tokens.length === 0) return []

    const scores = new Map<string, number>()
    for (const token of tokens) {
      const m = this.postings.get(token)
      if (!m) continue
      for (const [docId, posting] of m) {
        scores.set(docId, (scores.get(docId) ?? 0) + posting.freq)
      }
    }

    // 음절 1-gram만 우연히 겹치는 경우(예: 조사 "하"가 서로 다른 단어에 공통으로 들어있는 경우)를
    // 걸러내기 위한 최소 점수. 제목 가중치(3)나 본문에서 2회 이상 등장하면 충분히 넘는 값이다.
    // 트레이드오프: 본문에 정확히 1회만 등장하는 한 글자 검색어는 걸러질 수 있다.
    const MIN_SCORE = 2

    return [...scores.entries()]
      .filter(([, score]) => score >= MIN_SCORE)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId, score]) => {
        const doc = this.docs.get(docId)!
        return { id: docId, title: doc.title, group: doc.group, score, snippet: makeSnippet(doc.body, query) }
      })
  }
}

function makeSnippet(body: string, query: string, radius = 60): string {
  const firstWord = query.trim().split(/\s+/)[0]?.toLowerCase()
  if (!firstWord) return body.slice(0, radius * 2)
  const idx = body.toLowerCase().indexOf(firstWord)
  if (idx === -1) return body.slice(0, radius * 2)
  const start = Math.max(0, idx - radius)
  const end = Math.min(body.length, idx + firstWord.length + radius)
  return (start > 0 ? '…' : '') + body.slice(start, end).replace(/\s+/g, ' ') + (end < body.length ? '…' : '')
}
