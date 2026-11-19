import { CyberAudio, initAudioControls } from './audio.js';
import { initTiltCards } from './tilt.js';
import { initWebGLController } from './webgl.js';
import { initNavigation } from './navigation.js';
import { initTerminal } from './terminal.js';
import { initReposDeck } from './repos.js';
import { initContactForm } from './contact.js';
import { initI18n } from './i18n.js';

const INLINE_FALLBACK_PROFILE = {
  identity: {
    name: 'Aryan Ahirwar',
    alias: 'VIPHACKER.100',
    degree: 'Bachelor of Computer Applications (BCA)',
    institution: 'SAGE University, Indore',
    location: 'Shujalpur, Madhya Pradesh, India',
    githubUser: 'VIPHACKER100',
  },
  contact: {
    phoneDisplay: '+91 73897 18429',
    phoneHref: '+917389718429',
    whatsappUrl: 'https://wa.me/917389718429',
    email: 'viphacker.100.org@gmail.com',
    web3formsAccessKey: '',
    socials: {
      github: 'https://github.com/VIPHACKER100',
      linkedin: 'https://www.linkedin.com/in/viphacker100/',
      youtube: 'https://www.youtube.com/@viphacker100',
      telegram: 'https://t.me/viphacker100',
      instagram: 'https://www.instagram.com/viphacker.100/',
    },
  },
  research: {
    id: 'VB-2026-0013',
    title:
      'An AI-Based Occupancy-Aware Smart Energy Management System for Classroom Automation Using Computer Vision and IOT',
    authors: ['Teena Yadav (Assistant Professor)', 'Anjali Dewda', 'Aryan Ahirwar'],
    journal: 'Vindhyan Bloom Research Journal',
    issn: '2319-8478',
    volume: '15',
    issue: '2',
    publishedDisplay: '23 Apr 2026',
    doi: '10.5281/zenodo.19737528',
    doiUrl: 'https://doi.org/10.5281/zenodo.19737528',
    journalUrl: 'https://vindhyanbloom.com/paper_detail.php?id=VB-2026-0013',
    pdfUrl: 'https://vindhyanbloom.com/uploads/papers/PUB_18_20260425.pdf',
    localPage: './research/smart-energy-iot.html',
    bibtex:
      '@article{yadav2026occupancy,\n  title={An AI-Based Occupancy-Aware Smart Energy Management System for Classroom Automation Using Computer Vision and IOT},\n  author={Yadav, Teena and Dewda, Anjali and Ahirwar, Aryan},\n  journal={Vindhyan Bloom Research Journal},\n  volume={15},\n  number={2},\n  year={2026},\n  issn={2319-8478},\n  doi={10.5281/zenodo.19737528}\n}',
    apa: 'Yadav, T., Dewda, A., & Ahirwar, A. (2026). An AI-Based Occupancy-Aware Smart Energy Management System for Classroom Automation Using Computer Vision and IOT. Vindhyan Bloom Research Journal, 15(2). https://doi.org/10.5281/zenodo.19737528',
  },
  repos: {
    blockList: [
      'VIPBOMBER-V2',
      'tbomb',
      'SnapBrute',
      'SocialMediaHackingToolkit',
      'insta-hack',
      'defacement',
      'Activate_Microsoft_Office_All',
    ],
    featuredOrder: [
      'ReconMaster',
      'VIPSQLi',
      'DarkWin-AATK',
      'LLM-COUNCIL',
      'PhishShield-Engine',
      'DarkWin-NGASR',
      'vip-sqli-scanner-dashboard',
      'OSINT-TOOLs',
      'Inkflow',
    ],
    descriptions: {},
    categoryMap: {
      ReconMaster: 'recon',
      VIPSQLi: 'tools',
      'DarkWin-AATK': 'tools',
      'LLM-COUNCIL': 'ai',
      'PhishShield-Engine': 'ai',
    },
    fallback: [],
  },
};

async function loadProfile() {
  try {
    const res = await fetch('./data/profile.json', { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return INLINE_FALLBACK_PROFILE;
    return await res.json();
  } catch {
    return INLINE_FALLBACK_PROFILE;
  }
}

function wireCopyButton(buttonId, statusId, textToCopy, successMessage) {
  const btn = document.getElementById(buttonId);
  const status = document.getElementById(statusId);
  if (!btn || !status) return;

  let clearTimer = 0;
  btn.addEventListener('click', () => {
    if (!navigator.clipboard?.writeText) {
      status.textContent = `[i] Copy manually: ${textToCopy}`;
      return;
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        status.textContent = successMessage;
        CyberAudio.success();
        clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => {
          status.textContent = '';
        }, 3200);
      })
      .catch(() => {
        status.textContent = '[!] Clipboard access unavailable.';
      });
  });
}

async function bootstrap() {
  initAudioControls();
  initNavigation();
  initTiltCards();
  initWebGLController();

  const i18n = initI18n();
  const profile = await loadProfile();

  initTerminal(profile, CyberAudio, i18n);
  initReposDeck(profile);
  initContactForm(profile, CyberAudio);

  // Accessible Copy Triggers (Keyboard + Screen-Reader live status)
  wireCopyButton(
    'copy-phone-trigger',
    'copy-phone-toast',
    profile.contact.phoneHref,
    '[+] Phone number copied to clipboard!'
  );
  wireCopyButton(
    'copy-email-trigger',
    'copy-toast',
    profile.contact.email,
    '[+] Email address copied to clipboard!'
  );
  wireCopyButton(
    'copy-bibtex-btn',
    'citation-status',
    profile.research.bibtex,
    '[+] BibTeX citation copied to clipboard!'
  );
  wireCopyButton(
    'copy-apa-btn',
    'citation-status',
    profile.research.apa,
    '[+] APA citation copied to clipboard!'
  );

  const yearSpan = document.getElementById('year-span');
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }
}

bootstrap();
