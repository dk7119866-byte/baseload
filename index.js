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

  const editableFields = document.querySelectorAll('.value:not(.monitoring-answer):not(.date), .notes-line, .summary-note-box p, .sign-cell, .remediation-box, .finding-item p, .audit-findings-header p');

  editableFields.forEach((field) => {
    if (!field.hasAttribute('contenteditable')) {
      field.setAttribute('contenteditable', 'true');
      field.setAttribute('spellcheck', 'false');
    }
  });

  const checks = document.querySelectorAll('.checkbox, .photo-box');

  checks.forEach((check) => {
    const choiceGroup = check.dataset.choiceGroup;
    const groupIndex = choiceGroup
      ? [...document.querySelectorAll(`[data-choice-group="${choiceGroup}"]`)].indexOf(check)
      : [...checks].indexOf(check);
    const choiceKey = `baseload-commissioning-choice-${choiceGroup || 'check'}-${groupIndex}`;
    const restoreChoice = () => {
      const isChecked = localStorage.getItem(choiceKey) === 'true';
      check.classList.toggle('checked', isChecked);
      if (check.hasAttribute('role')) check.setAttribute('aria-checked', String(isChecked));
    };

    if (check.hasAttribute('role')) restoreChoice();
    check.addEventListener('click', () => {
      const isChecked = !check.classList.contains('checked');
      if (choiceGroup && isChecked) {
        document.querySelectorAll(`[data-choice-group="${choiceGroup}"]`).forEach((choice, index) => {
          choice.classList.remove('checked');
          choice.setAttribute('aria-checked', 'false');
          localStorage.setItem(`baseload-commissioning-choice-${choiceGroup}-${index}`, 'false');
        });
      }
      check.classList.toggle('checked', isChecked);
      if (check.hasAttribute('role')) check.setAttribute('aria-checked', String(isChecked));
      if (check.hasAttribute('role')) localStorage.setItem(choiceKey, String(isChecked));
    });
    check.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        check.click();
      }
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
      document.body.dataset.printView = 'rescueView';
      window.print();
    });
  }

  const views = [...document.querySelectorAll('.view-panel')];
  const navButtons = [...document.querySelectorAll('[data-view]')];
  const showView = (viewId) => {
    views.forEach((view) => view.classList.toggle('hidden', view.id !== viewId));
    document.querySelectorAll('.nav-link').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === viewId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  navButtons.forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  const saveStatus = document.getElementById('recordSaveStatus');
  const savedFieldKey = (name) => `baseload-commissioning-${name}`;
  const savedInputs = document.querySelectorAll('[data-save]');

  const restoreInput = (input) => {
    const savedValue = localStorage.getItem(savedFieldKey(input.dataset.save));
    if (savedValue !== null) input.value = savedValue;
  };

  const saveInput = (input) => {
    localStorage.setItem(savedFieldKey(input.dataset.save), input.value);
    if (saveStatus) saveStatus.textContent = 'Saved on this device.';
  };

  savedInputs.forEach((input) => {
    restoreInput(input);
    input.addEventListener('input', () => saveInput(input));
    input.addEventListener('change', () => saveInput(input));
  });

  const equipmentRows = document.getElementById('equipmentRows');
  const addEquipmentBtn = document.getElementById('addEquipmentBtn');
  if (equipmentRows && addEquipmentBtn) {
    addEquipmentBtn.addEventListener('click', () => {
      const rowNumber = equipmentRows.rows.length + 1;
      const row = equipmentRows.insertRow();
      const fields = [
        ['Equipment type', 'text'],
        ['Manufacturer and model', 'text'],
        ['Serial number', 'text'],
        ['Rating or capacity', 'text'],
        ['Installed quantity', 'number'],
      ];

      fields.forEach(([label, type], index) => {
        const cell = row.insertCell();
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('aria-label', label);
        input.dataset.save = `equipment-${rowNumber}-${index}`;
        if (type === 'number') input.min = '0';
        cell.append(input);
        restoreInput(input);
        input.addEventListener('input', () => saveInput(input));
        input.addEventListener('change', () => saveInput(input));
      });
    });
  }

  const recordFiles = document.getElementById('recordFiles');
  const attachedFiles = document.getElementById('attachedFiles');
  if (recordFiles && attachedFiles) {
    recordFiles.addEventListener('change', () => {
      attachedFiles.replaceChildren();
      [...recordFiles.files].forEach((file) => {
        const item = document.createElement('span');
        item.className = 'attached-file';
        item.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)} KB`;
        attachedFiles.append(item);
      });
    });
  }

  const printRecordBtn = document.getElementById('printRecordBtn');
  if (printRecordBtn) {
    printRecordBtn.addEventListener('click', () => {
      document.body.dataset.printView = document.querySelector('.view-panel:not(.hidden)')?.id || 'commissioningView';
      window.print();
    });
  }

  window.addEventListener('afterprint', () => delete document.body.dataset.printView);

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
