export function normalizeResearchData(data: any) {
  const normalizeArray = (arr: any[]) => {
    return arr.map(item => ({
      text: Array.isArray(item.text) ? item?.text.join(" ") : String(item.text || ""),
      source: String(item?.source || ""),
      title: String(item?.title || "")
    }))
  }

  return {
    claims: normalizeArray(data.claims || []),
    quotes: normalizeArray(data.quotes || []),
    statistics: normalizeArray(data.statistics || [])
  }
}