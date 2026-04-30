// Vercel Serverless Function - Add Support
const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  // First, get current data
  const getOptions = {
    hostname: 'api.github.com',
    path: '/repos/harviex/hermes-ethical-petition/issues/1',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'vercel-app'
    }
  };
  
  https.get(getOptions, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const issue = JSON.parse(data);
        const counterData = JSON.parse(issue.body);
        
        // Check if already supported
        if (counterData.ips && counterData.ips.includes(clientIP)) {
          return res.status(400).json({ error: 'Already supported', count: counterData.count });
        }
        
        // Add support
        if (!counterData.ips) counterData.ips = [];
        counterData.ips.push(clientIP);
        counterData.count = counterData.ips.length;
        
        // Save back to GitHub Issue
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
        
        const patchReq = https.request(patchOptions, (patchRes) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.json({ success: true, count: counterData.count });
        });
        
        patchReq.on('error', (error) => {
          res.status(500).json({ error: error.message });
        });
        
        patchReq.write(patchData);
        patchReq.end();
        
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }).on('error', (error) => {
    res.status(500).json({ error: error.message });
  });
};
