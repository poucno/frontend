// Slovenian has separate forms for 1, 2, 3–4 and all other numbers.
export function pluralSl(count: number, [one, two, few, many]: [string, string, string, string]): string {
  const rest = count % 100
  if (rest === 1) return one
  if (rest === 2) return two
  if (rest === 3 || rest === 4) return few
  return many
}

export const COLLECTION_FORMS: [string, string, string, string] = ['zbirka', 'zbirki', 'zbirke', 'zbirk']
export const QUESTION_FORMS: [string, string, string, string] = ['vprašanje', 'vprašanji', 'vprašanja', 'vprašanj']
export const DRAFT_FORMS: [string, string, string, string] = ['osnutek', 'osnutka', 'osnutki', 'osnutkov']
