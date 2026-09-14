document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('b2b-tracker-modal');
  const triggerBtn = document.querySelector('.nazar-dot');
  const closeBtn = document.querySelector('.b2b-close');
  
  if (!modal || !triggerBtn || !closeBtn) return;

  // Database structure in LocalStorage (Offline First)
  const REV_KEY = 'CRUMBLY_REVENUE_DB_V1';
  function loadRevDB() {
    let db = { b2c: [], b2b: [], clients: [], flavours: [], supplierFlavours: [] };
    try {
      const data = localStorage.getItem(REV_KEY);
      if (data) {
        db = { ...db, ...JSON.parse(data) };
        let modified = false;
        
        // Ensure IDs exist
        if(db.b2c) {
          db.b2c = db.b2c.map(o => { if(!o.id){ o.id = 'b2c-'+Math.random().toString(36).substr(2,9); modified=true; } return o; });
        }
        if(db.b2b) {
          db.b2b = db.b2b.map(o => { if(!o.id){ o.id = 'b2b-'+Math.random().toString(36).substr(2,9); modified=true; } return o; });
        }
        
        // Migrate old 'suppliers' to clients and flavours
        if(db.suppliers && db.suppliers.length > 0) {
          db.suppliers.forEach(s => {
            if (s.name && !db.clients.includes(s.name)) db.clients.push(s.name);
            if (s.flavour && !db.flavours.includes(s.flavour)) db.flavours.push(s.flavour);
          });
          delete db.suppliers;
          modified = true;
        }

        // Migrate string flavours to supplierFlavours
        if (db.flavours && db.flavours.length > 0) {
          if (!db.supplierFlavours) db.supplierFlavours = [];
          db.flavours.forEach(f => {
            const exists = db.supplierFlavours.find(sf => sf.flavour === f);
            if (!exists) {
              db.supplierFlavours.push({ supplier: 'In-House', flavour: f });
              modified = true;
            }
          });
          db.flavours = [];
        }

        if(modified) localStorage.setItem(REV_KEY, JSON.stringify(db));
      }
    } catch (e) { }
    return db;
  }
  
  function saveRevDB(db) {
    localStorage.setItem(REV_KEY, JSON.stringify(db));
  }

  // Authentication & Open/Close Logic
  const pinOverlay = document.getElementById('b2b-pin-overlay');
  const pinInput = document.getElementById('b2b-pin-input');
  const pinBtn = document.getElementById('b2b-pin-btn');
  const pinError = document.getElementById('b2b-pin-error');
  const THE_PIN = "7069";

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault(); 
    modal.classList.add('is-open');
    pinOverlay.style.display = 'flex'; // Lock with PIN screen
    pinInput.value = '';
    pinError.style.display = 'none';
    pinInput.focus();
  });

  function unlockTracker() {
    if (pinInput.value === THE_PIN) {
      pinOverlay.style.display = 'none';
      renderSettings();
      renderDashboard(); 
    } else {
      pinError.style.display = 'block';
      pinInput.value = '';
    }
  }

  if (pinBtn) pinBtn.addEventListener('click', unlockTracker);
  if (pinInput) {
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') unlockTracker();
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('is-open');
  });

  // Close on backdrop click (but NOT if PIN overlay is active)
  modal.addEventListener('click', (e) => {
    if (e.target === modal && pinOverlay.style.display === 'none') {
      modal.classList.remove('is-open');
    }
  });

  // Tab Logic
  const tabs = document.querySelectorAll('.b2b-tab');
  const panes = document.querySelectorAll('.b2b-tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      panes.forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.getElementById(tab.dataset.target).classList.add('is-active');
    });
  });

  // Forms
  const formB2C = document.getElementById('form-b2c');
  const formB2B = document.getElementById('form-b2b');
  const formClient = document.getElementById('form-client');
  const formFlavour = document.getElementById('form-flavour');
  
  const clientList = document.getElementById('client-list');
  const flavourList = document.getElementById('flavour-list');
  
  const b2bClientSel = document.getElementById('b2b-client');
  const b2bFlavourSel = document.getElementById('b2b-flavour');
  const b2cFlavourSel = document.getElementById('b2c-flavour');

  // --- Settings Logic ---
  function renderSettings() {
    const db = loadRevDB();
    
    // Clear
    if(clientList) clientList.innerHTML = '';
    if(flavourList) flavourList.innerHTML = '';
    if(b2bClientSel) b2bClientSel.innerHTML = '<option value="" disabled selected>Select Client</option>';
    if(b2bFlavourSel) b2bFlavourSel.innerHTML = '<option value="" disabled selected>Select Flavour</option>';
    if(b2cFlavourSel) b2cFlavourSel.innerHTML = '<option value="" disabled selected>Select Flavour</option>';

    // Default Flavours if empty
    if(!db.supplierFlavours || db.supplierFlavours.length === 0) {
      db.supplierFlavours = [
        { supplier: 'In-House', flavour: 'Double Chocolate' },
        { supplier: 'In-House', flavour: 'Choco Chips' },
        { supplier: 'In-House', flavour: 'Oatmeal Raisin' }
      ];
      saveRevDB(db);
    }

    db.clients.forEach((c, idx) => {
      if(clientList) clientList.innerHTML += `<li style="display:flex; justify-content:space-between;">${c} <button type="button" onclick="window.delClient(${idx})" style="background:none;border:none;cursor:pointer;color:red;" title="Delete">✖</button></li>`;
      if(b2bClientSel) b2bClientSel.innerHTML += `<option value="${c}">${c}</option>`;
    });

    db.supplierFlavours.forEach((sf, idx) => {
      const displayName = `${sf.supplier} - ${sf.flavour}`;
      if(flavourList) flavourList.innerHTML += `<li style="display:flex; justify-content:space-between;">${displayName} <button type="button" onclick="window.delFlavour(${idx})" style="background:none;border:none;cursor:pointer;color:red;" title="Delete">✖</button></li>`;
      if(b2bFlavourSel) b2bFlavourSel.innerHTML += `<option value="${displayName}">${displayName}</option>`;
      if(b2cFlavourSel) b2cFlavourSel.innerHTML += `<option value="${displayName}">${displayName}</option>`;
    });
  }

  // Expose delete functions globally so onclick works
  window.delClient = (idx) => {
    const db = loadRevDB();
    if(confirm('Delete client?')) {
      db.clients.splice(idx, 1);
      saveRevDB(db);
      renderSettings();
    }
  };

  window.delFlavour = (idx) => {
    const db = loadRevDB();
    if(confirm('Delete supplier & flavour?')) {
      db.supplierFlavours.splice(idx, 1);
      saveRevDB(db);
      renderSettings();
    }
  }

  if (formClient) {
    formClient.addEventListener('submit', (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const newClient = document.getElementById('set-client-name').value.trim();
      if (newClient && !db.clients.includes(newClient)) {
        db.clients.push(newClient);
        saveRevDB(db);
        renderSettings();
      }
      formClient.reset();
    });
  }

  if (formFlavour) {
    formFlavour.addEventListener('submit', (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const supplierName = document.getElementById('set-supplier-name').value.trim();
      const newFlavour = document.getElementById('set-flavour-name').value.trim();
      if (supplierName && newFlavour) {
        const exists = db.supplierFlavours.find(sf => sf.supplier === supplierName && sf.flavour === newFlavour);
        if (!exists) {
          db.supplierFlavours.push({ supplier: supplierName, flavour: newFlavour });
          saveRevDB(db);
          renderSettings();
        }
      }
      formFlavour.reset();
    });
  }

  // --- Auto-Calculate Logic ---
  const b2cQty = document.getElementById('b2c-qty');
  const b2cUnitCost = document.getElementById('b2c-unit-cost');
  const b2cPrice = document.getElementById('b2c-price');

  function calcB2C() {
    if (b2cQty && b2cUnitCost && b2cPrice) {
      const q = parseFloat(b2cQty.value) || 0;
      const c = parseFloat(b2cUnitCost.value) || 0;
      b2cPrice.value = (q * c).toFixed(2);
    }
  }
  if(b2cQty) b2cQty.addEventListener('input', calcB2C);
  if(b2cUnitCost) b2cUnitCost.addEventListener('input', calcB2C);

  const b2bKg = document.getElementById('b2b-kg');
  const b2bUnitCost = document.getElementById('b2b-unit-cost');
  const b2bCost = document.getElementById('b2b-cost');

  function calcB2B() {
    if (b2bKg && b2bUnitCost && b2bCost) {
      const q = parseFloat(b2bKg.value) || 0;
      const c = parseFloat(b2bUnitCost.value) || 0;
      b2bCost.value = (q * c).toFixed(2);
    }
  }
  if(b2bKg) b2bKg.addEventListener('input', calcB2B);
  if(b2bUnitCost) b2bUnitCost.addEventListener('input', calcB2B);


  // --- Orders Logic ---
  if (formB2C) {
    formB2C.addEventListener('submit', (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const idInput = document.getElementById('b2c-id');
      const order = {
        id: idInput.value || 'b2c-'+Date.now().toString(),
        date: new Date().toISOString(),
        type: 'B2C',
        flavour: document.getElementById('b2c-flavour').value,
        qty: parseFloat(b2cQty.value),
        unitCost: parseFloat(b2cUnitCost.value),
        price: parseFloat(b2cPrice.value),
        advance: parseFloat(document.getElementById('b2c-advance').value) || 0
      };

      if (idInput.value) {
        const idx = db.b2c.findIndex(o => o.id === idInput.value);
        if (idx !== -1) db.b2c[idx] = { ...db.b2c[idx], ...order };
      } else {
        db.b2c.push(order);
      }

      saveRevDB(db);
      formB2C.reset();
      idInput.value = '';
      b2cQty.value = '1';
      renderDashboard();
    });
  }

  if (formB2B) {
    formB2B.addEventListener('submit', (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const idInput = document.getElementById('b2b-id');
      const order = {
        id: idInput.value || 'b2b-'+Date.now().toString(),
        date: new Date().toISOString(),
        type: 'B2B',
        client: document.getElementById('b2b-client').value,
        flavour: document.getElementById('b2b-flavour').value,
        unit: document.getElementById('b2b-unit').value,
        kg: parseFloat(b2bKg.value),
        unitCost: parseFloat(b2bUnitCost.value),
        cost: parseFloat(b2bCost.value),
        advance: parseFloat(document.getElementById('b2b-advance').value) || 0
      };

      if (idInput.value) {
        const idx = db.b2b.findIndex(o => o.id === idInput.value);
        if (idx !== -1) db.b2b[idx] = { ...db.b2b[idx], ...order };
      } else {
        db.b2b.push(order);
      }

      saveRevDB(db);
      formB2B.reset();
      idInput.value = '';
      b2bKg.value = '1';
      renderDashboard();
    });
  }

  // Edit / Delete Delegation
  const tbody = document.getElementById('b2b-ledger-body');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const type = btn.dataset.type;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      
      const db = loadRevDB();
      
      if (action === 'delete') {
        if (!confirm('Delete this transaction?')) return;
        if (type === 'B2C') db.b2c = db.b2c.filter(o => o.id !== id);
        if (type === 'B2B') db.b2b = db.b2b.filter(o => o.id !== id);
        saveRevDB(db);
        renderDashboard();
      }
      
      if (action === 'edit') {
        let order;
        if (type === 'B2C') {
          order = db.b2c.find(o => o.id === id);
          if (order) {
            document.getElementById('b2c-id').value = order.id;
            document.getElementById('b2c-flavour').value = order.flavour;
            document.getElementById('b2c-qty').value = order.qty || 1;
            document.getElementById('b2c-unit-cost').value = order.unitCost || (order.price / (order.qty || 1));
            document.getElementById('b2c-advance').value = order.advance || 0;
            calcB2C();
            document.querySelector('.b2b-tab[data-target="b2b-pane-b2c"]').click();
          }
        }
        if (type === 'B2B') {
          order = db.b2b.find(o => o.id === id);
          if (order) {
            document.getElementById('b2b-id').value = order.id;
            if(order.client) document.getElementById('b2b-client').value = order.client;
            document.getElementById('b2b-flavour').value = order.flavour;
            document.getElementById('b2b-unit').value = order.unit || 'KG';
            document.getElementById('b2b-kg').value = order.kg || 1;
            document.getElementById('b2b-unit-cost').value = order.unitCost || (order.cost / (order.kg || 1));
            document.getElementById('b2b-advance').value = order.advance || 0;
            calcB2B();
            document.querySelector('.b2b-tab[data-target="b2b-pane-b2b"]').click();
          }
        }
      }
    });
  }

  // Render Dashboard Data
  function renderDashboard() {
    const db = loadRevDB();
    const filterVal = document.querySelector('.b2b-date-input').value;

    let totalB2C = 0, totalB2B = 0;
    if(tbody) tbody.innerHTML = '';

    const allOrders = [];
    db.b2c.forEach(o => allOrders.push({ ...o, amount: o.price, qtyStr: (o.qty || 1) + ' Box', desc: o.flavour }));
    db.b2b.forEach(o => allOrders.push({ ...o, amount: o.cost, qtyStr: (o.kg || 1) + ' ' + (o.unit || 'KG'), desc: (o.client ? `${o.client} - ${o.flavour}` : o.flavour) }));

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    allOrders.forEach(o => {
      const dDate = new Date(o.date);
      const ymd = dDate.toISOString().slice(0, 10);
      if (filterVal && ymd !== filterVal) return;

      if (o.type === 'B2C') totalB2C += o.amount;
      if (o.type === 'B2B') totalB2B += o.amount;

      if(tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${ymd}</td>
          <td>${o.type}</td>
          <td>${o.desc}</td>
          <td>${o.qtyStr}</td>
          <td>₹${o.amount}</td>
          <td>₹${o.advance}</td>
          <td class="b2b-action-col">
            <button type="button" class="b2b-btn-icon" data-action="edit" data-id="${o.id}" data-type="${o.type}" title="Edit">✏️</button>
            <button type="button" class="b2b-btn-icon" data-action="delete" data-id="${o.id}" data-type="${o.type}" title="Delete">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      }
    });

    const totalRev = totalB2C + totalB2B;
    const target = 500000;
    const pct = Math.min(100, (totalRev / target) * 100).toFixed(1);

    const elTotal = document.getElementById('b2b-val-total');
    if(elTotal) elTotal.textContent = `₹${totalRev.toLocaleString()}`;
    const elB2B = document.getElementById('b2b-val-b2b');
    if(elB2B) elB2B.textContent = `₹${totalB2B.toLocaleString()}`;
    const elB2C = document.getElementById('b2b-val-b2c');
    if(elB2C) elB2C.textContent = `₹${totalB2C.toLocaleString()}`;
    
    const elPct = document.getElementById('b2b-target-pct');
    if(elPct) elPct.textContent = `${pct}%`;
    const elFill = document.getElementById('b2b-target-fill');
    if(elFill) elFill.style.width = `${pct}%`;
  }

  const clearBtn = document.querySelector('.b2b-btn-clear');
  const dateInput = document.querySelector('.b2b-date-input');
  
  if(dateInput) {
      dateInput.addEventListener('change', renderDashboard);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if(dateInput) dateInput.value = '';
      renderDashboard();
    });
  }
});
