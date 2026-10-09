import { useEffect, useState } from 'react'
import { SearchIndex } from '@/engine/search'
import { loadSearchCorpus } from './docsClient'

let built: SearchIndex | null = null
let buildingPromise: Promise<SearchIndex> | null = null

function buildIndex(): Promise<SearchIndex> {
  if (built) return Promise.resolve(built)
  if (!buildingPromise) {
    buildingPromise = loadSearchCorpus().then((docs) => {
      const idx = new SearchIndex()
      idx.addAll(docs)
      built = idx
      return idx
    })
  }
  return buildingPromise
}

export function useSearchIndex() {
  const [index, setIndex] = useState<SearchIndex | null>(built)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (built) return
    let cancelled = false
    buildIndex()
      .then((idx) => {
        if (!cancelled) setIndex(idx)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { index, loading: !index && !error, error }
}
