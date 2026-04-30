// Vercel Serverless Function - Add Support (Fixed)
const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // Helper: make HTTPS request
  const makeRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, data });
        });
      });
      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  };
  
  try {
    // 1. Get current issue data
    const getOptions = {
      hostname: 'api.github.com',
      path: '/repos/harviex/hermes-ethical-petition/issues/1',
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'vercel-app'
      }
    };
    
    const getData = await makeRequest(getOptions);
    if (getData.statusCode !== 200) {
      return res.status(500).json({ error: 'Failed to get issue', details: getData.data });
    }
    
    const issue = JSON.parse(getData.data);
    const counterData = JSON.parse(issue.body);
    
    // 2. Check if already supported
    if (counterData.ips && counterData.ips.includes(clientIP)) {
      return res.status(400).json({ error: 'Already supported', count: counterData.count });
    }
    
    // 3. Add support
    if (!counterData.ips) counterData.ips = [];
    counterData.ips.push(clientIP);
    counterData.count = counterData.ips.length;
    
    // 4. Save back to GitHub
    const patchData = JSON.stringify({
      body: JSON.stringify(counterData, null, 2)
    });
    
    const patchOptions = {
      hostname: 'api.github.com',
      path: '/repos/harviex/hermes-ethical-petition/issues/1',
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(patchData)
      }
    };
    
    const patchResult = await makeRequest(patchOptions, patchData);
    if (patchResult.statusCode !== 200) {
      return res.status(500).json({ error: 'Failed to update issue', details: patchResult.data });
    }
    
    // 5. Return success
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ success: true, count: counterData.count });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
