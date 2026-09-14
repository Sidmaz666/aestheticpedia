import ZAI from 'z-ai-web-dev-sdk'
async function main() {
  const zai = await ZAI.create()
  const r = await zai.chat.completions.create({ messages: [{ role: 'user', content: 'Reply with the single word: OK' }], max_tokens: 5 })
  console.log('LLM OK:', r.choices[0]?.message?.content)
}
main().catch((e) => { console.log('LLM FAIL:', String(e.message).slice(0, 120)); process.exit(1) })
