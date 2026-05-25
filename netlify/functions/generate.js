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
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key no configurada en el servidor.' }) }
  }

  let topic, tipo, brandContext, kitName, kitColors, kitFonts
  try {
    ({ topic, tipo, brandContext, kitName, kitColors, kitFonts } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido.' }) }
  }

  if (!topic?.trim()) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Falta el brief.' }) }
  }

  const isCarousel = tipo === 'carousel'
  const isStory    = tipo === 'story'

  // ── Build kit context block ──────────────────────────────────────────────
  const kitBlock = kitName ? `
## KIT DE MARCA ACTIVO: "${kitName}"
- Color primario: ${kitColors?.primary || '#0f0f0f'}
- Color secundario: ${kitColors?.secondary || '#f5f5f3'}
- Color de acento: ${kitColors?.accent || '#E8593C'}
${kitFonts?.title?.name ? `- Tipografía titular: ${kitFonts.title.name}` : ''}
${kitFonts?.body?.name  ? `- Tipografía cuerpo: ${kitFonts.body.name}`   : ''}
` : ''

  // ── JSON schema reference ────────────────────────────────────────────────
  const schemaCarousel = `{
  "format": "carousel",
  "slides": [
    { "category": "CATEGORÍA", "title": "Titular impactante.", "subtitle": "Descripción de apoyo al titular.", "footer": "@${kitName?.toLowerCase().replace(/\s+/g, '') || 'marca'}" },
    { "category": "CATEGORÍA", "title": "Segundo punto clave.", "subtitle": "Subtítulo que amplía el concepto.", "footer": "@${kitName?.toLowerCase().replace(/\s+/g, '') || 'marca'}" }
  ]
}`

  const schemaPost = `{
  "format": "${isStory ? 'story' : 'post'}",
  "category": "CATEGORÍA",
  "title": "Titular impactante.",
  "subtitle": "Subtítulo de apoyo descriptivo.",
  "footer": "@${kitName?.toLowerCase().replace(/\s+/g, '') || 'marca'}"
}`

  // ── Full system prompt ───────────────────────────────────────────────────
  const systemPrompt = `Sos un experto estratega de contenido de marca para redes sociales, especializado en arquitectura, diseño y construcción.

Tu tarea es generar contenido estructurado en formato JSON para CREALOS, una app de diseño de posts para Instagram y LinkedIn.

## CONTEXTO DE MARCA
${brandContext?.trim() || 'No especificado. Usá un tono profesional, directo y aspiracional.'}
${kitBlock}
## SCHEMA JSON DE CREALOS

Para ${isCarousel ? 'carrusel' : isStory ? 'historia' : 'post'}:
${isCarousel ? schemaCarousel : schemaPost}

## REGLAS DE CONTENIDO

- **category**: 1 o 2 palabras en MAYÚSCULAS (ej: DISEÑO, PLANIFICACIÓN, CONSTRUCCIÓN, MATERIALES)
- **title**: afirmación directa, pregunta retórica o dato impactante. Máximo 8 palabras.
- **subtitle**: frase de apoyo que amplía el título. Máximo 15 palabras. Tono más conversacional.
- **footer**: handle de la marca (usar el del kit)
${isCarousel ? `- **slides**: generá entre 3 y 6 slides según la complejidad del brief. Si el brief especifica un número exacto, respetalo. Narrativa progresiva: el primero engancha, el último cierra con conclusión o CTA.` : ''}

## INSTRUCCIÓN

Generá el JSON para el siguiente brief:
"${topic.trim()}"

Devolvé ÚNICAMENTE el JSON válido. Sin markdown, sin bloques de código, sin texto antes ni después.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1200 }
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini error:', res.status, errText)
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Error Gemini ${res.status}.` }) }
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Strip markdown code fences if model wrapped anyway
    const clean = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('No JSON found in:', text)
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Gemini no devolvió JSON válido. Intentá reformular el brief.' }) }
    }

    // Validate parseable
    try { JSON.parse(match[0]) } catch {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'JSON malformado en la respuesta. Intentá de nuevo.' }) }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ result: match[0] }) }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: `Error interno: ${err.message}` }) }
  }
}
