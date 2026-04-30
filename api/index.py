from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import ipaddress

app = Flask(__name__)
CORS(app)

# 数据文件
DATA_FILE = 'data/counter.json'

def load_data():
    """加载计数器数据"""
    if not os.path.exists(DATA_FILE):
        return {'count': 0, 'ips': []}
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    """保存计数器数据"""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_client_ip():
    """获取客户端真实IP"""
    # 检查代理头
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
    data = load_data()
    return jsonify({'count': data['count']})

@app.route('/api/check', methods=['GET'])
def check_support():
    """检查当前IP是否已支持"""
    client_ip = get_client_ip()
    data = load_data()
    
    has_supported = client_ip in data.get('ips', [])
    return jsonify({'supported': has_supported})

@app.route('/api/support', methods=['POST'])
def add_support():
    """添加支持（每个IP一次）"""
    client_ip = get_client_ip()
    data = load_data()
    
    # 检查是否已支持
    if client_ip in data.get('ips', []):
        return jsonify({'error': 'Already supported', 'count': data['count']}), 400
    
    # 添加支持
    if 'ips' not in data:
        data['ips'] = []
    
    data['ips'].append(client_ip)
    data['count'] = len(data['ips'])
    
    # 记录时间戳
    if 'history' not in data:
        data['history'] = []
    data['history'].append({
        'ip': client_ip,
        'timestamp': datetime.utcnow().isoformat()
    })
    
    save_data(data)
    
    return jsonify({'success': True, 'count': data['count']})

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计信息（管理用）"""
    data = load_data()
    return jsonify({
        'total_supporters': data['count'],
        'unique_ips': len(data.get('ips', [])),
        'recent_supports': data.get('history', [])[-10:] if 'history' in data else []
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({'status': 'ok', 'timestamp': datetime.utcnow().isoformat()})

# Vercel Serverless 入口
if __name__ == '__main__':
    app.run(debug=True, port=5000)
