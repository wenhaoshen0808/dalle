// api/generate-image.js
export default async function handler(req, res) {
  // 允许所有来源跨域请求（开发阶段用 *，生产建议限制域名）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: '服务器未配置 API 密钥' });
  }

  const { prompt } = req.body;
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt 不能为空' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await openaiResponse.json();

    if (openaiResponse.ok) {
      return res.status(200).json(data);
    } else {
      return res.status(openaiResponse.status).json(data);
    }
  } catch (error) {
    console.error('调用 OpenAI 接口失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}
