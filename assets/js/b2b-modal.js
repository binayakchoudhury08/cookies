document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('b2b-tracker-modal');
  const triggerBtn = document.querySelector('.nazar-dot');
  const closeBtn = document.querySelector('.b2b-close');
  
  if (!modal || !triggerBtn || !closeBtn) return;

  const SUPABASE_URL = 'https://zpwsflfzoktwlwixsdut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3NmbGZ6b2t0d2x3aXhzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDE4OTcsImV4cCI6MjEwNTAxNzg5N30.yk-vmXvZuZKslHSZc4_9OvOhAUUOf4-8i2pqk3JcCDs';
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;


  // Database structure in LocalStorage (Offline First)
  const REV_KEY = 'CRUMBLY_REVENUE_DB_V1';
  function loadRevDB() {
    let db = { b2c: [], b2b: [], clients: [], flavours: [], supplierFlavours: [], boxSizes: ['80g', '180g'] };
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

  async function initRevDB() {
    if (!supabase) return;
    try {
      const [b2cReq, b2bReq, cliReq, flavReq, settingsReq] = await Promise.all([
        supabase.from('tracker_b2c').select('*'),
        supabase.from('tracker_b2b').select('*'),
        supabase.from('tracker_clients').select('*'),
        supabase.from('tracker_flavours').select('*'),
        supabase.from('tracker_settings').select('*')
      ]);
      
      const db = loadRevDB();
      
      let isCloudEmpty = (!b2cReq.data || b2cReq.data.length === 0) && 
                         (!b2bReq.data || b2bReq.data.length === 0) &&
                         (!cliReq.data || cliReq.data.length === 0) &&
                         (!flavReq.data || flavReq.data.length === 0);
                         
      if (isCloudEmpty) {
        console.log('Tracker Cloud DB is completely empty. Migrating local data...');
        if (db.b2c) { for (let o of db.b2c) await supabase.from('tracker_b2c').insert({ id: o.id, date: o.date, type: o.type, flavour: o.flavour, size: o.size || '80g', qty: o.qty, unit_cost: o.unitCost, price: o.price, advance: o.advance, cogs: o.cogs || 0, profit: o.profit || 0 }); }
        if (db.b2b) { for (let o of db.b2b) await supabase.from('tracker_b2b').insert({ id: o.id, date: o.date, type: o.type, client: o.client, flavour: o.flavour, unit: o.unit, size: o.size, kg: o.kg, unit_cost: o.unitCost, cost: o.cost, advance: o.advance, cogs: o.cogs || 0, profit: o.profit || 0 }); }
        if (db.clients) { for (let c of db.clients) await supabase.from('tracker_clients').insert({ name: c }); }
        
        const boxCogsInit = { '80g': 71.25, '180g': 147.00 }; // rough fallback if missing
        if (db.supplierFlavours) { 
          for (let f of db.supplierFlavours) {
            let bCogs = f.boxCogs || {};
            if (f.b2c80gCogs) bCogs['80g'] = f.b2c80gCogs;
            if (f.b2c180gCogs) bCogs['180g'] = f.b2c180gCogs;
            await supabase.from('tracker_flavours').insert({ supplier: f.supplier, flavour: f.flavour, b2b_cogs: f.b2bCogs || 0, box_cogs: bCogs }); 
          }
        }
        await supabase.from('tracker_settings').insert({ key: 'box_sizes', value: db.boxSizes });
        return;
      }
      
      if (b2cReq.data) db.b2c = b2cReq.data.map(o => ({ id: o.id, date: o.date, type: o.type, flavour: o.flavour, size: o.size || '80g', qty: o.qty, unitCost: o.unit_cost, price: o.price, advance: o.advance, cogs: o.cogs, profit: o.profit }));
      if (b2bReq.data) db.b2b = b2bReq.data.map(o => ({ id: o.id, date: o.date, type: o.type, client: o.client, flavour: o.flavour, unit: o.unit, size: o.size, kg: o.kg, unitCost: o.unit_cost, cost: o.cost, advance: o.advance, cogs: o.cogs, profit: o.profit }));
      if (cliReq.data) db.clients = cliReq.data.map(c => c.name);
      if (flavReq.data) db.supplierFlavours = flavReq.data.map(f => ({ supplier: f.supplier, flavour: f.flavour, b2bCogs: f.b2b_cogs, boxCogs: f.box_cogs || {} }));
      if (settingsReq && settingsReq.data) {
        const boxSizesRow = settingsReq.data.find(r => r.key === 'box_sizes');
        if (boxSizesRow && boxSizesRow.value) {
          db.boxSizes = boxSizesRow.value;
        } else if (!isCloudEmpty) {
          await supabase.from('tracker_settings').insert({ key: 'box_sizes', value: db.boxSizes });
        }
      }
      
      // Migrate old b2c80gCogs logic in local DB to boxCogs
      db.supplierFlavours.forEach(sf => {
        if (!sf.boxCogs) sf.boxCogs = {};
        if (sf.b2c80gCogs !== undefined) { sf.boxCogs['80g'] = sf.b2c80gCogs; delete sf.b2c80gCogs; }
        if (sf.b2c180gCogs !== undefined) { sf.boxCogs['180g'] = sf.b2c180gCogs; delete sf.b2c180gCogs; }
      });

      saveRevDB(db);
    } catch (e) {
      console.error('Tracker Sync Error', e);
    }
  }

  // Authentication & Open/Close Logic
  const pinOverlay = document.getElementById('b2b-pin-overlay');
  const pinInput = document.getElementById('b2b-pin-input');
  const pinBtn = document.getElementById('b2b-pin-btn');
  const pinError = document.getElementById('b2b-pin-error');
  const THE_PIN = "7069";

  triggerBtn.addEventListener('click', (e) => {
    if (e && e.preventDefault) e.preventDefault(); 
    modal.classList.add('is-open');
    pinOverlay.style.display = 'flex'; // Lock with PIN screen
    pinInput.value = '';
    pinError.style.display = 'none';
    pinInput.focus();
  });

  async function unlockTracker() {
    if (pinInput.value === THE_PIN) {
      pinOverlay.style.display = 'none';
      await initRevDB();
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
    
    const boxSizeList = document.getElementById('box-size-list');
    const dynamicCogsContainer = document.getElementById('dynamic-cogs-container');
    const b2cSizeSel = document.getElementById('b2c-size');
    const b2bSizeSel = document.getElementById('b2b-size');

    // Clear
    if(clientList) clientList.innerHTML = '';
    if(flavourList) flavourList.innerHTML = '';
    if(boxSizeList) boxSizeList.innerHTML = '';
    if(b2bClientSel) b2bClientSel.innerHTML = '<option value="" disabled selected>Select Client</option>';
    if(b2bFlavourSel) b2bFlavourSel.innerHTML = '<option value="" disabled selected>Select Flavour</option>';
    if(b2cFlavourSel) b2cFlavourSel.innerHTML = '<option value="" disabled selected>Select Flavour</option>';
    if(b2cSizeSel) b2cSizeSel.innerHTML = '';
    if(b2bSizeSel) b2bSizeSel.innerHTML = '';
    if(dynamicCogsContainer) dynamicCogsContainer.innerHTML = '';

    // Default Flavours if empty
    if(!db.supplierFlavours || db.supplierFlavours.length === 0) {
      db.supplierFlavours = [
        { supplier: 'In-House', flavour: 'Double Chocolate', boxCogs: {'80g':71.25, '180g':147}, b2bCogs: 850 },
        { supplier: 'In-House', flavour: 'Choco Chips', boxCogs: {'80g':71.25, '180g':147}, b2bCogs: 850 }
      ];
      saveRevDB(db);
    }

    db.clients.forEach((c, idx) => {
      if(clientList) clientList.innerHTML += `<li style="display:flex; justify-content:space-between;">${c} <button type="button" onclick="window.delClient(${idx})" style="background:none;border:none;cursor:pointer;color:red;" title="Delete">✖</button></li>`;
      if(b2bClientSel) b2bClientSel.innerHTML += `<option value="${c}">${c}</option>`;
    });

    db.boxSizes.forEach((sz, idx) => {
      if(boxSizeList) boxSizeList.innerHTML += `<li style="display:flex; justify-content:space-between;">${sz} <button type="button" onclick="window.delBoxSize(${idx})" style="background:none;border:none;cursor:pointer;color:red;" title="Delete">✖</button></li>`;
      if(b2cSizeSel) b2cSizeSel.innerHTML += `<option value="${sz}">${sz}</option>`;
      if(b2bSizeSel) b2bSizeSel.innerHTML += `<option value="${sz}">${sz}</option>`;
      
      if(dynamicCogsContainer) {
        dynamicCogsContainer.innerHTML += `
          <div class="b2b-form-group" style="flex:1; min-width: 120px;">
            <label>COGS (${sz}) (₹)</label>
            <input type="number" class="dyn-cogs-input" data-size="${sz}" required min="0" step="0.1" value="0">
          </div>
        `;
      }
    });

    db.supplierFlavours.forEach((sf, idx) => {
      const displayName = `${sf.supplier} - ${sf.flavour}`;
      if(flavourList) flavourList.innerHTML += `<li style="display:flex; justify-content:space-between;">${displayName} <button type="button" onclick="window.delFlavour(${idx})" style="background:none;border:none;cursor:pointer;color:red;" title="Delete">✖</button></li>`;
      if(b2bFlavourSel) b2bFlavourSel.innerHTML += `<option value="${displayName}">${displayName}</option>`;
      if(b2cFlavourSel) b2cFlavourSel.innerHTML += `<option value="${displayName}">${displayName}</option>`;
    });
  }

  // Expose delete functions globally so onclick works
  window.delClient = async (idx) => {
    const db = loadRevDB();
    if(confirm('Delete client?')) {
      const clientName = db.clients[idx];
      db.clients.splice(idx, 1);
      saveRevDB(db);
      renderSettings();
      if (supabase && clientName) {
        const { error } = await supabase.from('tracker_clients').delete().eq('name', clientName);
        if (error) alert('Supabase Delete Error: ' + error.message);
      }
    }
  };
  
  window.delBoxSize = async (idx) => {
    const db = loadRevDB();
    if(confirm('Delete box size? Note: Existing orders with this size will keep their data, but you won\'t be able to select this size for new orders.')) {
      db.boxSizes.splice(idx, 1);
      saveRevDB(db);
      renderSettings();
      if (supabase) {
        const { error } = await supabase.from('tracker_settings').update({ value: db.boxSizes }).eq('key', 'box_sizes');
        if (error) alert('Supabase Update Error: ' + error.message);
      }
    }
  };

  window.delFlavour = async (idx) => {
    const db = loadRevDB();
    if(confirm('Delete supplier & flavour?')) {
      const f = db.supplierFlavours[idx];
      db.supplierFlavours.splice(idx, 1);
      saveRevDB(db);
      renderSettings();
      if (supabase && f) {
        const { error } = await supabase.from('tracker_flavours').delete().match({ supplier: f.supplier, flavour: f.flavour });
        if (error) alert('Supabase Delete Error: ' + error.message);
      }
    }
  }

  if (formClient) {
    formClient.addEventListener('submit', async (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const newClient = document.getElementById('set-client-name').value.trim();
      if (newClient && !db.clients.includes(newClient)) {
        db.clients.push(newClient);
        saveRevDB(db);
        renderSettings();
        if (supabase) {
          const { error } = await supabase.from('tracker_clients').upsert({ name: newClient }, { onConflict: 'name' });
          if (error) alert('Supabase Upsert Error: ' + error.message);
        }
      }
      formClient.reset();
    });
  }

  const formBoxSize = document.getElementById('form-box-size');
  if (formBoxSize) {
    formBoxSize.addEventListener('submit', async (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const newSize = document.getElementById('set-box-size-name').value.trim();
      if (newSize && !db.boxSizes.includes(newSize)) {
        db.boxSizes.push(newSize);
        saveRevDB(db);
        renderSettings();
        if (supabase) {
          const { error } = await supabase.from('tracker_settings').update({ value: db.boxSizes }).eq('key', 'box_sizes');
          if (error) alert('Supabase Update Error: ' + error.message);
        }
      }
      formBoxSize.reset();
    });
  }

  if (formFlavour) {
    formFlavour.addEventListener('submit', async (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const supplierName = document.getElementById('set-supplier-name').value.trim();
      const newFlavour = document.getElementById('set-flavour-name').value.trim();
      const b2bCogs = parseFloat(document.getElementById('set-flavour-b2b-cogs').value) || 0;
      
      const boxCogs = {};
      document.querySelectorAll('.dyn-cogs-input').forEach(input => {
        const size = input.getAttribute('data-size');
        boxCogs[size] = parseFloat(input.value) || 0;
      });

      if (supplierName && newFlavour) {
        const exists = db.supplierFlavours.find(sf => sf.supplier === supplierName && sf.flavour === newFlavour);
        if (!exists) {
          db.supplierFlavours.push({ supplier: supplierName, flavour: newFlavour, boxCogs, b2bCogs });
          saveRevDB(db);
          renderSettings();
          if (supabase) {
            const { error } = await supabase.from('tracker_flavours').upsert(
              { supplier: supplierName, flavour: newFlavour, box_cogs: boxCogs, b2b_cogs: b2bCogs },
              { onConflict: 'supplier,flavour' }
            );
            if (error) alert('Supabase Upsert Error: ' + error.message);
          }
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

  const b2bUnit = document.getElementById('b2b-unit');
  const b2bSizeGroup = document.getElementById('b2b-size-group');
  if (b2bUnit && b2bSizeGroup) {
    b2bUnit.addEventListener('change', () => {
      if (b2bUnit.value === 'Box') {
        b2bSizeGroup.style.display = 'block';
        if(document.getElementById('b2b-kg')) document.getElementById('b2b-kg').previousElementSibling.textContent = 'Quantity (Boxes)';
      } else {
        b2bSizeGroup.style.display = 'none';
        if(document.getElementById('b2b-kg')) document.getElementById('b2b-kg').previousElementSibling.textContent = 'Quantity (KG)';
      }
    });
  }

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
    formB2C.addEventListener('submit', async (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const idInput = document.getElementById('b2c-id');
      const flavourVal = document.getElementById('b2c-flavour').value;
      const sizeVal = document.getElementById('b2c-size') ? document.getElementById('b2c-size').value : (db.boxSizes.length > 0 ? db.boxSizes[0] : '80g');
      const fObj = db.supplierFlavours.find(sf => `${sf.supplier} - ${sf.flavour}` === flavourVal);
      const baseCogs = fObj && fObj.boxCogs && fObj.boxCogs[sizeVal] ? fObj.boxCogs[sizeVal] : 0;
      const qty = parseFloat(b2cQty.value);
      const price = parseFloat(b2cPrice.value);
      const totalCogs = baseCogs * qty;
      const profit = price - totalCogs;

      const order = {
        id: idInput.value || 'b2c-'+Date.now().toString(),
        date: document.getElementById('b2c-date').value ? new Date(document.getElementById('b2c-date').value).toISOString() : new Date().toISOString(),
        type: 'B2C',
        flavour: flavourVal,
        size: sizeVal,
        qty: qty,
        unitCost: parseFloat(b2cUnitCost.value),
        price: price,
        cogs: totalCogs,
        profit: profit,
        advance: parseFloat(document.getElementById('b2c-advance').value) || 0
      };

      if (idInput.value) {
        const idx = db.b2c.findIndex(o => o.id === idInput.value);
        if (idx !== -1) db.b2c[idx] = { ...db.b2c[idx], ...order };
        if (supabase) {
          const { error } = await supabase.from('tracker_b2c').update({ flavour: order.flavour, size: order.size, qty: order.qty, unit_cost: order.unitCost, price: order.price, advance: order.advance, cogs: order.cogs, profit: order.profit }).eq('id', order.id);
          if (error) alert('Supabase Update Error: ' + error.message);
        }
      } else {
        db.b2c.push(order);
        if (supabase) {
          const { error } = await supabase.from('tracker_b2c').insert({ id: order.id, date: order.date, type: order.type, flavour: order.flavour, size: order.size, qty: order.qty, unit_cost: order.unitCost, price: order.price, advance: order.advance, cogs: order.cogs, profit: order.profit });
          if (error) alert('Supabase Insert Error: ' + error.message);
        }
      }

      saveRevDB(db);
      formB2C.reset();
      idInput.value = '';
      b2cQty.value = '1';
      document.getElementById('b2c-date').value = new Date().toISOString().slice(0, 10);
      renderDashboard();
    });
  }

  if (formB2B) {
    formB2B.addEventListener('submit', async (e) => {
      e.preventDefault();
      const db = loadRevDB();
      const idInput = document.getElementById('b2b-id');
      const flavourVal = document.getElementById('b2b-flavour').value;
      const unitVal = document.getElementById('b2b-unit').value;
      const sizeVal = document.getElementById('b2b-size') ? document.getElementById('b2b-size').value : null;
      
      const fObj = db.supplierFlavours.find(sf => `${sf.supplier} - ${sf.flavour}` === flavourVal);
      let baseCogs = 0;
      if (fObj) {
        if (unitVal === 'Box' && sizeVal && fObj.boxCogs && fObj.boxCogs[sizeVal]) {
          baseCogs = fObj.boxCogs[sizeVal];
        } else {
          baseCogs = fObj.b2bCogs || 0;
        }
      }
      
      const kg = parseFloat(b2bKg.value);
      const cost = parseFloat(b2bCost.value); // This is selling price total
      const totalCogs = baseCogs * kg;
      const profit = cost - totalCogs;

      const order = {
        id: idInput.value || 'b2b-'+Date.now().toString(),
        date: document.getElementById('b2b-date').value ? new Date(document.getElementById('b2b-date').value).toISOString() : new Date().toISOString(),
        type: 'B2B',
        client: document.getElementById('b2b-client').value,
        flavour: flavourVal,
        unit: unitVal,
        size: unitVal === 'Box' ? sizeVal : null,
        kg: kg,
        unitCost: parseFloat(b2bUnitCost.value),
        cost: cost,
        cogs: totalCogs,
        profit: profit,
        advance: parseFloat(document.getElementById('b2b-advance').value) || 0
      };

      if (idInput.value) {
        const idx = db.b2b.findIndex(o => o.id === idInput.value);
        if (idx !== -1) db.b2b[idx] = { ...db.b2b[idx], ...order };
        if (supabase) {
          const { error } = await supabase.from('tracker_b2b').update({ client: order.client, flavour: order.flavour, unit: order.unit, size: order.size, kg: order.kg, unit_cost: order.unitCost, cost: order.cost, advance: order.advance, cogs: order.cogs, profit: order.profit }).eq('id', order.id);
          if (error) alert('Supabase Update Error: ' + error.message);
        }
      } else {
        db.b2b.push(order);
        if (supabase) {
          const { error } = await supabase.from('tracker_b2b').insert({ id: order.id, date: order.date, type: order.type, client: order.client, flavour: order.flavour, unit: order.unit, kg: order.kg, unit_cost: order.unitCost, cost: order.cost, advance: order.advance, cogs: order.cogs, profit: order.profit });
          if (error) alert('Supabase Insert Error: ' + error.message);
        }
      }

      saveRevDB(db);
      formB2B.reset();
      idInput.value = '';
      b2bKg.value = '1';
      document.getElementById('b2b-date').value = new Date().toISOString().slice(0, 10);
      renderDashboard();
    });
  }

  // Edit / Delete Delegation
  const tbody = document.getElementById('b2b-ledger-body');
  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const type = btn.dataset.type;
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      
      const db = loadRevDB();
      
      if (action === 'delete') {
        if (!confirm('Delete this transaction?')) return;
        if (type === 'B2C') {
           db.b2c = db.b2c.filter(o => o.id !== id);
           if (supabase) {
             const { error } = await supabase.from('tracker_b2c').delete().eq('id', id);
             if (error) alert('Supabase Delete Error: ' + error.message);
           }
        }
        if (type === 'B2B') {
           db.b2b = db.b2b.filter(o => o.id !== id);
           if (supabase) {
             const { error } = await supabase.from('tracker_b2b').delete().eq('id', id);
             if (error) alert('Supabase Delete Error: ' + error.message);
           }
        }
        saveRevDB(db);
        renderDashboard();
      }
      
      if (action === 'edit' || action === 'duplicate') {
        let order;
        if (type === 'B2C') {
          order = db.b2c.find(o => o.id === id);
          if (order) {
            document.getElementById('b2c-id').value = action === 'edit' ? order.id : '';
            document.getElementById('b2c-date').value = new Date(order.date).toISOString().slice(0, 10);
            document.getElementById('b2c-flavour').value = order.flavour;
            if (document.getElementById('b2c-size')) document.getElementById('b2c-size').value = order.size || '80g';
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
            document.getElementById('b2b-id').value = action === 'edit' ? order.id : '';
            document.getElementById('b2b-date').value = new Date(order.date).toISOString().slice(0, 10);
            if(order.client) document.getElementById('b2b-client').value = order.client;
            document.getElementById('b2b-flavour').value = order.flavour;
            document.getElementById('b2b-unit').value = order.unit || 'KG';
            
            const b2bUnitSel = document.getElementById('b2b-unit');
            const b2bSizeGroup = document.getElementById('b2b-size-group');
            if (b2bUnitSel.value === 'Box') {
              if (b2bSizeGroup) b2bSizeGroup.style.display = 'block';
              if (document.getElementById('b2b-size')) document.getElementById('b2b-size').value = order.size || '';
            } else {
              if (b2bSizeGroup) b2bSizeGroup.style.display = 'none';
            }
            
            document.getElementById('b2b-kg').value = order.kg || 1;
            document.getElementById('b2b-unit-cost').value = order.unitCost || (order.cost / (order.kg || 1));
            document.getElementById('b2b-advance').value = order.advance || 0;
            calcB2B();
            document.querySelector('.b2b-tab[data-target="b2b-pane-b2b"]').click();
          }
        }
      }
      
      if (action === 'whatsapp') {
        const o = db.b2c.find(x => x.id === id) || db.b2b.find(x => x.id === id);
        if (o) {
          let text = `*Crumbly Order Alert* 🍪\n\n*ID:* ${o.id}\n*Type:* ${o.type}\n*Amount:* ₹${o.price || o.cost}\n*Advance:* ₹${o.advance || 0}`;
          if (o.type === 'B2B') text += `\n*Client:* ${o.client}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
      }
    });
  }

  // Render Dashboard Data
  function renderDashboard() {
    const db = loadRevDB();
    const filterVal = document.querySelector('.b2b-date-input').value;
    const searchVal = document.querySelector('.b2b-search-input') ? document.querySelector('.b2b-search-input').value.toLowerCase() : '';
    const typeFilter = document.querySelector('.b2b-type-filter') ? document.querySelector('.b2b-type-filter').value : '';

    const todayYMD = new Date().toISOString().slice(0, 10);
    if (document.getElementById('b2c-date') && !document.getElementById('b2c-date').value) document.getElementById('b2c-date').value = todayYMD;
    if (document.getElementById('b2b-date') && !document.getElementById('b2b-date').value) document.getElementById('b2b-date').value = todayYMD;

    let allTimeB2C = 0, allTimeB2B = 0;
    let allTimeProfitB2C = 0, allTimeProfitB2B = 0;
    let filteredB2C = 0, filteredB2B = 0;
    
    if(tbody) tbody.innerHTML = '';

    const allOrders = [];
    db.b2c.forEach(o => allOrders.push({ ...o, amount: o.price, profit: o.profit || 0, qtyStr: (o.qty || 1) + ' Box', desc: `${o.flavour} (${o.size || '80g'})` }));
    db.b2b.forEach(o => {
      let desc = o.client ? `${o.client} - ${o.flavour}` : o.flavour;
      if (o.unit === 'Box' && o.size) desc += ` (${o.size})`;
      allOrders.push({ ...o, amount: o.cost, profit: o.profit || 0, qtyStr: (o.kg || 1) + ' ' + (o.unit || 'KG'), desc });
    });

    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    allOrders.forEach(o => {
      const dDate = new Date(o.date);
      const ymd = dDate.toISOString().slice(0, 10);
      
      if (o.type === 'B2C') { allTimeB2C += o.amount; allTimeProfitB2C += o.profit; }
      if (o.type === 'B2B') { allTimeB2B += o.amount; allTimeProfitB2B += o.profit; }

      if (filterVal && ymd !== filterVal) return;
      if (typeFilter && o.type !== typeFilter) return;
      if (searchVal) {
        const searchStr = `${o.desc} ${o.type} ${o.client || ''} ${ymd}`.toLowerCase();
        if (!searchStr.includes(searchVal)) return;
      }

      if (o.type === 'B2C') { filteredB2C += o.amount; }
      if (o.type === 'B2B') { filteredB2B += o.amount; }

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
            <button type="button" class="b2b-btn-icon" data-action="whatsapp" data-id="${o.id}" data-type="${o.type}" title="Share via WhatsApp">📱</button>
            <button type="button" class="b2b-btn-icon" data-action="duplicate" data-id="${o.id}" data-type="${o.type}" title="Duplicate">📋</button>
            <button type="button" class="b2b-btn-icon" data-action="edit" data-id="${o.id}" data-type="${o.type}" title="Edit">✏️</button>
            <button type="button" class="b2b-btn-icon" data-action="delete" data-id="${o.id}" data-type="${o.type}" title="Delete">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      }
    });

    // Calculate AI Insights
    let maxOrder = 0;
    const flavourCounts = {};
    const clientRevs = {};

    allOrders.forEach(o => {
      if (o.amount > maxOrder) maxOrder = o.amount;
      
      const fKey = o.flavour;
      if (!flavourCounts[fKey]) flavourCounts[fKey] = 0;
      flavourCounts[fKey] += (o.qty || o.kg || 1);

      if (o.type === 'B2B' && o.client) {
        if (!clientRevs[o.client]) clientRevs[o.client] = 0;
        clientRevs[o.client] += o.amount;
      }
    });

    let topFlavour = '-', topClient = '-';
    let highestF = 0, highestC = 0;

    for (const f in flavourCounts) {
      if (flavourCounts[f] > highestF) { highestF = flavourCounts[f]; topFlavour = f; }
    }
    for (const c in clientRevs) {
      if (clientRevs[c] > highestC) { highestC = clientRevs[c]; topClient = c; }
    }

    const elTopFlavour = document.getElementById('b2b-val-top-flavour');
    if (elTopFlavour) elTopFlavour.textContent = topFlavour;
    
    const elTopClient = document.getElementById('b2b-val-top-client');
    if (elTopClient) elTopClient.textContent = topClient;
    
    const elBiggestOrder = document.getElementById('b2b-val-biggest-order');
    if (elBiggestOrder) elBiggestOrder.textContent = `₹${maxOrder.toLocaleString()}`;

    const totalRev = allTimeB2C + allTimeB2B;
    const target = 1000000;
    const pct = Math.min(100, (totalRev / target) * 100).toFixed(1);

    const allTimeTotalProfit = allTimeProfitB2C + allTimeProfitB2B;
    const margin = totalRev > 0 ? ((allTimeTotalProfit / totalRev) * 100).toFixed(1) : 0;

    const elTotal = document.getElementById('b2b-val-total');
    if(elTotal) elTotal.textContent = `₹${totalRev.toLocaleString()}`;
    const elB2B = document.getElementById('b2b-val-b2b');
    if(elB2B) elB2B.textContent = `₹${filteredB2B.toLocaleString()}`;
    const elB2C = document.getElementById('b2b-val-b2c');
    if(elB2C) elB2C.textContent = `₹${filteredB2C.toLocaleString()}`;
    
    const elProfitTotal = document.getElementById('b2b-val-profit');
    if(elProfitTotal) elProfitTotal.textContent = `₹${allTimeTotalProfit.toLocaleString()}`;
    const elProfitB2B = document.getElementById('b2b-val-b2b-profit');
    if(elProfitB2B) elProfitB2B.textContent = `₹${allTimeProfitB2B.toLocaleString()}`;
    const elProfitB2C = document.getElementById('b2b-val-b2c-profit');
    if(elProfitB2C) elProfitB2C.textContent = `₹${allTimeProfitB2C.toLocaleString()}`;
    const elMargin = document.getElementById('b2b-val-margin');
    if(elMargin) elMargin.textContent = `${margin}%`;

    const elPct = document.getElementById('b2b-target-pct');
    if(elPct) elPct.textContent = `${pct}%`;
    const elFill = document.getElementById('b2b-target-fill');
    if(elFill) elFill.style.width = `${pct}%`;
  }

  const clearBtn = document.querySelector('.b2b-btn-clear');
  const dateInput = document.querySelector('.b2b-date-input');
  const searchInput = document.querySelector('.b2b-search-input');
  const typeFilter = document.querySelector('.b2b-type-filter');
  
  if(dateInput) {
      dateInput.addEventListener('change', renderDashboard);
  }
  
  if(searchInput) {
      searchInput.addEventListener('input', renderDashboard);
  }
  
  if(typeFilter) {
      typeFilter.addEventListener('change', renderDashboard);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if(dateInput) dateInput.value = '';
      if(searchInput) searchInput.value = '';
      if(typeFilter) typeFilter.value = '';
      renderDashboard();
    });
  }

  // --- Google Sheets Sync Logic ---
  const btnGSheetSync = document.getElementById('btn-gsheet-sync');
  const gsheetWebhookInput = document.getElementById('gsheet-webhook');
  const gsheetIdGroup = document.getElementById('gsheet-id-group');
  const gsheetIdInput = document.getElementById('gsheet-id');
  const gsheetLink = document.getElementById('gsheet-link');
  const gsheetSyncStatus = document.getElementById('gsheet-sync-status');

  const savedWebhook = localStorage.getItem('CRUMBLY_GSHEET_WEBHOOK');
  const savedSheetId = localStorage.getItem('CRUMBLY_GSHEET_ID');
  
  if (savedWebhook && gsheetWebhookInput) gsheetWebhookInput.value = savedWebhook;
  if (savedSheetId && gsheetIdGroup) {
    gsheetIdGroup.style.display = 'block';
    gsheetIdInput.value = savedSheetId;
    if (gsheetLink) gsheetLink.href = 'https://docs.google.com/spreadsheets/d/' + savedSheetId;
  }

  const btnGsheetReset = document.getElementById('btn-gsheet-reset');
  if (btnGsheetReset) {
    btnGsheetReset.addEventListener('click', () => {
      localStorage.removeItem('CRUMBLY_GSHEET_ID');
      if (gsheetIdGroup) gsheetIdGroup.style.display = 'none';
      if (gsheetIdInput) gsheetIdInput.value = '';
      if (gsheetSyncStatus) {
        gsheetSyncStatus.textContent = 'Spreadsheet ID unlinked. Next sync will create a new one.';
        gsheetSyncStatus.style.color = '#666';
      }
    });
  }

  if (btnGSheetSync) {
    btnGSheetSync.addEventListener('click', async () => {
      const webhookUrl = gsheetWebhookInput.value.trim();
      if (!webhookUrl) {
        gsheetSyncStatus.textContent = 'Please enter a valid Webhook URL.';
        gsheetSyncStatus.style.color = 'red';
        return;
      }
      
      localStorage.setItem('CRUMBLY_GSHEET_WEBHOOK', webhookUrl);
      const db = loadRevDB();
      
      let totalB2C = 0, totalB2B = 0;
      let profitB2C = 0, profitB2B = 0;
      db.b2c.forEach(o => { totalB2C += (o.price || 0); profitB2C += (o.profit || 0); });
      db.b2b.forEach(o => { totalB2B += (o.cost || 0); profitB2B += (o.profit || 0); });
      
      const totalRev = totalB2C + totalB2B;
      const totalProfit = profitB2C + profitB2B;
      const pct = Math.min(100, (totalRev / 1000000) * 100).toFixed(1);
      const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;
      
      const dashboard = [
        ["Metric", "Value"],
        ["Total Revenue (₹)", totalRev],
        ["B2C Revenue (₹)", totalB2C],
        ["B2B Revenue (₹)", totalB2B],
        ["Goal Progress (%)", pct + "%"],
        ["Total Profit (₹)", totalProfit],
        ["B2C Profit (₹)", profitB2C],
        ["B2B Profit (₹)", profitB2B],
        ["Blended Margin (%)", margin + "%"]
      ];

      const payload = {
        spreadsheetId: localStorage.getItem('CRUMBLY_GSHEET_ID') || '',
        dashboard: dashboard,
        b2c: db.b2c,
        b2b: db.b2b,
        clients: db.clients,
        flavours: db.supplierFlavours,
        boxSizes: db.boxSizes
      };

      btnGSheetSync.textContent = 'Syncing...';
      gsheetSyncStatus.textContent = 'Sending data to Google Sheets...';
      gsheetSyncStatus.style.color = '#666';

      try {
        let currentPayload = { ...payload };
        let response = await fetch(webhookUrl, {
          method: 'POST',
          body: JSON.stringify(currentPayload),
          headers: { 'Content-Type': 'text/plain' }
        });
        
        let result = await response.json();
        
        // Auto-retry if Spreadsheet ID is stale/deleted (permission error)
        if (!result.success && result.error && (result.error.toLowerCase().includes('permission') || result.error.toLowerCase().includes('access'))) {
           localStorage.removeItem('CRUMBLY_GSHEET_ID');
           currentPayload.spreadsheetId = ''; // Clear the stale ID
           
           gsheetSyncStatus.textContent = 'Stale sheet detected. Creating a new one...';
           
           response = await fetch(webhookUrl, {
             method: 'POST',
             body: JSON.stringify(currentPayload),
             headers: { 'Content-Type': 'text/plain' }
           });
           result = await response.json();
        }

        if (result.success) {
          gsheetSyncStatus.textContent = 'Sync successful!';
          gsheetSyncStatus.style.color = 'green';
          
          if (result.spreadsheetId) {
            localStorage.setItem('CRUMBLY_GSHEET_ID', result.spreadsheetId);
            if (gsheetIdGroup) gsheetIdGroup.style.display = 'block';
            if (gsheetIdInput) gsheetIdInput.value = result.spreadsheetId;
            if (gsheetLink) gsheetLink.href = result.spreadsheetUrl || ('https://docs.google.com/spreadsheets/d/' + result.spreadsheetId);
          }
        } else {
          gsheetSyncStatus.textContent = 'Sync failed: ' + (result.error || 'Unknown error');
          gsheetSyncStatus.style.color = 'red';
        }
      } catch (err) {
        gsheetSyncStatus.textContent = 'Network error. Make sure the Webhook URL is correct.';
        gsheetSyncStatus.style.color = 'red';
        console.error(err);
      } finally {
        btnGSheetSync.textContent = 'Sync to Google Sheets Now';
      }
    });
  }

  // --- Excel Export Logic (Multi-Tab) ---
  const btnExport = document.getElementById('b2b-btn-export');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (typeof XLSX === 'undefined') {
        alert('Excel export library is still loading. Please try again in a moment.');
        return;
      }
      
      const db = loadRevDB();
      const timestamp = new Date().toISOString().slice(0,10);
      const wb = XLSX.utils.book_new();

      // 1. Dashboard Sheet
      let totalB2C = 0, totalB2B = 0;
      let profitB2C = 0, profitB2B = 0;
      db.b2c.forEach(o => { totalB2C += (o.price || 0); profitB2C += (o.profit || 0); });
      db.b2b.forEach(o => { totalB2B += (o.cost || 0); profitB2B += (o.profit || 0); });
      
      const totalRev = totalB2C + totalB2B;
      const totalProfit = profitB2C + profitB2B;
      const pct = Math.min(100, (totalRev / 1000000) * 100).toFixed(1);
      const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;
      
      const dashData = [
        ["Metric", "Value"],
        ["Total Revenue (₹)", totalRev],
        ["B2C Revenue (₹)", totalB2C],
        ["B2B Revenue (₹)", totalB2B],
        ["Goal Progress (%)", pct + "%"],
        ["Total Profit (₹)", totalProfit],
        ["B2C Profit (₹)", profitB2C],
        ["B2B Profit (₹)", profitB2B],
        ["Blended Margin (%)", margin + "%"]
      ];
      const wsDash = XLSX.utils.aoa_to_sheet(dashData);
      XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");

      // 2. B2C Orders
      const b2cData = [["ID", "Date", "Flavour", "Size", "Qty (Boxes)", "Selling Price/Box", "Total Revenue", "Total COGS", "Net Profit", "Advance"]];
      db.b2c.forEach(o => b2cData.push([o.id, o.date, o.flavour, o.size || '80g', o.qty, o.unitCost, o.price, o.cogs || 0, o.profit || 0, o.advance]));
      const wsB2C = XLSX.utils.aoa_to_sheet(b2cData);
      XLSX.utils.book_append_sheet(wb, wsB2C, "B2C Orders");

      // 3. B2B Orders
      const b2bData = [["ID", "Date", "Client", "Flavour", "Unit", "Size", "Quantity", "Selling Price/Unit", "Total Revenue", "Total COGS", "Net Profit", "Advance"]];
      db.b2b.forEach(o => b2bData.push([o.id, o.date, o.client, o.flavour, o.unit, o.size || '', o.kg, o.unitCost, o.cost, o.cogs || 0, o.profit || 0, o.advance]));
      const wsB2B = XLSX.utils.aoa_to_sheet(b2bData);
      XLSX.utils.book_append_sheet(wb, wsB2B, "B2B Orders");

      // 4. Clients
      const clientData = [["Client Name"]];
      db.clients.forEach(c => clientData.push([c]));
      const wsClients = XLSX.utils.aoa_to_sheet(clientData);
      XLSX.utils.book_append_sheet(wb, wsClients, "Clients");

      // 5. Flavours
      const flavourData = [["Supplier", "Flavour", ...db.boxSizes.map(sz => `COGS ${sz} (₹)`), "B2B COGS (₹/KG)"]];
      db.supplierFlavours.forEach(f => {
        const row = [f.supplier, f.flavour];
        db.boxSizes.forEach(sz => row.push(f.boxCogs && f.boxCogs[sz] ? f.boxCogs[sz] : 0));
        row.push(f.b2bCogs || 0);
        flavourData.push(row);
      });
      const wsFlavours = XLSX.utils.aoa_to_sheet(flavourData);
      XLSX.utils.book_append_sheet(wb, wsFlavours, "Flavours");

      // Trigger Download
      XLSX.writeFile(wb, `crumbly_b2b_tracker_${timestamp}.xlsx`);
    });
  }

  // Auto-open if PWA trigger
  if (window.location.search.includes('b2b=true')) {
    if (triggerBtn) triggerBtn.click();
  }
});
