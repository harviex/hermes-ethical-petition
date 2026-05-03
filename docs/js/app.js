// ===========================
// 主应用逻辑
// 价格对比 + 初始化
// ===========================

// 价格数据（由后端API提供，这里作为fallback）
const fallbackPrices = [
    {
        product: "Birkin 30",
        official_price: 12000,
        estimated_cost: 800,
        currency: "$",
        specs: "Togo leather, gold hardware"
    },
    {
        product: "Kelly 28",
        official_price: 10500,
        estimated_cost: 750,
        currency: "$",
        specs: "Epsom leather, palladium hardware"
    },
    {
        product: "Constance 18",
        official_price: 8500,
        estimated_cost: 600,
        currency: "$",
        specs: "Chevre leather, gold hardware"
    },
    {
        product: "Silk Twilly",
        official_price: 450,
        estimated_cost: 15,
        currency: "$",
        specs: "100% silk, hand-rolled edges"
    },
    {
        product: "Clic H Bracelet",
        official_price: 770,
        estimated_cost: 50,
        currency: "$",
        specs: "Gold plated, enamel"
    },
    {
        product: "Evelyne 29",
        official_price: 3200,
        estimated_cost: 200,
        currency: "$",
        specs: "Clemence leather, canvas strap"
    }
];

// 加载价格数据
async function loadPrices() {
    try {
        const response = await fetch('/data/prices.json');
        const prices = await response.json();
        renderPrices(prices);
    } catch (error) {
        console.error('加载价格数据失败，使用fallback:', error);
        renderPrices(fallbackPrices);
    }
}

// 渲染价格卡片（带动画）
function renderPrices(prices) {
    const grid = document.getElementById('priceGrid');
    grid.innerHTML = '';

    prices.forEach((item, index) => {
        const markup = Math.round((item.official_price / item.estimated_cost - 1) * 100);
        const card = document.createElement('div');
        card.className = 'price-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out backwards';

        card.innerHTML = `
            <h3>${item.product}</h3>
            <div class="price-row">
                <span class="price-label">${getTranslation('official_price') || 'Official Price'}</span>
                <span class="price-value official">${item.currency}${item.official_price.toLocaleString()}</span>
            </div>
            <div class="price-row">
                <span class="price-label">${getTranslation('estimated_cost') || 'Est. Cost'}</span>
                <span class="price-value cost">${item.currency}${item.estimated_cost.toLocaleString()}</span>
            </div>
            <div class="price-row">
                <span class="price-label">${getTranslation('markup') || 'Markup'}</span>
                <span class="price-value markup">${markup}%</span>
            </div>
            <div style="margin-top: 15px; font-size: 0.85rem; color: #666;">
                ${item.specs}
            </div>
            <div style="margin-top: 10px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                <div style="width: ${Math.min(markup / 20, 100)}%; height: 100%; background: linear-gradient(90deg, #10b981, #FF6B35); border-radius: 3px; transition: width 1s ease-out;"></div>
            </div>
        `;

        grid.appendChild(card);
    });

    // 在价格网格后添加说明文字
    const disclaimer = document.createElement('div');
    disclaimer.className = 'price-disclaimer';
    disclaimer.style.cssText = 'text-align: center; margin-top: 30px; padding: 15px; color: #888; font-size: 0.85rem; line-height: 1.6;';
    disclaimer.innerHTML = getTranslation('price_disclaimer') || '價格由AI根據網絡數量估算，可能不完全準確。';
    grid.appendChild(disclaimer);
}

// 获取当前语言的翻译（简单版）
function getTranslation(key) {
    const lang = document.documentElement.getAttribute('data-lang') || 'en';
    const translations_map = {
        'official_price': {
            zh: '官方售價',
            en: 'Official Price',
            fr: 'Prix Officiel',
            ja: '小売価格',
            ko: '소매가'
        },
        'estimated_cost': {
            zh: '估算成本',
            en: 'Est. Cost',
            fr: 'Coût Est.',
            ja: '原価（推定）',
            ko: '원가 (추정)'
        },
        'markup': {
            zh: '加價率',
            en: 'Markup',
            fr: 'Majoration',
            ja: 'マークアップ率',
            ko: '마크업'
        },
        'price_disclaimer': {
            zh: '價格由AI根據網絡數量估算，可能不完全準確。',
            en: 'Prices estimated by AI based on web data. Accuracy may vary.',
            fr: 'Prix estimés par l\'IA selon les données web. La précision peut varier.',
            ja: '価格はAIによるウェブデータ推定です。精度は保証されません。',
            ko: '가격은 AI가 웹 데이터를 기반으로 추정한 것입니다. 정확도는 다를 수 있습니다.'
        }
    };

    return translations_map[key] ? translations_map[key][lang] : key;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPrices();
    
    // 监听语言切换事件，重新渲染价格卡片
    document.addEventListener('languageChanged', () => {
        loadPrices();
    });
});

// 导出供其他脚本使用
window.loadPrices = loadPrices;
