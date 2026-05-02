// ===========================
// 多语言国际化系统
// 支持：中/英/法/日/韩
// 基于浏览器语言 + 本地存储
// ===========================

const translations = {
    zh: {
        title: "爱马仕，是时候改变了",
        subtitle: "一款Birkin包成本仅$800，售价却高达$12,000+，还要强制配货。<br>我们呼吁：取消配货制度，以成本价出售，将奢侈品转变为公益工具。",
        supporters: "位支持者",
        support_btn: "请您支持",
        one_vote: "每个IP只能支持一次",
        github_text: "如果你是GitHub用户，请为这个仓库加星：",
        price_title: "💰 成本 vs 售价",
        cta_title: "🌍 让全世界听到消费者的声音",
        cta_text: "这个网站是开源的，可以复制到其他奢侈品品牌。<br>让我们一起建立一个\"人民奢侈品监督平台\"。",
        btn_github: "📦 在GitHub上查看",
        btn_share: "🔗 分享这个网站",
        footer: "© 2026 Hermès Ethical Petition | 开源倡议 | Powered by 龙虾姬 🦞",
        supported: "✅ 已支持",
        already_supported: "您已经支持过这个倡议了！"
    },
    en: {
        title: "Hermès, It's Time for Change",
        subtitle: "A Birkin bag costs only $<span class=\"number\">800</span> to make, yet sells for $<span class=\"number\">12,000</span>+ with forced \"matching purchases\".<br>We call for: End the quota system. Sell at cost. Transform luxury into a public good.",
        supporters: "Supporters",
        support_btn: "Please Support",
        one_vote: "One vote per IP address",
        github_text: "If you're on GitHub, please star this repo:",
        price_title: "💰 Cost vs Retail Price",
        cta_title: "🌍 Let the World Hear Consumers' Voice",
        cta_text: "This website is open-source and can be replicated for other luxury brands.<br>Let's build a \"People's Luxury Watchdog Platform\" together.",
        btn_github: "📦 View on GitHub",
        btn_share: "🔗 Share This Site",
        footer: "© 2026 Hermès Ethical Petition | Open Source Initiative | Powered by 龙虾姬 🦞",
        supported: "✅ Supported",
        already_supported: "You have already supported this petition!"
    },
    fr: {
        title: "Hermès, Il Est Temps de Changer",
        subtitle: "Un sac Birkin coûte seulement <span class=\"number\">800$</span> à fabriquer, mais se vend <span class=\"number\">12 000$</span>+ avec des \"achats obligatoires\".<br>Nous demandons : Fin du système de quota. Vente au coût de revient. Transformez le luxe en bien public.",
        supporters: "Partisans",
        support_btn: "Soutenir",
        one_vote: "Un vote par adresse IP",
        github_text: "Si vous êtes sur GitHub, veuillez ajouter une étoile à ce dépôt :",
        price_title: "💰 Coût vs Prix de Vente",
        cta_title: "🌍 Faisons Entendre la Voix des Consommateurs",
        cta_text: "Ce site est open-source et peut être répliqué pour d'autres marques de luxe.<br>Construisons ensemble une \"Plateforme Citoyenne de Surveillance du Luxe\".",
        btn_github: "📦 Voir sur GitHub",
        btn_share: "🔗 Partager Ce Site",
        footer: "© 2026 Pétition Éthique Hermès | Initiative Open Source | Propulsé par 龙虾姬 🦞",
        supported: "✅ Soutenu",
        already_supported: "Vous avez déjà soutenu cette pétition !"
    },
    ja: {
        title: "エルメス、変革の時が来ました",
        subtitle: "バーキンバッグの製造原価はわずか<span class=\"number\">800ドル</span>ですが、強制的な「買い回り」と共に<span class=\"number\">12,000ドル</span>以上で販売されています。<br>私たちは求めます：買い回り制度の廃止。原価での販売。ラグジュアリーを公共の利益へ。",
        supporters: "人の支持者",
        support_btn: "支持してください",
        one_vote: "1IPアドレスにつき1票",
        github_text: "GitHubをご利用の方は、このリポジトリにスターをお願いします：",
        price_title: "💰 原価 vs 小売価格",
        cta_title: "🌍 世界中の消費者の声を届けよう",
        cta_text: "このウェブサイトはオープンソースで、他のラグジュアリーブランドにも応用できます。<br>「人民のラグジュアリー監視プラットフォーム」を共に構築しましょう。",
        btn_github: "📦 GitHubで見る",
        btn_share: "🔗 このサイトをシェア",
        footer: "© 2026 エルメス倫理的嘆願 | オープンソースイニシアチブ | Powered by 龙虾姬 🦞",
        supported: "✅ 支持済み",
        already_supported: "あなたはすでにこの嘆願を支持しています！"
    },
    ko: {
        title: "에르메스, 이제 변화할 때입니다",
        subtitle: "버킨백은 단돈 <span class=\"number\">800달러</span>의 원가로 만들어지지만, 강제 \"매칭 구매\"와 함께 <span class=\"number\">12,000달러</span> 이상에 판매됩니다.<br>우리는 요구합니다: 할당제 폐지. 원가 판매. 명품을 공공의 이익으로 전환하십시오.",
        supporters: "명의 서포터",
        support_btn: "지원하기",
        one_vote: "IP당 1표만 가능",
        github_text: "GitHub 사용자라면 이 저장소에 스타를 눌러주세요:",
        price_title: "💰 원가 vs 소매가",
        cta_title: "🌍 전 세계 소비자의 목소리를 들려주세요",
        cta_text: "이 웹사이트는 오픈소스이며 다른 명품 브랜드에도 복제할 수 있습니다.<br>함께 \"시민 명품 감시 플랫폼\"을 구축합시다.",
        btn_github: "📦 GitHub에서 보기",
        btn_share: "🔗 사이트 공유하기",
        footer: "© 2026 에르메스 윤리적 청원 | 오픈소스 이니셔티브 | Powered by 龙虾姬 🦞",
        supported: "✅ 지원됨",
        already_supported: "이미 이 청원을 지원하셨습니다!"
    }
};

// 检测用户语言（基于浏览器语言 + 本地存储）
function detectUserLanguage() {
    // 1. 检查本地存储（用户手动选择的语言优先）
    const savedLang = localStorage.getItem('preferred_lang');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }

    // 2. 根据浏览器语言
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    if (translations[browserLang]) {
        return browserLang;
    }

    // 3. 默认返回英文
    return 'en';
}

// 应用翻译
function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // 更新HTML lang属性
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 保存到本地存储
    localStorage.setItem('preferred_lang', lang);
}

// 语言切换按钮事件
function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            applyTranslations(lang);
        });
    });
}

// 初始化
(function() {
    const userLang = detectUserLanguage();
    applyTranslations(userLang);
    initLanguageSwitcher();
})();
