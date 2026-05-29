exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key no configurada.' }) }
  }

  let brandContext
  try {
    ({ brandContext } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido.' }) }
  }

  if (!brandContext?.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Falta brandContext.' }) }
  }

  const prompt = `Analizá este brand system y extraé exactamente 6 colores y 3 tipografías.

Devolvé ÚNICAMENTE este JSON sin markdown ni texto adicional:
{
  "primary": "#RRGGBB o null",
  "primary2": "#RRGGBB o null",
  "secondary": "#RRGGBB o null",
  "secondary2": "#RRGGBB o null",
  "accent": "#RRGGBB o null",
  "accent2": "#RRGGBB o null",
  "fonts": {
    "title": "Nombre exacto de la fuente o null",
    "body": "Nombre exacto de la fuente o null",
    "aux": "Nombre exacto de la fuente o null"
  }
}

Definiciones:
- primary: color principal de texto
- primary2: color secundario de texto (ej: blanco sobre fondos oscuros)
- secondary: color de fondo principal
- secondary2: color de fondo alternativo
- accent: color de énfasis/acento principal
- accent2: color de acento secundario
- fonts.title: tipografía para titulares
- fonts.body: tipografía para cuerpo de texto
- fonts.aux: tipografía auxiliar / small caps / datos

Usá null si no podés determinarlo con certeza.
Los nombres de fuentes deben ser exactamente como aparecen en el brand system.

BRAND SYSTEM:
${brandContext.trim()}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 400 }
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Error Gemini ${res.status}: ${errText}` }) }
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'No se pudo extraer datos del brand system.' }) }
    }

    let parsed
    try { parsed = JSON.parse(match[0]) } catch {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Respuesta malformada.' }) }
    }

    const colors = {}
    for (const key of ['primary', 'primary2', 'secondary', 'secondary2', 'accent', 'accent2']) {
      const val = parsed[key]
      colors[key] = (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val)) ? val : null
    }

    const fonts = {}
    for (const role of ['title', 'body', 'aux']) {
      const val = parsed.fonts?.[role]
      fonts[role] = (typeof val === 'string' && val.trim()) ? val.trim() : null
    }

    return { statusCode: 200, headers, body: JSON.stringify({ colors, fonts }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: `Error interno: ${err.message}` }) }
  }
}
