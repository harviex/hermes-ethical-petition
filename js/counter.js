// ===========================
// 计数器系统 (GitHub Pages + Vercel API)
// 静态页面在GitHub Pages，计数器API在Vercel
// ===========================

const VERCEL_API_BASE = 'https://hermes-ethical-petition.vercel.app';

let hasSupported = false;

// 初始化
(async function() {
    await checkSupportStatus();
    await updateCounter();
    initSupportButton();
})();

// 检查是否已支持（通过Vercel API + localStorage备份）
async function checkSupportStatus() {
    // 先检查localStorage（快速响应）
    const supported = localStorage.getItem('hermes_supported') === 'true';
    if (supported) {
        hasSupported = true;
        updateButtonToSupported();
        return;
    }
    
    // 再通过API检查（更准确的IP检查）
    try {
        const response = await fetch(`${VERCEL_API_BASE}/api/check`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.supported) {
                hasSupported = true;
                localStorage.setItem('hermes_supported', 'true');
                updateButtonToSupported();
            }
        }
    } catch (error) {
        console.error('检查支持状态失败:', error);
        // 网络错误时不改变状态，依赖于localStorage
    }
}

// 更新按钮为"已支持"状态
function updateButtonToSupported() {
    const btn = document.getElementById('supportBtn');
    if (!btn) return;
    
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    btn.textContent = translations[lang].supported;
    btn.classList.add('supported');
    btn.disabled = true;
}

// 获取计数器数据（从Vercel API）
async function fetchCounterData() {
    try {
        const response = await fetch(`${VERCEL_API_BASE}/api/count`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取计数器数据失败:', error);
        return { count: 5 }; // 默认值
    }
}

// 更新计数器显示（带动画）
async function updateCounter() {
    try {
        const data = await fetchCounterData();
        animateCounter(data.count);
    } catch (error) {
        console.error('更新计数器失败:', error);
        const counterEl = document.getElementById('supportCount');
        if (counterEl) counterEl.textContent = '0';
    }
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

// 初始化支持按钮
function initSupportButton() {
    const btn = document.getElementById('supportBtn');
    if (btn) {
        btn.addEventListener('click', handleSupport);
    }
}

// 处理支持点击（调用Vercel API）
async function handleSupport() {
    if (hasSupported) {
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        alert(translations[lang].already_supported);
        return;
    }
    
    const btn = document.getElementById('supportBtn');
    btn.disabled = true;
    
    try {
        // 1. 调用Vercel API添加支持
        const response = await fetch(`${VERCEL_API_BASE}/api/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400 && errorData.error === 'Already supported') {
                // 已经支持过了
                hasSupported = true;
                localStorage.setItem('hermes_supported', 'true');
                updateButtonToSupported();
                const lang = document.documentElement.getAttribute('data-lang') || 'en';
                alert(translations[lang].already_supported);
                return;
            }
            throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // 2. 更新本地状态
        hasSupported = true;
        localStorage.setItem('hermes_supported', 'true');
        updateButtonToSupported();
        
        // 3. 更新计数器显示（带动画）
        animateCounter(result.count);
        
        // 4. 显示感谢信息
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
        
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        alert(translations[lang].support_error || 'Error: ' + error.message);
    }
}

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

// 页面加载时初始化
// updateGitHubStars() 已移除 - 不需要GitHub星标显示
