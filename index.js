document.addEventListener('DOMContentLoaded', () => {
  const documentContainer = document.getElementById('documentContainer');
  const authPanel = document.getElementById('authPanel');
  const hasSession = localStorage.getItem('baseload-session');

  if (hasSession) {
    authPanel.classList.add('hidden');
    documentContainer.classList.remove('hidden');
  } else {
    authPanel.classList.remove('hidden');
    documentContainer.classList.add('hidden');
  }

  const editableFields = document.querySelectorAll('.value:not(.monitoring-answer), .notes-line, .summary-note-box p, .sign-cell, .remediation-box, .finding-item p, .audit-findings-header p');

  editableFields.forEach((field) => {
    if (!field.hasAttribute('contenteditable')) {
      field.setAttribute('contenteditable', 'true');
      field.setAttribute('spellcheck', 'false');
    }
  });

  const checks = document.querySelectorAll('.checkbox, .photo-box');

  checks.forEach((check) => {
    check.addEventListener('click', () => {
      check.classList.toggle('checked');
    });
  });

  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      authTabs.forEach((btn) => btn.classList.toggle('active', btn === tab));
      authForms.forEach((form) => form.classList.toggle('active', form.id === `${mode}Form`));
    });
  });

  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');

  signinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value.trim();

    if (!email || !password) return;

    const storedUser = JSON.parse(localStorage.getItem('baseload-user') || 'null');
    const isValid = storedUser && storedUser.email === email && storedUser.password === password;

    if (!isValid) {
      alert('Please create an account first or use the correct login details.');
      return;
    }

    localStorage.setItem('baseload-session', 'active');
    authPanel.classList.add('hidden');
    documentContainer.classList.remove('hidden');
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !email || !password) return;

    localStorage.setItem('baseload-user', JSON.stringify({ name, email, password, mode: 'signup' }));
    localStorage.setItem('baseload-session', 'active');
    authPanel.classList.add('hidden');
    documentContainer.classList.remove('hidden');
    alert('Account created successfully.');
  });
});
