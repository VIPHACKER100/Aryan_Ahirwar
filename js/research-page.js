const BIBTEX = `@article{yadav2026occupancy,
  title     = {An AI-Based Occupancy-Aware Smart Energy Management System for Classroom Automation Using Computer Vision and IOT},
  author    = {Yadav, Teena and Dewda, Anjali and Ahirwar, Aryan},
  journal   = {Vindhyan Bloom Research Journal},
  volume    = {15},
  number    = {2},
  year      = {2026},
  month     = apr,
  issn      = {2319-8478},
  doi       = {10.5281/zenodo.19737528},
  url       = {https://vindhyanbloom.com/paper_detail.php?id=VB-2026-0013}
}`;

const APA =
  'Yadav, T., Dewda, A., & Ahirwar, A. (2026). An AI-Based Occupancy-Aware Smart Energy Management System for Classroom Automation Using Computer Vision and IOT. Vindhyan Bloom Research Journal, 15(2). https://doi.org/10.5281/zenodo.19737528';

const status = document.getElementById('citation-status');
let timer = 0;

function bindCopy(id, payload, message) {
  const btn = document.getElementById(id);
  if (!btn || !status) return;
  btn.addEventListener('click', () => {
    navigator.clipboard
      ?.writeText(payload)
      .then(() => {
        status.textContent = message;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          status.textContent = '';
        }, 3200);
      })
      .catch(() => {
        status.textContent = '[!] Clipboard unavailable in this browser context.';
      });
  });
}

bindCopy('copy-bibtex-btn', BIBTEX, '[+] BibTeX citation copied to clipboard!');
bindCopy('copy-apa-btn', APA, '[+] APA citation copied to clipboard!');

const yearSpan = document.getElementById('year-span');
if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
