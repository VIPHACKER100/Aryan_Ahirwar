/**
 * Lightweight Bilingual EN / हिन्दी (Hindi) Switcher.
 * Demonstrates Aryan Ahirwar's flagship Hindi-first cybersecurity education mission
 * while setting proper lang attributes for assistive technologies (WCAG 3.1.2).
 */
const STORAGE_KEY = 'vh_lang';

const TRANSLATIONS = {
  en: {
    'hero.badge': 'CYBERSECURITY RESEARCHER & EDUCATOR',
    'hero.researchBadge': 'PEER-REVIEWED AUTHOR (2026)',
    'hero.alias': '> Founder & CEO, VIPHACKER.100',
    'hero.hint': 'Interactive 3D Stage: Drag empty background space to orbit the holographic core.',
    'about.titleMain': 'Founder &',
    'about.titleAccent': 'Cybersecurity Vision',
    'about.desc':
      'Democratizing offensive security research and ethical hacking skills through open-source tooling, structured triage, peer-reviewed research, and vernacular Hindi education.',
    'research.titleMain': 'Published',
    'research.titleAccent': 'Research Paper',
    'research.desc':
      'Peer-reviewed academic research integrating artificial intelligence, real-time computer vision, and IoT automation for occupancy-aware classroom energy management.',
    'skills.titleMain': 'Security &',
    'skills.titleAccent': 'Technical Arsenal',
    'projects.titleMain': 'Open-Source',
    'projects.titleAccent': 'Security Tools',
    'training.titleMain': 'Hindi',
    'training.titleAccent': 'Cybersecurity Mission',
    'training.desc':
      'Eliminating language barriers for Indian students. Rigorous security pedagogy in Hindi bridging foundational theory to practical defensive and offensive competence.',
    'training.c1.title': '01. Ethical Hacking Foundations',
    'training.c1.body':
      'Built for absolute beginners without prerequisites. Networking fundamentals, Linux CLI navigation, ethical boundaries, and legal frameworks taught 100% in Hindi.',
    'training.c2.title': '02. Web Pentesting & Bug Bounty',
    'training.c2.body':
      'Hands-on deep dives into Burp Suite workflows, SQL injection, authentication flaws, and real-world vulnerability triage balancing attacker and defender perspectives.',
    'training.c3.title': '03. Career & Responsible Disclosure',
    'training.c3.body':
      'Guiding Indian students toward recognized bug bounty programs, structured CVSS report writing, responsible disclosure ethics, and cybersecurity careers.',
    'faq.titleMain': 'Frequently Asked',
    'faq.titleAccent': 'Questions',
    'contact.titleMain': 'Direct',
    'contact.titleAccent': 'Transmission & Voice',
    'contact.desc':
      'Initiate direct contact for security inquiries, vulnerability triage discussions, academic collaboration, Hindi training workshops, or voice uplink.',
  },
  hi: {
    'hero.badge': 'साइबर सुरक्षा शोधकर्ता एवं शिक्षक',
    'hero.researchBadge': 'पीयर-रिव्यूड लेखक (2026)',
    'hero.alias': '> संस्थापक एवं सीईओ, VIPHACKER.100',
    'hero.hint': 'इंटरैक्टिव 3D स्टेज: होलोग्राफिक कोर घुमाने के लिए खाली बैकग्राउंड को ड्रैग करें।',
    'about.titleMain': 'संस्थापक एवं',
    'about.titleAccent': 'साइबर सुरक्षा दृष्टिकोण',
    'about.desc':
      'ओपन-सोर्स टूल्स, व्यवस्थित ट्राइएज, अकादमिक शोध और सरल हिन्दी शिक्षा के माध्यम से भारत के छात्रों के लिए एथिकल हैकिंग को सुलभ बनाना।',
    'research.titleMain': 'प्रकाशित',
    'research.titleAccent': 'शोध पत्र (Research)',
    'research.desc':
      'एआई (AI), रियल-टाइम कंप्यूटर विज़न और IoT ऑटोमेशन द्वारा स्मार्ट क्लासरूम ऊर्जा प्रबंधन पर प्रकाशित पीयर-रिव्यूड शोध पत्र।',
    'skills.titleMain': 'सुरक्षा एवं',
    'skills.titleAccent': 'तकनीकी क्षमताएं',
    'projects.titleMain': 'ओपन-सोर्स',
    'projects.titleAccent': 'सिक्योरिटी टूल्स',
    'training.titleMain': 'हिन्दी',
    'training.titleAccent': 'साइबर सुरक्षा मिशन',
    'training.desc':
      'भारतीय छात्रों के लिए भाषा की बाधा को समाप्त करना — सरल हिन्दी में व्यावहारिक और कानूनी एथिकल हैकिंग तथा साइबर डिफेंस प्रशिक्षण।',
    'training.c1.title': '01. एथिकल हैकिंग की बुनियाद',
    'training.c1.body':
      'शुरुआती छात्रों के लिए नेटवर्किंग, Linux CLI, कानूनी सीमाएं और एथिकल सिद्धांत — 100% सरल हिन्दी में।',
    'training.c2.title': '02. वेब पेंटेस्टिंग एवं बग बाउंटी',
    'training.c2.body':
      'Burp Suite, SQL इंजेक्शन, ऑथेंटिकेशन खामियां और वास्तविक वल्नरेबिलिटी ट्राइएज का व्यावहारिक अभ्यास।',
    'training.c3.title': '03. करियर एवं जिम्मेदार प्रकटीकरण',
    'training.c3.body':
      'छात्रों को मान्यता प्राप्त बग बाउंटी प्रोग्राम, CVSS रिपोर्ट लेखन और साइबर सुरक्षा करियर के लिए मार्गदर्शन।',
    'faq.titleMain': 'अक्सर पूछे जाने वाले',
    'faq.titleAccent': 'प्रश्न (FAQ)',
    'contact.titleMain': 'सीधा',
    'contact.titleAccent': 'संपर्क एवं संवाद',
    'contact.desc':
      'सिक्योरिटी ऑडिट, बग ट्राइएज चर्चा, अकादमिक सहयोग, या हिन्दी साइबर सुरक्षा कार्यशालाओं के लिए सीधे संपर्क करें।',
  },
};

export function initI18n() {
  const toggleBtn = document.getElementById('lang-toggle');
  const labelEl = document.getElementById('lang-label');
  let currentLang = localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en';

  function applyLang(lang) {
    currentLang = lang === 'hi' ? 'hi' : 'en';
    localStorage.setItem(STORAGE_KEY, currentLang);
    const dict = TRANSLATIONS[currentLang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && Object.hasOwn(dict, key)) {
        el.textContent = dict[key];
        if (currentLang === 'hi') {
          el.setAttribute('lang', 'hi');
        } else {
          el.removeAttribute('lang');
        }
      }
    });

    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(currentLang === 'hi'));
    }
    if (labelEl) {
      labelEl.textContent = currentLang === 'hi' ? 'हिन्दी' : 'EN';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyLang(currentLang === 'en' ? 'hi' : 'en');
    });
  }

  applyLang(currentLang);

  return {
    getLang: () => currentLang,
    setLang: applyLang,
  };
}
