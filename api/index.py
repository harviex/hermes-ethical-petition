from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import base64
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['https://harviex.github.io', 'http://localhost:8000', 'http://127.0.0.1:8000'])

# GitHub配置
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', '')
REPO_OWNER = 'harviex'
REPO_NAME = 'hermes-ethical-petition'
DATA_FILE_PATH = 'data/counter.json'

def get_github_file_content():
    """从GitHub读取文件内容"""
    import urllib.request
    
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{DATA_FILE_PATH}"
    headers = {
        'Authorization': f"token {GITHUB_TOKEN}",
        'Accept': 'application/vnd.github.v3+json'
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            content = base64.b64decode(data['content']).decode('utf-8')
            return json.loads(content), data['sha']
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {'count': 0, 'ips': []}, None
        raise

def save_github_file_content(data, sha=None):
    """保存数据到GitHub"""
    import urllib.request
    
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents/{DATA_FILE_PATH}"
    headers = {
        'Authorization': f"token {GITHUB_TOKEN}",
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
    
    content = base64.b64encode(json.dumps(data, indent=2).encode('utf-8')).decode('utf-8')
    
    body = {
        'message': f"Update counter: {data['count']} supporters",
        'content': content
    }
    if sha:
        body['sha'] = sha
    
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode('utf-8'),
        headers=headers,
        method='PUT'
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode())

def get_client_ip():
    """获取客户端真实IP"""
    if request.headers.get('X-Forwarded-For'):
        ips = request.headers.get('X-Forwarded-For').split(',')
        return ips[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

@app.route('/api/count', methods=['GET'])
def get_count():
    """获取当前支持数"""
    try:
        data, _ = get_github_file_content()
        return jsonify({'count': data.get('count', 0)})
    except Exception as e:
        print(f"Error getting count: {e}")
        return jsonify({'count': 0}), 500

@app.route('/api/check', methods=['GET'])
def check_support():
    """检查当前IP是否已支持"""
    try:
        client_ip = get_client_ip()
        data, _ = get_github_file_content()
        
        has_supported = client_ip in data.get('ips', [])
        return jsonify({'supported': has_supported})
    except Exception as e:
        print(f"Error checking support: {e}")
        return jsonify({'supported': False}), 500

@app.route('/api/support', methods=['POST'])
def add_support():
    """添加支持（每个IP一次）"""
    try:
        client_ip = get_client_ip()
        
        # 读取当前数据
        data, sha = get_github_file_content()
        
        # 检查是否已支持
        if client_ip in data.get('ips', []):
            return jsonify({'error': 'Already supported', 'count': data['count']}), 400
        
        # 添加支持
        if 'ips' not in data:
            data['ips'] = []
        
        data['ips'].append(client_ip)
        data['count'] = len(data['ips'])
        
        # 保存到GitHub
        save_github_file_content(data, sha)
        
        return jsonify({'success': True, 'count': data['count']})
    except Exception as e:
        print(f"Error adding support: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)
