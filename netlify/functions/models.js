exports.handler = async () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { statusCode: 500, body: 'No API key' }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
  const text = await res.text()
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: text
  }
}
