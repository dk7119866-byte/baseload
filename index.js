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

  const inverterRows = document.getElementById('inverterRows');
  const addInverterBtn = document.getElementById('addInverterBtn');
  if (inverterRows && addInverterBtn) {
    const inverterCountKey = savedFieldKey('inverter-count');
    const legacyInverterValue = localStorage.getItem(savedFieldKey('inverter-model-serial'));
    const firstInverterModel = inverterRows.querySelector('[data-save="inverter-1-model"]');
    if (legacyInverterValue !== null && localStorage.getItem(savedFieldKey('inverter-1-model')) === null) {
      firstInverterModel.value = legacyInverterValue;
    }

    const updateInverterRows = () => {
      const rows = [...inverterRows.querySelectorAll('.inverter-row')];
      rows.forEach((row, index) => {
        const rowNumber = index + 1;
        row.dataset.inverterRow = String(rowNumber);
        row.querySelectorAll('input').forEach((input, fieldIndex) => {
          const saveName = `inverter-${rowNumber}-${fieldIndex === 0 ? 'model' : 'serial'}`;
          if (input.dataset.save !== saveName) localStorage.removeItem(savedFieldKey(input.dataset.save));
          input.dataset.save = saveName;
          saveInput(input);
        });
        row.querySelector('.remove-inverter').disabled = rows.length === 1;
      });
      localStorage.setItem(inverterCountKey, String(rows.length));
    };

    const addInverterRow = (rowNumber) => {
      const row = document.createElement('div');
      row.className = 'inverter-row';
      row.dataset.inverterRow = String(rowNumber);

      [['Model', 'model'], ['Serial number', 'serial']].forEach(([label, field]) => {
        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = label;
        const input = document.createElement('input');
        input.setAttribute('aria-label', `Inverter ${label.toLowerCase()}`);
        input.dataset.save = `inverter-${rowNumber}-${field}`;
        fieldLabel.append(input);
        row.append(fieldLabel);
        input.addEventListener('input', () => saveInput(input));
        input.addEventListener('change', () => saveInput(input));
      });

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-inverter';
      removeButton.setAttribute('aria-label', 'Remove inverter');
      removeButton.title = 'Remove inverter';
      removeButton.innerHTML = '&#215;';
      row.append(removeButton);
      inverterRows.append(row);
      restoreInput(row.querySelector('input'));
      restoreInput(row.querySelectorAll('input')[1]);
    };

    inverterRows.addEventListener('click', (event) => {
      if (!event.target.closest('.remove-inverter') || inverterRows.children.length === 1) return;
      const row = event.target.closest('.inverter-row');
      row.querySelectorAll('input').forEach((input) => localStorage.removeItem(savedFieldKey(input.dataset.save)));
      row.remove();
      updateInverterRows();
    });

    const savedCount = Number.parseInt(localStorage.getItem(inverterCountKey) || '1', 10);
    const rowCount = Number.isInteger(savedCount) ? Math.min(Math.max(savedCount, 1), 50) : 1;
    for (let rowNumber = 2; rowNumber <= rowCount; rowNumber += 1) addInverterRow(rowNumber);
    updateInverterRows();

    addInverterBtn.addEventListener('click', () => {
      if (inverterRows.children.length >= 50) return;
      addInverterRow(inverterRows.children.length + 1);
      updateInverterRows();
    });
  }

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
