// ===========================
// 计数器系统 (GitHub Pages - 完整版)
// 使用 GitHub API + JSON数据文件 + IP查重
// ===========================

const REPO_OWNER = 'harviex';
const REPO_NAME = 'hermes-ethical-petition';
const DATA_FILE_PATH = 'data/counter.json';
const GITHUB_API_BASE = 'https://api.github.com';

// GitHub Token (必须配置！)
// 从仓库设置或Netlify/Vercel环境变量获取
// 如果是纯前端，可以存在页面meta标签或单独配置文件
let GITHUB_TOKEN = '';

// 初始化token（从页面读取或prompt用户输入）
function initGitHubToken() {
    // 方法1：从页面meta读取（推荐）
    const metaToken = document.querySelector('meta[name="github-token"]');
    if (metaToken) {
        GITHUB_TOKEN = metaToken.content;
        return;
    }
    
    // 方法2：从localStorage读取（如果之前保存过）
    const savedToken = localStorage.getItem('gh_token');
    if (savedToken) {
        GITHUB_TOKEN = savedToken;
        return;
    }
    
    // 方法3：提示用户输入（仅管理员）
    // GITHUB_TOKEN = prompt('Enter GitHub Token:');
    // localStorage.setItem('gh_token', GITHUB_TOKEN);
}

// 获取客户端真实IP
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('获取IP失败:', error);
        return null;
    }
}

// 从GitHub读取计数器数据
async function fetchCounterData() {
    try {
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                // 文件不存在，创建初始数据
                console.warn('counter.json不存在，将创建初始数据');
                return { count: 0, ips: [] };
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const fileData = await response.json();
        const content = atob(fileData.content); // Base64解码
        const data = JSON.parse(content);
        
        // 缓存sha用于后续更新
        window._counterFileSha = fileData.sha;
        
        return data;
    } catch (error) {
        console.error('读取计数器数据失败:', error);
        return { count: 0, ips: [] };
    }
}

// 更新GitHub上的计数器数据
async function updateCounterData(data) {
    if (!GITHUB_TOKEN) {
        throw new Error('GitHub Token未配置！');
    }
    
    try {
        const content = btoa(JSON.stringify(data, null, 2)); // Base64编码
        const sha = window._counterFileSha;
        
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Update counter: ${data.count} supporters`,
                    content: content,
                    sha: sha
                })
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${errorData.message}`);
        }
        
        const result = await response.json();
        window._counterFileSha = result.content.sha;
        
        return true;
    } catch (error) {
        console.error('更新计数器数据失败:', error);
        throw error;
    }
}

// 检查IP是否已支持
async function checkIfSupported(ip, data) {
    if (!ip || !data.ips) return false;
    return data.ips.includes(ip);
}

// 数字滚动动画
function animateCounter(target) {
    const counterEl = document.getElementById('supportCount');
    if (!counterEl) return;
    
    const current = parseInt(counterEl.textContent.replace(/,/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutExpo 缓动函数
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = Math.floor(current + (target - current) * eased);
        
        counterEl.textContent = value.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            counterEl.style.animation = 'countPulse 0.5s ease-out';
            setTimeout(() => {
                counterEl.style.animation = '';
            }, 500);
        }
    }
    
    requestAnimationFrame(update);
}

// 更新按钮状态
function updateButtonStatus(hasSupported) {
    const btn = document.getElementById('supportBtn');
    if (!btn) return;
    
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    
    if (hasSupported) {
        btn.textContent = translations[lang].supported;
        btn.classList.add('supported');
        btn.disabled = true;
    } else {
        btn.textContent = translations[lang].support_btn;
        btn.classList.remove('supported');
        btn.disabled = false;
    }
}

// 处理支持点击
async function handleSupport() {
    if (hasSupported) {
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        alert(translations[lang].already_supported);
        return;
    }
    
    const btn = document.getElementById('supportBtn');
    btn.disabled = true;
    
    try {
        // 1. 获取客户端IP
        const clientIP = await getClientIP();
        if (!clientIP) {
            throw new Error('无法获取IP地址');
        }
        
        // 2. 读取当前数据
        let data = await fetchCounterData();
        
        // 3. 检查是否已支持
        if (data.ips && data.ips.includes(clientIP)) {
            hasSupported = true;
            updateButtonStatus(true);
            alert(translations[document.documentElement.getAttribute('data-lang') || 'en'].already_supported);
            return;
        }
        
        // 4. 添加支持
        if (!data.ips) data.ips = [];
        data.ips.push(clientIP);
        data.count = data.ips.length;
        
        // 5. 更新GitHub
        await updateCounterData(data);
        
        // 6. 更新本地状态
        hasSupported = true;
        updateButtonStatus(true);
        animateCounter(data.count);
        
        // 7. 显示感谢信息
        setTimeout(() => {
            const lang = document.documentElement.getAttribute('data-lang') || 'en';
            const thanksMsg = lang === 'zh' 
                ? '🧡 感谢你的支持！' 
                : '🧡 Thank you for your support!';
            alert(thanksMsg);
        }, 500);
        
    } catch (error) {
        console.error('支持失败:', error);
        btn.disabled = false;
        alert('Error: ' + error.message);
    }
}

// 初始化
let hasSupported = false;

(async function() {
    // 初始化GitHub Token
    initGitHubToken();
    
    // 获取客户端IP
    const clientIP = await getClientIP();
    
    // 读取计数器数据
    const data = await fetchCounterData();
    
    // 检查是否已支持
    if (clientIP) {
        hasSupported = await checkIfSupported(clientIP, data);
    }
    
    // 更新计数器显示
    animateCounter(data.count || 0);
    
    // 更新按钮状态
    updateButtonStatus(hasSupported);
    
    // 绑定按钮事件
    const btn = document.getElementById('supportBtn');
    if (btn) {
        btn.addEventListener('click', handleSupport);
    }
})();

// 分享网站
function shareSite() {
    const url = window.location.href;
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const text = lang === 'zh' 
        ? '爱马仕，是时候改变了！支持这个公益倡议 🧡' 
        : 'Hermès, it\'s time for change! Support this ethical petition 🧡';
    
    if (navigator.share) {
        navigator.share({
            title: 'Hermès Ethical Petition',
            text: text,
            url: url
        });
    } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// 获取GitHub星标数
async function updateGitHubStars() {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`);
        const data = await response.json();
        const starsEl = document.getElementById('githubStars');
        if (starsEl) {
            starsEl.textContent = data.stargazers_count.toLocaleString();
        }
    } catch (error) {
        console.error('获取GitHub星标失败:', error);
        const starsEl = document.getElementById('githubStars');
        if (starsEl) {
            starsEl.textContent = 'N/A';
        }
    }
}

// 页面加载时获取GitHub星标
updateGitHubStars();
