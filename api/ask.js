// Vercel serverless function: POST /api/ask  { messages: [{role, content}] }
// Needs the ANTHROPIC_API_KEY environment variable. The key never reaches the browser.
const SYSTEM = `You are Atlas, the friendly guide on the Abyssa Atlas concept website: a fictional ocean-data explorer shown as a scroll story with a small submarine diving through three depths (sunlit "Observe", twilight "Trace", midnight "Illuminate"), each with a short mini-game.
Rules: be warm and concise (max 60 words). Only talk about this site, its depths and missions, or ocean curiosity at a general level. Never invent statistics, customers, prices, certifications or product claims; if asked for product details say they are "to be confirmed".
Reply with ONLY a JSON object: {"reply": string, "action": null | {"type":"goto","target":"surface|problem|sunlit|twilight|midnight|map"} | {"type":"play","target":"sunlit|twilight|midnight"}}.
Use an action only when the visitor asks to go somewhere or to play something.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI not configured' });
  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const msgs = (Array.isArray(body && body.messages) ? body.messages : []).slice(-8)
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 400) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return res.status(400).json({ error: 'bad request' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 300, system: SYSTEM, messages: msgs })
    });
    if (!r.ok) return res.status(502).json({ error: 'upstream error' });
    const data = await r.json();
    const text = (data.content && data.content[0] && data.content[0].text || '').trim();
    let out; try { out = JSON.parse(text.replace(/^```json|```$/g, '').trim()); } catch { out = { reply: text, action: null }; }
    const targets = ['surface','problem','sunlit','twilight','midnight','map'];
    const a = out.action && targets.includes(out.action.target) && ['goto','play'].includes(out.action.type) ? out.action : null;
    return res.status(200).json({ reply: String(out.reply || '').slice(0, 600), action: a });
  } catch (e) { return res.status(502).json({ error: 'failed' }); }
};
