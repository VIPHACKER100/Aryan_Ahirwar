/**
 * Accessible Contact Form Controller:
 * - Replaces broken mailto: POST with Web3Forms AJAX submission when configured
 * - When unconfigured (static preview), gracefully prepares a copyable payload +
 *   verified Email / WhatsApp dispatch buttons so messages never silently vanish
 * - Includes honeypot spam check, ValidityState focus routing, and role="status" announcements
 */
export function initContactForm(profile, audio) {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit-btn');
  const statusEl = document.getElementById('contact-form-status');
  const fallbackActions = document.getElementById('contact-fallback-actions');
  if (!form || !statusEl) return;

  const fields = Array.from(form.querySelectorAll('input[required], textarea[required]'));

  // Clear aria-invalid as the user fixes input; validate on blur once edited
  fields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (field.value.trim() !== '') {
        field.setAttribute('aria-invalid', String(!field.checkValidity()));
      }
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
        field.removeAttribute('aria-invalid');
      }
    });
  });

  function setStatus(kind, message) {
    statusEl.className = `form-status ${kind}`;
    statusEl.textContent = message;
  }

  function renderDirectFallback(name, email, subject, message) {
    if (!fallbackActions) return;
    const formatted = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    const mailtoHref =
      `mailto:${profile.contact.email}?subject=${encodeURIComponent(`[VIPHACKER.100] ${subject}`)}` +
      `&body=${encodeURIComponent(formatted)}`;
    const waHref = `${profile.contact.whatsappUrl}?text=${encodeURIComponent(
      `Hi Aryan (${subject}) — from ${name} (${email}):\n${message}`
    )}`;

    const mailLink = document.createElement('a');
    mailLink.className = 'btn btn-secondary btn-sm';
    mailLink.href = mailtoHref;
    mailLink.textContent = 'Open in Email App';

    const waLink = document.createElement('a');
    waLink.className = 'btn btn-primary btn-sm';
    waLink.href = waHref;
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';
    waLink.textContent = 'Send via WhatsApp';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn-outline btn-sm';
    copyBtn.textContent = 'Copy Message';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard
        ?.writeText(formatted)
        .then(() => {
          setStatus('success', '[+] Message payload copied to clipboard.');
          audio.success();
        })
        .catch(() => {});
    });

    fallbackActions.replaceChildren(mailLink, waLink, copyBtn);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (fallbackActions) fallbackActions.replaceChildren();

    // Honeypot check
    const botField = form.querySelector('input[name="botcheck"]');
    if (botField && botField.value.trim() !== '') {
      setStatus('success', '[+] Transmission acknowledged.');
      form.reset();
      return;
    }

    // Native constraint validation + focus first invalid field
    const firstInvalid = fields.find((f) => !f.checkValidity());
    if (firstInvalid) {
      fields.forEach((f) => f.setAttribute('aria-invalid', String(!f.checkValidity())));
      setStatus('error', '[!] Please complete all required fields with a valid email address.');
      firstInvalid.focus();
      audio.error();
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const accessKey = (profile.contact.web3formsAccessKey || '').trim();
    if (!accessKey) {
      setStatus(
        'info',
        '[+] Message prepared! Choose WhatsApp, your Email App, or Copy below to dispatch immediately.'
      );
      renderDirectFallback(name, email, subject, message);
      audio.success();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Transmitting...';
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          from_name: name,
          email,
          subject: `[VIPHACKER.100] ${subject}`,
          message,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setStatus('success', '[+] Transmission delivered! Aryan will respond via email or WhatsApp.');
        form.reset();
        fields.forEach((f) => f.removeAttribute('aria-invalid'));
        audio.success();
      } else {
        throw new Error(result.message || 'Relay rejected payload');
      }
    } catch {
      setStatus(
        'error',
        '[!] Direct relay unavailable right now. Dispatch instantly via WhatsApp or Email below:'
      );
      renderDirectFallback(name, email, subject, message);
      audio.error();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Transmit Payload';
      }
    }
  });
}
