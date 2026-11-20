# VIPHACKER.100 — Aryan Ahirwar Portfolio

Official cybersecurity portfolio, peer-reviewed research dossier, and open-source tools hub for **Aryan Ahirwar (VIPHACKER.100)**.

## Architecture

Zero-build, modular static web architecture engineered for fast First Contentful Paint, strict Content Security Policy compatibility, and WCAG 2.2 AA accessibility:

```text
├── index.html                      # Semantic HTML5 shell, SEO/GEO JSON-LD, <dialog> nav drawer
├── research/smart-energy-iot.html  # Dedicated Google Scholar landing page (Highwire citation_* tags)
├── css/
│   ├── tokens.css                  # Design tokens, WCAG AA contrast scale, standard scrollbars
│   ├── base.css                    # Reset, skip-link, :focus-visible, content-visibility, scroll-progress
│   ├── components.css              # Header scrollspy, Hero, Terminal, Skills (<progress>), Repos, FAQ, Contact
│   └── drawer.css                  # Native modal <dialog> swipe navigation drawer
├── js/
│   ├── main.js                     # App bootstrap, copy buttons, footer year
│   ├── webgl.js                    # Deferred Three.js r187 ESM cyber-globe (delta-time, visibility pause, 3D toggle)
│   ├── navigation.js               # <dialog> drawer controller, CSS scrollspy + IO fallback, progress fallback
│   ├── terminal.js                 # IME-safe Cyber Shell (history, Tab autocomplete, BibTeX/security/lang commands)
│   ├── repos.js                    # Zero-XSS DOM-node GitHub repo deck (30-min cache, AbortSignal.timeout, featured sort)
│   ├── contact.js                  # AJAX contact form (Web3Forms ready + graceful WhatsApp/Email/Copy fallback)
│   ├── audio.js                    # Web Audio synthesizer (async resume-safe)
│   ├── tilt.js                     # Single rAF-throttled card glare/tilt (disabled on touch & reduced motion)
│   ├── i18n.js                     # Bilingual English / हिन्दी (Hindi) switcher
│   └── research-page.js            # Citation copy utilities for the research page
├── data/profile.json               # Single source of truth for profile, research citations, & curated repos
├── assets/                         # favicon.svg, og-card.png (1200x630), apple-touch-icon.png, icon-512.png
├── .well-known/security.txt        # RFC 9116 responsible disclosure metadata
├── llms.txt / robots.txt / sitemap.xml / site.webmanifest
└── .github/workflows/pages.yml     # Automated validation & clean GitHub Pages artifact deploy
```

## Local Development

Serve the repository over HTTP (required for ES modules and `fetch('./data/profile.json')`):

```bash
python -m http.server 8080
# or: npx serve .
```

Then open `http://localhost:8080`.

## Configuration Notes

1. **Direct Contact Form Delivery (Web3Forms)**:
   - Configured with your Web3Forms access key in `index.html` (no-JS progressive fallback) and `data/profile.json` (`contact.web3formsAccessKey`).
   - Submissions relay directly via AJAX (`https://api.web3forms.com/submit`) with honeypot spam protection, and gracefully fall back to one-click **WhatsApp**, **Email App**, and **Copy Message** buttons if the network or relay is unreachable.
2. **Custom Domain (`aryanahirwar.in`)**:
   - All canonical URLs, Open Graph/Twitter cards, `sitemap.xml`, `robots.txt`, `llms.txt`, `.well-known/security.txt`, `assets/og-card.png`, and `CNAME` are configured for `https://aryanahirwar.in/`.
   - All internal asset links remain relative (`./...`), so local previews and staging paths work seamlessly.
3. **Optional Edge Security Headers**:
   - GitHub Pages does not support custom HTTP response headers directly. If fronted by Cloudflare, add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Permissions-Policy: camera=(), geolocation=(), microphone=()`, and `Content-Security-Policy: frame-ancestors 'none'`.
