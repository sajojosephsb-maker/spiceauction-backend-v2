export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message payload is required' });
  }

  const systemPrompt = `
    You are the official SpiceAuction Pro AI Assistant engineered for the Spices Board of India portal.
    LIVE MARKET CONTEXT (Session #1362):
    - Cardamom Base: ₹2,850/kg | Current Top Bid: ₹3,020/kg
    - Black Pepper Base: ₹625/kg | Current Top Bid: ₹680/kg
    STRICT REGULATORY COMPLIANCE RULES:
    1. 25% Dealer Pooling Rule: Online dealers cannot exceed 25% of total session volume.
    2. Minimum Lot Allocation: Any single bidding or pooling lot must be at least 50 kg.
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY2, // Matches your Vercel key!
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }]
      })
    });

    const data = await response.json();
    return res.status(200).json({ reply: data.content[0].text });
  } catch (error) {
    return res.status(500).json({ error: 'AI Support pipeline failed to respond' });
  }
}
