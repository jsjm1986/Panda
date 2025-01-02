document.addEventListener('DOMContentLoaded', function() {
    const languageSelector = document.getElementById('languageSelector');
    
    // 设置默认语言
    let currentLang = localStorage.getItem('language') || 'zh';
    languageSelector.value = currentLang;
    updateContent(currentLang);

    // 语言切换监听
    languageSelector.addEventListener('change', function(e) {
        const lang = e.target.value;
        updateContent(lang);
        localStorage.setItem('language', lang);
    });
});

function updateContent(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    const translations = {
        'zh': zhLang,
        'en': enLang,
        'ru': ruLang,
        'ar': arLang,
        'kk': kkLang,
        'fr': frLang,
        'ja': jaLang,
        'de': deLang
    }[lang];

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    document.documentElement.lang = lang;
    
    // 为阿拉伯语添加RTL支持
    if (lang === 'ar') {
        document.body.dir = 'rtl';
    } else {
        document.body.dir = 'ltr';
    }
} 