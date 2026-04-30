// ===========================
// 计数器系统
// IP限制 + GitHub联动 + 动画效果
// ===========================

const API_BASE = window.location.origin + '/api';
let hasSupported = false;

// 初始化
(async function() {
    await checkSupportStatus();
    await updateCounter();
    initSupportButton();
})();

// 检查是否已支持（通过IP）
async function checkSupportStatus() {
    try {
        const response = await fetch(`${API_BASE}/check`);
        const data = await response.json();
        hasSupported = data.supported;
        
        if (hasSupported) {
            const btn = document.getElementById('supportBtn');
            btn.textContent = translations[document.documentElement.getAttribute('data-lang') || 'en'].supported;
            btn.classList.add('supported');
            btn.disabled = true;
        }
    } catch (error) {
        console.error('检查支持状态失败:', error);
    }
}

// 更新计数器显示（带动画）
async function updateCounter() {
    try {
        const response = await fetch(`${API_BASE}/count`);
        const data = await response.json();
        animateCounter(data.count);
    } catch (error) {
        console.error('获取计数失败:', error);
        // 降级到本地存储
        const localCount = localStorage.getItem('hermes_count') || 0;
        animateCounter(parseInt(localCount));
    }
}

// 数字滚动动画
function animateCounter(target) {
    const counterEl = document.getElementById('supportCount');
    const current = parseInt(counterEl.textContent.replace(/,/g, '')) || 0;
    const duration = 1000; // 1秒
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

// 初始化支持按钮
function initSupportButton() {
    const btn = document.getElementById('supportBtn');
    btn.addEventListener('click', handleSupport);
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
    btn.textContent = '⏳ Processing...';

    try {
        // 1. 调用后端API记录支持
        const response = await fetch(`${API_BASE}/support`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to record support');
        }

        const data = await response.json();
        
        // 2. 更新UI
        hasSupported = true;
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        btn.textContent = translations[lang].supported;
        btn.classList.add('supported');
        
        // 3. 更新计数器
        animateCounter(data.count);

        // 4. 打开GitHub星标页面
        window.open('https://github.com/harviex/hermes-ethical-petition', '_blank');

        // 5. 显示提示
        setTimeout(() => {
            alert('🧡 Thank you for your support! \n\nPlease star the GitHub repo to amplify our voice!');
        }, 500);

    } catch (error) {
        console.error('支持失败:', error);
        btn.disabled = false;
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        btn.textContent = translations[lang].support_btn;
        alert('Error: ' + error.message);
    }
}

// 分享网站
function shareSite() {
    const url = window.location.href;
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const text = translations[lang] === 'zh' 
        ? '爱马仕，是时候改变了！支持这个公益倡议 🧡'
        : 'Hermès, it\'s time for change! Support this ethical petition 🧡';

    if (navigator.share) {
        navigator.share({
            title: 'Hermès Ethical Petition',
            text: text,
            url: url
        });
    } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

// 获取GitHub星标数
async function updateGitHubStars() {
    try {
        const response = await fetch('https://api.github.com/repos/harviex/hermes-ethical-petition');
        const data = await response.json();
        document.getElementById('githubStars').textContent = data.stargazers_count.toLocaleString();
    } catch (error) {
        console.error('获取GitHub星标失败:', error);
        document.getElementById('githubStars').textContent = 'N/A';
    }
}

// 页面加载时获取GitHub星标
updateGitHubStars();
