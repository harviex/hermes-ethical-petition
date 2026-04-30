// ===========================
// 计数器系统 (GitHub Pages - 静态版本)
// 只读模式：显示静态计数 + localStorage记录本地支持状态
// ===========================

const REPO_OWNER = 'harviex';
const REPO_NAME = 'hermes-ethical-petition';
const COUNTER_ISSUE_NUMBER = 1;

let hasSupported = false;

// 初始化
(async function() {
    await checkSupportStatus();
    await updateCounter();
    initSupportButton();
})();

// 检查是否已支持（通过localStorage）
function checkSupportStatus() {
    const supported = localStorage.getItem('hermes_supported') === 'true';
    hasSupported = supported;
    
    if (hasSupported) {
        const btn = document.getElementById('supportBtn');
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        btn.textContent = translations[lang].supported;
        btn.classList.add('supported');
        btn.disabled = true;
    }
}

// 获取计数器数据（从GitHub Issue只读）
async function fetchCounterData() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${COUNTER_ISSUE_NUMBER}`
        );
        const issue = await response.json();
        
        // Issue body存储JSON: {"count": 0, "ips": []}
        const data = JSON.parse(issue.body);
        return data;
    } catch (error) {
        console.error('获取计数器数据失败:', error);
        return { count: 0, ips: [] };
    }
}

// 更新计数器显示（带动画）
async function updateCounter() {
    try {
        const data = await fetchCounterData();
        animateCounter(data.count);
    } catch (error) {
        console.error('更新计数器失败:', error);
        document.getElementById('supportCount').textContent = '0';
    }
}

// 数字滚动动画
function animateCounter(target) {
    const counterEl = document.getElementById('supportCount');
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
    btn.addEventListener('click', handleSupport);
}

// 处理支持点击（静态版本：只记录本地状态 + 打开GitHub）
async function handleSupport() {
    if (hasSupported) {
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        alert(translations[lang].already_supported);
        return;
    }

    const btn = document.getElementById('supportBtn');
    btn.disabled = true;

    try {
        // 1. 更新本地状态
        hasSupported = true;
        localStorage.setItem('hermes_supported', 'true');
        
        const lang = document.documentElement.getAttribute('data-lang') || 'en';
        btn.textContent = translations[lang].supported;
        btn.classList.add('supported');
        
        // 2. 打开GitHub星标页面
        window.open('https://github.com/harviex/hermes-ethical-petition', '_blank');

        // 3. 显示提示
        setTimeout(() => {
            alert('🧡 Thank you for your support! \n\nTo see the live counter, please deploy the full version to Vercel.\n\nFor now, please star the GitHub repo to amplify our voice!');
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
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
        const data = await response.json();
        document.getElementById('githubStars').textContent = data.stargazers_count.toLocaleString();
    } catch (error) {
        console.error('获取GitHub星标失败:', error);
        document.getElementById('githubStars').textContent = 'N/A';
    }
}

// 页面加载时获取GitHub星标
updateGitHubStars();
