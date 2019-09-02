export const canUseDOM: boolean = !!(
  typeof window !== 'undefined' && window.document
)
