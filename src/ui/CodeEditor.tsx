import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'

interface CodeEditorProps {
  initialValue: string
  onChange: (value: string) => void
  language: 'json' | 'markdown'
}

/**
 * CodeMirror 6의 최소 래퍼. 부모가 리렌더될 때마다 에디터를 다시 만들지 않도록
 * onChange만 ref로 추적하고, 에디터 자체는 마운트 시 한 번만 생성한다.
 * 과제를 바꿀 때는 호출부에서 `key`를 바꿔 통째로 재마운트시킨다.
 */
export function CodeEditor({ initialValue, onChange, language }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current) return
    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        language === 'json' ? json() : markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString())
        }),
        EditorView.theme({
          // 코드 가독성을 위해 라이트/다크 시스템 설정과 무관하게 항상 밝은 편집 영역을 유지하되,
          // 거터·선택 영역은 앱의 차콜+골드 팔레트와 같은 색상군(따뜻한 중성색)으로 맞춘다.
          '&': { fontSize: '14px', backgroundColor: '#fffdf8', color: '#1e1c16' },
          '.cm-content': { fontFamily: 'ui-monospace, Consolas, monospace', caretColor: '#96722a' },
          '.cm-gutters': { backgroundColor: '#f2ede0', color: '#8a8068', border: 'none' },
          '.cm-activeLine': { backgroundColor: 'rgba(150, 114, 42, 0.06)' },
          '.cm-activeLineGutter': { backgroundColor: 'rgba(150, 114, 42, 0.1)' },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(150, 114, 42, 0.18) !important' },
        }),
      ],
    })
    const view = new EditorView({ state, parent: hostRef.current })
    return () => view.destroy()
    // initialValue/language는 마운트 시점에만 쓰고, 이후 변경은 key로 재마운트해서 반영한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={hostRef} className="rounded-lg border border-[var(--border)] overflow-hidden" style={{ minHeight: '280px' }} />
}
