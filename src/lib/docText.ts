/** 원문 맨 위의 "Documentation Index" 안내 인용구는 LLM용 메타 안내라 사람 뷰에서는 제거한다. */
export function stripFrontmatterNotice(md: string): string {
  return md.replace(/^> ## Documentation Index[\s\S]*?further\.\s*\n+/i, '')
}
