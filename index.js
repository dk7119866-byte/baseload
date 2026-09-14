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

  const getSavedUsers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('baseload-users') || '[]');
    const legacyUser = JSON.parse(localStorage.getItem('baseload-user') || 'null');

    if (savedUsers.length || !legacyUser) return savedUsers;

    localStorage.setItem('baseload-users', JSON.stringify([legacyUser]));
    return [legacyUser];
  };

  const showDocument = () => {
    localStorage.setItem('baseload-session', 'active');
    authPanel.classList.add('hidden');
    documentContainer.classList.remove('hidden');
  };

  signinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('signin-email').value.trim().toLowerCase();
    const password = document.getElementById('signin-password').value.trim();

    if (!email || !password) return;

    const storedUser = getSavedUsers().find((user) => user.email === email);
    const isValid = storedUser && storedUser.password === password;

    if (!isValid) {
      alert('Please create an account first or use the correct login details.');
      return;
    }

    showDocument();
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !email || !password) return;

    const savedUsers = getSavedUsers();
    const existingUser = savedUsers.find((user) => user.email === email);

    if (existingUser) {
      document.getElementById('signin-email').value = email;
      authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === 'signin'));
      authForms.forEach((form) => form.classList.toggle('active', form.id === 'signinForm'));
      alert('This email already has an account. Please sign in.');
      return;
    }

    const newUser = { name, email, password, mode: 'signup' };
    localStorage.setItem('baseload-users', JSON.stringify([...savedUsers, newUser]));
    localStorage.setItem('baseload-user', JSON.stringify(newUser));
    showDocument();
    alert('Account created successfully.');
  });
});
