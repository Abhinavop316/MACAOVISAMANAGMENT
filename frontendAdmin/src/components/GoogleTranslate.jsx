import React, { useEffect, useState } from 'react';
import '../style/GoogleTranslate.css';

export default function GoogleTranslate() {
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    // Check if script is already present
    const addGoogleTranslateScript = () => {
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,zh-TW,zh-CN,pt,es,fr,de,ja,ko,vi,th,id',
            autoDisplay: false
          },
          'google_translate_element'
        );
      }
    };

    addGoogleTranslateScript();
  }, []);

  const changeLanguage = (langCode) => {
    setActiveLang(langCode);
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="gt-wrapper">
      <div className="gt-quick-langs">
        <button
          className={`gt-lang-btn ${activeLang === 'zh-TW' ? 'active' : ''}`}
          onClick={() => changeLanguage('zh-TW')}
        >
          繁體中文
        </button>
        <span style={{ color: '#475569' }}>|</span>
        <button
          className={`gt-lang-btn ${activeLang === 'pt' ? 'active' : ''}`}
          onClick={() => changeLanguage('pt')}
        >
          Português
        </button>
        <span style={{ color: '#475569' }}>|</span>
        <button
          className={`gt-lang-btn ${activeLang === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          English
        </button>
      </div>

      <div className="gt-element-container">
        <div id="google_translate_element"></div>
      </div>
    </div>
  );
}
