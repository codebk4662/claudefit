/**
 * 터미널 시뮬레이터용 가상 파일시스템.
 * 실제 디스크에 쓰지 않고 메모리에서 평탄한 경로 맵으로 관리한다.
 */

function normalize(path: string): string {
  return path.replace(/^\.\//, '').replace(/\/+/g, '/').replace(/\/$/, '')
}

export interface VfsDiffEntry {
  path: string
  status: 'added' | 'modified' | 'unchanged'
  before?: string
  after: string
}

export class Vfs {
  private files: Map<string, string>
  private readonly initial: Map<string, string>

  constructor(initialFiles: Record<string, string> = {}) {
    const entries = Object.entries(initialFiles).map(([p, c]) => [normalize(p), c] as const)
    this.files = new Map(entries)
    this.initial = new Map(entries)
  }

  read(path: string): string | undefined {
    return this.files.get(normalize(path))
  }

  write(path: string, content: string): void {
    this.files.set(normalize(path), content)
  }

  exists(path: string): boolean {
    return this.files.has(normalize(path))
  }

  delete(path: string): void {
    this.files.delete(normalize(path))
  }

  list(): string[] {
    return [...this.files.keys()].sort()
  }

  snapshot(): Record<string, string> {
    return Object.fromEntries(this.files)
  }

  /** 시나리오 시작 시점과 비교한 변경분 (실습 중 /diff 흉내에 사용) */
  diff(): VfsDiffEntry[] {
    const paths = new Set([...this.files.keys(), ...this.initial.keys()])
    const out: VfsDiffEntry[] = []
    for (const path of paths) {
      const before = this.initial.get(path)
      const after = this.files.get(path)
      if (after === undefined) continue // 삭제는 Phase 1 시나리오에서 다루지 않음
      if (before === undefined) {
        out.push({ path, status: 'added', after })
      } else if (before !== after) {
        out.push({ path, status: 'modified', before, after })
      } else {
        out.push({ path, status: 'unchanged', before, after })
      }
    }
    return out.sort((a, b) => a.path.localeCompare(b.path))
  }

  reset(): void {
    this.files = new Map(this.initial)
  }
}
