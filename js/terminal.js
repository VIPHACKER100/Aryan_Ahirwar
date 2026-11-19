/**
 * Interactive Cyber Command Console (recon@viphacker100)
 * - IME-safe Enter handling (isComposing || keyCode === 229) + native <form> submit
 * - Trusted-Types-safe DOM rendering (zero innerHTML; uses replaceChildren)
 * - ArrowUp/ArrowDown history, Tab autocomplete, clickable links, cancellable scan
 */
export function initTerminal(profile, audio, i18n) {
  const screen = document.getElementById('term-screen');
  const form = document.getElementById('cli-form');
  const input = document.getElementById('cli-input');
  if (!screen || !form || !input) return;

  const history = [];
  let historyIndex = -1;
  const activeTimers = new Set();

  function cancelPendingTimers() {
    activeTimers.forEach((id) => clearTimeout(id));
    activeTimers.clear();
  }

  function scheduleLine(delayMs, fn) {
    const id = window.setTimeout(() => {
      activeTimers.delete(id);
      fn();
    }, delayMs);
    activeTimers.add(id);
  }

  function printLine(text, type = '') {
    const line = document.createElement('div');
    line.className = type ? `t-line ${type}` : 't-line';
    line.textContent = text;
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }

  function printLinkLine(prefix, label, href, type = 'info') {
    const line = document.createElement('div');
    line.className = `t-line ${type}`;
    line.appendChild(document.createTextNode(prefix));

    const anchor = document.createElement('a');
    anchor.className = 't-link';
    anchor.textContent = label;
    anchor.href = href;
    if (href.startsWith('https://')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    line.appendChild(anchor);
    screen.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
  }

  const { identity, contact, research } = profile;

  const COMMANDS = {
    help() {
      printLine('[+] Available Commands (Tab to autocomplete, Up/Down for history):', 'info');
      printLine('  whoami     - Identity & credentials');
      printLine('  paper      - Peer-reviewed research publication & DOI');
      printLine('  bibtex     - Copy/print BibTeX citation for the 2026 paper');
      printLine('  skills     - Capabilities & pentesting stack');
      printLine('  repos      - Flagship open-source security tools');
      printLine('  phone      - Direct voice & WhatsApp uplink');
      printLine('  contact    - Verified communication channels');
      printLine('  security   - Responsible disclosure policy (RFC 9116)');
      printLine('  mission    - Hindi cybersecurity education charter');
      printLine('  lang       - Switch interface language (lang en | lang hi)');
      printLine('  scan       - Run simulated perimeter check');
      printLine('  sound      - Toggle synthesized audio FX');
      printLine('  clear      - Clear console output');
    },
    whoami() {
      printLine('[+] OPERATOR IDENTIFICATION:', 'success');
      printLine(`  Name:        ${identity.name}`);
      printLine(`  Alias:       ${identity.alias}`);
      printLine(`  Degree:      ${identity.degree} @ ${identity.institution}`);
      printLine(`  Location:    ${identity.location}`);
      printLine(`  Direct Line: ${contact.phoneDisplay}`);
      printLine(`  Research:    ${research.journal} (${research.id})`);
    },
    paper() {
      printLine('[+] PEER-REVIEWED RESEARCH PUBLICATION:', 'purple');
      printLine(`  Title:   ${research.title}`, 'info');
      printLine(`  Authors: ${research.authors.join(', ')}`);
      printLine(`  Journal: ${research.journal} (ISSN ${research.issn})`);
      printLine(`  Issue:   Vol. ${research.volume} | Issue ${research.issue} (${research.publishedDisplay})`);
      printLinkLine('  DOI:     ', research.doi, research.doiUrl, 'info');
      printLinkLine('  Dossier: ', 'Dedicated Research Page', research.localPage, 'success');
      printLinkLine('  Journal: ', 'View on Vindhyan Bloom', research.journalUrl, 'success');
      printLinkLine('  PDF:     ', 'Download Official PDF', research.pdfUrl, 'dim');
    },
    research() {
      COMMANDS.paper();
    },
    bibtex() {
      printLine('[+] BIBTEX CITATION:', 'purple');
      research.bibtex.split('\n').forEach((row) => printLine(`  ${row}`, 'dim'));
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(research.bibtex)
          .then(() => {
            printLine('[+] BibTeX copied to clipboard.', 'success');
            audio.success();
          })
          .catch(() => {});
      }
    },
    phone() {
      printLine('[+] DIRECT VOICE / COMMS NODE:', 'success');
      printLinkLine('  Call:     ', contact.phoneDisplay, `tel:${contact.phoneHref}`, 'info');
      printLinkLine('  WhatsApp: ', 'Chat on WhatsApp', contact.whatsappUrl, 'success');
    },
    call() {
      COMMANDS.phone();
    },
    skills() {
      printLine('[+] CORE CAPABILITIES:', 'info');
      printLine('  • Web App Pentesting: Burp Suite, SQLi, XSS, OWASP Top 10, IDOR');
      printLine('  • OSINT & Recon: Subdomain Enumeration, DNS Validation, SOCMINT');
      printLine('  • Bug Bounty: Responsible Disclosure, CVSS Triage, Fuzzing');
      printLine('  • Automation: Python, Bash, PowerShell, Modular Scan Engines');
      printLine('  • AI & IoT: Computer Vision, Smart Energy Automation, Security LLMs');
      printLine('  • Education: Hindi-first Ethical Hacking & Cyber Defense');
    },
    repos() {
      printLine('[+] FLAGSHIP REPOSITORIES:', 'success');
      profile.repos.fallback.slice(0, 6).forEach((repo) => {
        const desc = profile.repos.descriptions[repo.name] || '';
        printLinkLine(`  • ${repo.name} — `, 'GitHub', repo.html_url, 'info');
        if (desc) printLine(`    ${desc}`, 'dim');
      });
    },
    projects() {
      COMMANDS.repos();
    },
    security() {
      printLine('[+] RESPONSIBLE DISCLOSURE (RFC 9116):', 'success');
      printLinkLine('  Policy File: ', '/.well-known/security.txt', './.well-known/security.txt', 'info');
      printLinkLine('  Email:       ', contact.email, `mailto:${contact.email}`, 'info');
      printLine('  Languages:   English (en), Hindi (hi)');
    },
    scan() {
      cancelPendingTimers();
      printLine('[*] Starting simulated perimeter verification...', 'dim');
      scheduleLine(220, () => printLine('[+] TLS 1.3 / HTTPS enforced on origin', 'info'));
      scheduleLine(460, () => printLine('[+] DOM sink audit: 0 unsafe innerHTML writers active', 'info'));
      scheduleLine(700, () => printLine('[+] Subresource Integrity (SRI) verified on external ESM', 'info'));
      scheduleLine(960, () => {
        printLine('[+] Verification complete: Perimeter nominal.', 'success');
        audio.success();
      });
    },
    mission() {
      printLine('[+] MISSION CHARTER:', 'info');
      printLine('  Delivering rigorous, practical, and legal cybersecurity');
      printLine('  education completely in Hindi for Indian beginners.');
    },
    contact() {
      printLine('[+] VERIFIED UPLINK COORDINATES:', 'info');
      printLinkLine('  Phone:    ', contact.phoneDisplay, `tel:${contact.phoneHref}`, 'success');
      printLinkLine('  WhatsApp: ', 'wa.me/917389718429', contact.whatsappUrl, 'success');
      printLinkLine('  Email:    ', contact.email, `mailto:${contact.email}`, 'info');
      printLinkLine('  GitHub:   ', 'github.com/VIPHACKER100', contact.socials.github, 'info');
      printLinkLine('  YouTube:  ', 'youtube.com/@viphacker100', contact.socials.youtube, 'info');
      printLinkLine('  Telegram: ', 't.me/viphacker100', contact.socials.telegram, 'info');
    },
    lang(arg) {
      if (!i18n) return;
      const target = arg === 'hi' || arg === 'en' ? arg : i18n.getLang() === 'en' ? 'hi' : 'en';
      i18n.setLang(target);
      printLine(
        target === 'hi'
          ? '[+] भाषा हिन्दी (Hindi) में बदल दी गई है।'
          : '[+] Interface language switched to English (EN).',
        'success'
      );
    },
    sound() {
      const audioBtn = document.getElementById('audio-toggle');
      if (audioBtn) {
        audioBtn.click();
        printLine('[+] Toggled audio telemetry FX.', 'info');
      }
    },
    clear() {
      cancelPendingTimers();
      screen.replaceChildren();
      printLine('[+] Terminal buffer cleared.', 'dim');
    },
  };

  const commandNames = Object.keys(COMMANDS);

  function executeCommand(raw) {
    const trimmed = raw.trim();
    printLine(`recon@viphacker100:~# ${trimmed}`, 'prompt');
    audio.cmd();

    if (!trimmed) return;

    history.push(trimmed);
    historyIndex = history.length;

    const [cmd, ...args] = trimmed.toLowerCase().split(/\s+/);
    if (Object.hasOwn(COMMANDS, cmd)) {
      COMMANDS[cmd](args.join(' '));
    } else {
      printLine(`[-] Command not recognized: "${trimmed}". Type 'help' for options.`, 'warning');
      audio.error();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const val = input.value;
    input.value = '';
    executeCommand(val);
  });

  // IME-safe Enter submit + ArrowUp/Down history + Tab autocomplete
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.isComposing || event.keyCode === 229) {
        return;
      }
      form.requestSubmit();
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
      return;
    }

    if (event.key === 'ArrowDown') {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex < history.length ? history[historyIndex] : '';
      return;
    }

    if (event.key === 'Tab') {
      const partial = input.value.trim().toLowerCase();
      if (!partial) return;
      const match = commandNames.find((name) => name.startsWith(partial));
      if (match) {
        event.preventDefault();
        input.value = match;
      }
    }
  });

  document.querySelectorAll('.quick-cmd-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) executeCommand(cmd);
    });
  });
}
