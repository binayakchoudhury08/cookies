/**
 * ═════════════════════════════════════════════════════════════════════
 * CRUMBLY™ — Executive Business & Operations Admin Dashboard Logic
 * ═════════════════════════════════════════════════════════════════════
 * Orchestrates Security PIN Gate, View Routing, Real-Time Canvas Charts,
 * Orders, Finance P&L, Expenses, Inventory, Logistics, and Waitlist CRM.
 */

document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB) {
    console.error('CRUMBLY_DB is not loaded!');
    return;
  }

  /* ══════════════════════════════════════════════════════════
     1. SECURITY PIN LOCK SCREEN ENGINE
     ══════════════════════════════════════════════════════════ */
  const lockScreen = document.getElementById('admin-lock-screen');
  const pinDots = document.querySelectorAll('.pin-dot');
  const keyBtns = document.querySelectorAll('.key-btn');
  const lockError = document.getElementById('lock-error-msg');
  const rememberChk = document.getElementById('remember-pin-chk');
  const lockBtn = document.getElementById('btn-lock-session');

  let enteredPin = "";

  function updatePinDots() {
    pinDots.forEach((dot, index) => {
      dot.classList.toggle('is-filled', index < enteredPin.length);
    });
  }

  function handleDigit(digit) {
    if (enteredPin.length < 4) {
      enteredPin += digit;
      updatePinDots();
      if (enteredPin.length === 4) {
        verifyPin();
      }
    }
  }

  function handleBackspace() {
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      updatePinDots();
      lockError.textContent = "";
    }
  }

  function verifyPin() {
    const remember = rememberChk ? rememberChk.checked : false;
    const res = DB.login(enteredPin, remember);
    if (res.success) {
      lockScreen.classList.add('is-unlocked');
      enteredPin = "";
      updatePinDots();
      lockError.textContent = "";
      refreshAllViews();
    } else {
      lockError.textContent = res.message || "Incorrect PIN";
      // Shake animation
      lockScreen.querySelector('.lock-card').animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(0)' }
      ], { duration: 300 });

      setTimeout(() => {
        enteredPin = "";
        updatePinDots();
      }, 400);
    }
  }

  // Keypad click listeners
  keyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.key;
      if (val === 'backspace') {
        handleBackspace();
      } else if (val === 'clear') {
        enteredPin = "";
        updatePinDots();
        lockError.textContent = "";
      } else if (val) {
        handleDigit(val);
      }
    });
  });

  // Physical keyboard support
  window.addEventListener('keydown', (e) => {
    if (!lockScreen.classList.contains('is-unlocked')) {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        enteredPin = "";
        updatePinDots();
      }
    }
  });

  // Check existing session
  if (DB.isAuthenticated()) {
    lockScreen.classList.add('is-unlocked');
  }

  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      DB.logout();
      lockScreen.classList.remove('is-unlocked');
      enteredPin = "";
      updatePinDots();
    });
  }

  /* ══════════════════════════════════════════════════════════
     2. NAVIGATION & TAB ROUTING ENGINE
     ══════════════════════════════════════════════════════════ */
  const navItems = document.querySelectorAll('[data-tab]');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('header-page-title');
  const sidebar = document.getElementById('admin-sidebar');
  const menuToggle = document.getElementById('menu-toggle-btn');

  function switchTab(tabId) {
    navItems.forEach(item => {
      item.classList.toggle('is-active', item.dataset.tab === tabId);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('is-active', pane.id === `tab-${tabId}`);
    });

    const activeItem = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeItem && pageTitle) {
      pageTitle.textContent = activeItem.querySelector('.nav-label').textContent;
    }

    if (window.innerWidth <= 820 && sidebar) {
      sidebar.classList.remove('is-open');
    }

    window.location.hash = tabId;
    renderCurrentTab(tabId);
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
    });
  }

  // Handle hash navigation
  const initialHash = window.location.hash.replace('#', '') || 'dashboard';
  switchTab(initialHash);

  function renderCurrentTab(tabId) {
    if (tabId === 'dashboard') renderDashboardView();
    else if (tabId === 'orders') renderOrdersView();
    else if (tabId === 'finance') renderFinanceView();
    else if (tabId === 'expenses') renderExpensesView();
    else if (tabId === 'logistics') renderLogisticsView();
    else if (tabId === 'inventory') renderInventoryView();
    else if (tabId === 'crm') renderCRMView();
    else if (tabId === 'settings') renderSettingsView();
  }

  function refreshAllViews() {
    renderKPIs();
    renderCurrentTab(window.location.hash.replace('#', '') || 'dashboard');
  }

  /* ══════════════════════════════════════════════════════════
     3. EXECUTIVE DASHBOARD & CANVAS CHARTS
     ══════════════════════════════════════════════════════════ */
  function renderKPIs() {
    const fin = DB.getFinancialSummary();
    const cur = DB.getSettings().currency || "₹";

    const elRevenue = document.getElementById('kpi-val-revenue');
    const elOrders = document.getElementById('kpi-val-orders');
    const elProfit = document.getElementById('kpi-val-profit');
    const elLowStock = document.getElementById('kpi-val-lowstock');
    const elOven = document.getElementById('kpi-val-oven');
    const elTransit = document.getElementById('kpi-val-transit');

    if (elRevenue) elRevenue.textContent = `${cur}${fin.grossRevenue.toLocaleString('en-IN')}`;
    if (elOrders) elOrders.textContent = fin.totalOrdersCount;
    if (elProfit) elProfit.textContent = `${cur}${fin.grossProfit.toLocaleString('en-IN')} (${fin.grossMarginPct}%)`;
    if (elLowStock) elLowStock.textContent = fin.lowStockCount;
    if (elOven) elOven.textContent = fin.activeOvenOrders;
    if (elTransit) elTransit.textContent = fin.inTransitOrders;

    // Badges in sidebar
    const badgeOrders = document.getElementById('badge-orders');
    const badgeStock = document.getElementById('badge-stock');
    if (badgeOrders) badgeOrders.textContent = fin.activeOvenOrders;
    if (badgeStock) badgeStock.textContent = fin.lowStockCount > 0 ? fin.lowStockCount : '';
  }

  function renderDashboardView() {
    renderKPIs();
    renderSalesTrendChart('chart-sales-trend');
    renderFlavourDonutChart('chart-flavour-share');
    renderRecentOrdersList();
  }

  // Pure Canvas 7-Day Revenue & Expense Trend Chart
  function renderSalesTrendChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 240;
    const padding = { top: 25, right: 25, bottom: 35, left: 55 };

    ctx.clearRect(0, 0, w, h);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueData = [4500, 7200, 6800, 9400, 12800, 16500, 19800];
    const expenseData = [2100, 3400, 3100, 4200, 5600, 6200, 7100];
    const maxVal = 22000;

    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    // Draw Grid lines
    ctx.strokeStyle = 'rgba(244, 232, 220, 0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#9E816B';
      ctx.font = '10px Outfit, sans-serif';
      ctx.textAlign = 'right';
      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillText(`₹${(labelVal / 1000).toFixed(0)}k`, padding.left - 8, y + 3);
    }

    // Draw X-axis labels
    ctx.textAlign = 'center';
    days.forEach((day, idx) => {
      const x = padding.left + (plotW / (days.length - 1)) * idx;
      ctx.fillText(day, x, h - 10);
    });

    // Function to draw line & gradient area
    function drawTrendLine(data, strokeColor, fillColor) {
      const points = data.map((val, idx) => {
        const x = padding.left + (plotW / (data.length - 1)) * idx;
        const y = padding.top + plotH - (val / maxVal) * plotH;
        return { x, y };
      });

      // Fill Gradient Area
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineTo(points[points.length - 1].x, padding.top + plotH);
      ctx.lineTo(points[0].x, padding.top + plotH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + plotH);
      grad.addColorStop(0, fillColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw points
      points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.strokeStyle = '#1E1007';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Revenue Trend (Golden Caramel)
    drawTrendLine(revenueData, '#C48847', 'rgba(196, 136, 71, 0.25)');
    // Expense Trend (Subtle Rose)
    drawTrendLine(expenseData, '#EF4444', 'rgba(239, 68, 68, 0.12)');
  }

  // Pure Canvas Donut Chart for Flavour Share
  function renderFlavourDonutChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = 200;
    ctx.clearRect(0, 0, w, h);

    const flavours = [
      { name: "Double Chocolate", share: 0.48, color: "#8B4F1D" },
      { name: "Madagascar Vanilla", share: 0.24, color: "#D49B5A" },
      { name: "Red Velvet", share: 0.16, color: "#E85B46" },
      { name: "Wholesome Oats", share: 0.12, color: "#10B981" }
    ];

    const centerX = w / 2;
    const centerY = h / 2;
    const outerRadius = Math.min(centerX, centerY) - 15;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    flavours.forEach(f => {
      const sliceAngle = f.share * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = f.color;
      ctx.fill();
      ctx.strokeStyle = '#28160B';
      ctx.lineWidth = 3;
      ctx.stroke();
      startAngle += sliceAngle;
    });

    // Center Text
    ctx.fillStyle = '#FBF6EF';
    ctx.font = 'bold 18px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('48%', centerX, centerY - 8);
    ctx.fillStyle = '#D5BEA7';
    ctx.font = '9px Outfit, sans-serif';
    ctx.fillText('Chocolate', centerX, centerY + 12);
  }

  function renderRecentOrdersList() {
    const listContainer = document.getElementById('recent-orders-list');
    if (!listContainer) return;
    const orders = (DB.getOrders() || []).slice(0, 5);
    const cur = DB.getSettings().currency || "₹";

    listContainer.innerHTML = orders.map(o => {
      const statusClass = getStatusClass(o.fulfillmentStatus);
      return `
        <tr>
          <td><strong style="font-family:var(--font-mono);color:var(--admin-accent)">${o.id}</strong></td>
          <td>
            <strong>${o.customerName}</strong>
            <div style="font-size:11px;color:var(--admin-ink-muted)">${o.city || 'Standard Delivery'}</div>
          </td>
          <td>${o.items.map(i => `${i.pack} x${i.qty}`).join(', ')}</td>
          <td><strong>${cur}${o.totalAmount}</strong></td>
          <td><span class="status-pill ${statusClass}">${o.fulfillmentStatus}</span></td>
        </tr>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     4. ORDERS & DTC FULFILLMENT MANAGEMENT
     ══════════════════════════════════════════════════════════ */
  const orderFilterBtns = document.querySelectorAll('[data-order-filter]');
  let currentOrderFilter = 'all';

  orderFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      orderFilterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentOrderFilter = btn.dataset.orderFilter;
      renderOrdersView();
    });
  });

  function renderOrdersView() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    const cur = DB.getSettings().currency || "₹";
    let orders = DB.getOrders();

    if (currentOrderFilter !== 'all') {
      orders = orders.filter(o => {
        if (currentOrderFilter === 'in-oven') return o.fulfillmentStatus === 'In Oven';
        if (currentOrderFilter === 'ready') return o.fulfillmentStatus === 'Packed & Ready' || o.fulfillmentStatus === 'Quality Passed';
        if (currentOrderFilter === 'transit') return o.fulfillmentStatus === 'In Transit';
        if (currentOrderFilter === 'delivered') return o.fulfillmentStatus === 'Delivered';
        return true;
      });
    }

    tbody.innerHTML = orders.map(o => {
      const statusClass = getStatusClass(o.fulfillmentStatus);
      const cleanPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(o.customerName)}%2C%20CRUMBLY%20Order%20${o.id}%20Update%3A%20Your%20mini%20cookies%20are%20${encodeURIComponent(o.fulfillmentStatus)}%21`;

      return `
        <tr>
          <td>
            <strong style="font-family:var(--font-mono);color:var(--admin-accent)">${o.id}</strong>
            <div style="font-size:11px;color:var(--admin-ink-faint)">${o.date}</div>
          </td>
          <td>
            <strong>${o.customerName}</strong>
            <div style="font-size:11px;color:var(--admin-ink-muted)">${o.customerPhone}</div>
          </td>
          <td style="max-width:220px;">
            <div style="font-size:12px;color:var(--admin-ink-muted);line-height:1.35;">${o.shippingAddress}</div>
          </td>
          <td>
            <div>${o.items.map(i => `<b>${i.pack}</b> (x${i.qty})`).join('<br>')}</div>
          </td>
          <td>
            <strong>${cur}${o.totalAmount}</strong>
            <div style="font-size:10px;color:var(--admin-green);">${o.paymentStatus}</div>
          </td>
          <td>
            <select class="select-status" onchange="window.handleOrderStatusChange('${o.id}', this.value)">
              <option value="In Oven" ${o.fulfillmentStatus === 'In Oven' ? 'selected' : ''}>🔥 In Oven</option>
              <option value="Quality Passed" ${o.fulfillmentStatus === 'Quality Passed' ? 'selected' : ''}>✨ Quality Passed</option>
              <option value="Packed & Ready" ${o.fulfillmentStatus === 'Packed & Ready' ? 'selected' : ''}>📦 Packed & Ready</option>
              <option value="In Transit" ${o.fulfillmentStatus === 'In Transit' ? 'selected' : ''}>🚚 In Transit</option>
              <option value="Delivered" ${o.fulfillmentStatus === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
              <option value="Cancelled" ${o.fulfillmentStatus === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
            </select>
          </td>
          <td>
            <div class="action-btn-row">
              <a href="${waLink}" target="_blank" class="btn-icon-sm" title="WhatsApp Customer" style="color:#25D366;">💬</a>
              <button class="btn-icon-sm" title="Print Packing Slip" onclick="window.printPackingSlip('${o.id}')">🖨️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.handleOrderStatusChange = (orderId, newStatus) => {
    DB.updateOrderStatus(orderId, newStatus);
    refreshAllViews();
  };

  // Add Manual Order Modal
  const modalAddOrder = document.getElementById('modal-add-order');
  const btnOpenAddOrder = document.getElementById('btn-open-add-order');
  const formAddOrder = document.getElementById('form-add-order');

  if (btnOpenAddOrder && modalAddOrder) {
    btnOpenAddOrder.addEventListener('click', () => modalAddOrder.classList.add('is-open'));
  }

  if (formAddOrder) {
    formAddOrder.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('ord-in-name').value.trim();
      const phone = document.getElementById('ord-in-phone').value.trim();
      const email = document.getElementById('ord-in-email').value.trim();
      const address = document.getElementById('ord-in-address').value.trim();
      const city = document.getElementById('ord-in-city').value.trim();
      const pack = document.getElementById('ord-in-pack').value;
      const qty = +document.getElementById('ord-in-qty').value || 1;
      const carrier = document.getElementById('ord-in-carrier').value;

      let price = 449;
      if (pack.includes('400g')) price = 759;
      if (pack.includes('600g')) price = 1099;

      const orderData = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: address,
        city: city,
        items: [{ sku: "Double Chocolate", pack: pack, qty: qty, price: price }],
        totalAmount: price * qty,
        carrier: carrier,
        awb: carrier.startsWith('Blue') ? `BLD-${Math.floor(10000000 + Math.random() * 90000000)}` : `DLV-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: "Manual order logged from admin dashboard"
      };

      DB.addOrder(orderData);
      modalAddOrder.classList.remove('is-open');
      formAddOrder.reset();
      refreshAllViews();
    });
  }

  /* ══════════════════════════════════════════════════════════
     5. FINANCE & REAL-TIME P&L STATEMENT
     ══════════════════════════════════════════════════════════ */
  function renderFinanceView() {
    const fin = DB.getFinancialSummary();
    const cur = DB.getSettings().currency || "₹";

    const elFinGross = document.getElementById('fin-gross-revenue');
    const elFinCOGS = document.getElementById('fin-cogs');
    const elFinShipping = document.getElementById('fin-shipping-exp');
    const elFinMarketing = document.getElementById('fin-marketing-exp');
    const elFinRent = document.getElementById('fin-rent-exp');
    const elFinNet = document.getElementById('fin-net-profit');
    const elFinMargin = document.getElementById('fin-net-margin');
    const elFinAOV = document.getElementById('fin-aov');

    if (elFinGross) elFinGross.textContent = `${cur}${fin.grossRevenue.toLocaleString('en-IN')}`;
    if (elFinCOGS) elFinCOGS.textContent = `-${cur}${fin.totalCOGS.toLocaleString('en-IN')}`;
    if (elFinShipping) elFinShipping.textContent = `-${cur}${fin.shippingExpenses.toLocaleString('en-IN')}`;
    if (elFinMarketing) elFinMarketing.textContent = `-${cur}${fin.marketingExpenses.toLocaleString('en-IN')}`;
    if (elFinRent) elFinRent.textContent = `-${cur}${fin.opexKitchenRent.toLocaleString('en-IN')}`;
    if (elFinNet) {
      elFinNet.textContent = `${cur}${fin.operatingProfit.toLocaleString('en-IN')}`;
      elFinNet.style.color = fin.operatingProfit >= 0 ? 'var(--admin-green)' : 'var(--admin-red)';
    }
    if (elFinMargin) elFinMargin.textContent = `${fin.netMarginPct}%`;
    if (elFinAOV) elFinAOV.textContent = `${cur}${fin.averageOrderValue}`;
  }

  /* ══════════════════════════════════════════════════════════
     6. EXPENSES LOG & MANAGEMENT
     ══════════════════════════════════════════════════════════ */
  function renderExpensesView() {
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;
    const cur = DB.getSettings().currency || "₹";
    const expenses = DB.getExpenses();

    tbody.innerHTML = expenses.map(e => `
      <tr>
        <td><strong style="font-family:var(--font-mono);color:var(--admin-ink-muted)">${e.id}</strong></td>
        <td>${e.date}</td>
        <td><span class="status-pill status-in-oven">${e.category}</span></td>
        <td>
          <strong>${e.title}</strong>
          <div style="font-size:11px;color:var(--admin-ink-faint)">${e.notes || ''}</div>
        </td>
        <td><strong style="color:var(--admin-red)">-${cur}${e.amount.toLocaleString('en-IN')}</strong></td>
        <td>${e.vendor || '—'}</td>
        <td>${e.paymentMethod || 'UPI'}</td>
        <td>
          <button class="btn-icon-sm" title="Delete Expense" onclick="window.deleteExpenseItem('${e.id}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteExpenseItem = (id) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      DB.deleteExpense(id);
      refreshAllViews();
    }
  };

  const modalAddExp = document.getElementById('modal-add-expense');
  const btnOpenAddExp = document.getElementById('btn-open-add-expense');
  const formAddExp = document.getElementById('form-add-expense');

  if (btnOpenAddExp && modalAddExp) {
    btnOpenAddExp.addEventListener('click', () => modalAddExp.classList.add('is-open'));
  }

  if (formAddExp) {
    formAddExp.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('exp-in-title').value.trim();
      const category = document.getElementById('exp-in-cat').value;
      const amount = +document.getElementById('exp-in-amount').value || 0;
      const vendor = document.getElementById('exp-in-vendor').value.trim();
      const method = document.getElementById('exp-in-method').value;
      const notes = document.getElementById('exp-in-notes').value.trim();

      DB.addExpense({
        title,
        category,
        amount,
        vendor,
        paymentMethod: method,
        notes
      });

      modalAddExp.classList.remove('is-open');
      formAddExp.reset();
      refreshAllViews();
    });
  }

  /* ══════════════════════════════════════════════════════════
     7. LOGISTICS & COURIER DISPATCH
     ══════════════════════════════════════════════════════════ */
  function renderLogisticsView() {
    const tbody = document.getElementById('logistics-table-body');
    if (!tbody) return;
    const cur = DB.getSettings().currency || "₹";
    const logistics = DB.getLogistics();

    tbody.innerHTML = logistics.map(l => `
      <tr>
        <td><strong style="font-family:var(--font-mono);color:var(--admin-accent)">${l.orderId}</strong></td>
        <td><strong>${l.customer}</strong></td>
        <td>${l.destination}</td>
        <td><strong>${l.carrier}</strong></td>
        <td>
          <code style="font-family:var(--font-mono);background:var(--admin-surface-alt);padding:2px 6px;border-radius:4px;">${l.awb}</code>
        </td>
        <td>${l.dispatchDate}</td>
        <td>${l.estDelivery}</td>
        <td>${cur}${l.shippingCost}</td>
        <td><span class="status-pill status-in-transit">${l.status}</span></td>
      </tr>
    `).join('');
  }

  /* ══════════════════════════════════════════════════════════
     8. INVENTORY & RAW MATERIAL OPERATIONS
     ══════════════════════════════════════════════════════════ */
  function renderInventoryView() {
    const tbody = document.getElementById('inventory-table-body');
    const batchList = document.getElementById('baking-batches-body');
    if (!tbody) return;
    const cur = DB.getSettings().currency || "₹";
    const inventory = DB.getInventory();
    const batches = DB.getBatches();

    tbody.innerHTML = inventory.map(item => {
      const isLow = item.currentQty <= item.minThreshold;
      const statusPill = isLow ? `<span class="status-pill status-low-stock">⚠️ Low Stock (${item.currentQty}${item.unit})</span>` : `<span class="status-pill status-healthy">✓ Healthy (${item.currentQty}${item.unit})</span>`;

      return `
        <tr>
          <td><strong style="font-family:var(--font-mono);color:var(--admin-ink-muted)">${item.id}</strong></td>
          <td><strong>${item.name}</strong></td>
          <td>${item.category}</td>
          <td><strong style="font-size:15px;">${item.currentQty} ${item.unit}</strong></td>
          <td>${item.minThreshold} ${item.unit}</td>
          <td>${cur}${item.unitCost} / ${item.unit}</td>
          <td>${statusPill}</td>
          <td>
            <div class="action-btn-row">
              <button class="btn-icon-sm" title="Add Inbound Stock" onclick="window.adjustStockPrompt('${item.id}', 10)">+10</button>
              <button class="btn-icon-sm" title="Deduct Stock" onclick="window.adjustStockPrompt('${item.id}', -5)">-5</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (batchList) {
      batchList.innerHTML = batches.map(b => `
        <tr>
          <td><strong style="font-family:var(--font-mono);color:var(--admin-accent)">${b.id}</strong></td>
          <td>${b.date}</td>
          <td><strong>${b.flavour}</strong></td>
          <td>${b.actualYield} / ${b.targetQty} units</td>
          <td><strong style="color:var(--admin-green)">${b.passRate}%</strong></td>
          <td>${b.baker}</td>
          <td>${b.expiryDate}</td>
        </tr>
      `).join('');
    }
  }

  window.adjustStockPrompt = (invId, defaultAmount) => {
    const input = prompt(`Enter quantity adjustment for ${invId} (use positive to add, negative to deduct):`, defaultAmount);
    if (input !== null && !isNaN(+input)) {
      DB.updateInventoryStock(invId, +input, "Manual Admin adjustment");
      refreshAllViews();
    }
  };

  /* ══════════════════════════════════════════════════════════
     9. WAITLIST CRM & LEADS
     ══════════════════════════════════════════════════════════ */
  function renderCRMView() {
    const tbody = document.getElementById('crm-leads-table-body');
    if (!tbody) return;
    const leads = DB.getLeads();

    tbody.innerHTML = leads.map(lead => {
      const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
      const inviteWa = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20your%20CRUMBLY%20Waitlist%20Early%20Access%20Drop%20is%20LIVE%21%20Order%20secret%20batches%20here%3A%20https%3A%2F%2Fwbqudn-4r.myshopify.com`;

      return `
        <tr>
          <td><strong style="font-family:var(--font-mono);color:var(--admin-ink-muted)">${lead.id}</strong></td>
          <td>${lead.date}</td>
          <td><strong>${lead.name}</strong></td>
          <td>${lead.phone}</td>
          <td>${lead.email}</td>
          <td style="max-width:180px;"><div style="font-size:11.5px;color:var(--admin-ink-muted);">${lead.address || '—'}</div></td>
          <td><strong style="color:var(--admin-accent)">${lead.flavours}</strong></td>
          <td><span class="status-pill status-in-oven">${lead.status}</span></td>
          <td>
            <a href="${inviteWa}" target="_blank" class="quick-action-btn" style="padding:4px 10px;font-size:11px;">
              WhatsApp Invite ➔
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }

  /* ══════════════════════════════════════════════════════════
     10. SETTINGS, BACKUP EXPORT & IMPORT
     ══════════════════════════════════════════════════════════ */
  function renderSettingsView() {
    const set = DB.getSettings();
    const pinInput = document.getElementById('set-master-pin');
    const emailInput = document.getElementById('set-alert-email');
    if (pinInput) pinInput.value = set.masterPin || "7069";
    if (emailInput) emailInput.value = set.lowStockAlertEmail || "";
  }

  // Backup handlers
  const btnExportJSON = document.getElementById('btn-export-json');
  const btnImportJSON = document.getElementById('btn-import-json');
  const fileImportInput = document.getElementById('file-import-input');
  const btnExportOrdersCSV = document.getElementById('btn-export-orders-csv');
  const btnExportExpCSV = document.getElementById('btn-export-expenses-csv');
  const btnExportInvCSV = document.getElementById('btn-export-inventory-csv');

  if (btnExportJSON) btnExportJSON.addEventListener('click', () => DB.exportDatabaseJSON());
  if (btnExportOrdersCSV) btnExportOrdersCSV.addEventListener('click', () => DB.exportToCSV('orders'));
  if (btnExportExpCSV) btnExportExpCSV.addEventListener('click', () => DB.exportToCSV('expenses'));
  if (btnExportInvCSV) btnExportInvCSV.addEventListener('click', () => DB.exportToCSV('inventory'));

  if (btnImportJSON && fileImportInput) {
    btnImportJSON.addEventListener('click', () => fileImportInput.click());
    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = DB.importDatabaseJSON(evt.target.result);
          if (res.success) {
            alert('Database imported successfully!');
            refreshAllViews();
          } else {
            alert('Import failed: ' + res.message);
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Master PIN Update
  const formSettings = document.getElementById('form-settings');
  if (formSettings) {
    formSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      const newPin = document.getElementById('set-master-pin').value.trim();
      const alertEmail = document.getElementById('set-alert-email').value.trim();
      if (newPin.length === 4) {
        DB.updateMasterPin(newPin);
        DB.updateSettings({ lowStockAlertEmail: alertEmail });
        alert('Settings updated successfully!');
      } else {
        alert('Master PIN must be exactly 4 digits.');
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     11. MODAL CLOSE HANDLERS & PACKING SLIP
     ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-modal-backdrop').forEach(m => m.classList.remove('is-open'));
    });
  });

  window.printPackingSlip = (orderId) => {
    const order = (DB.getOrders() || []).find(o => o.id === orderId);
    if (!order) return;
    const cur = DB.getSettings().currency || "₹";

    const slipContent = document.getElementById('slip-print-content');
    if (slipContent) {
      slipContent.innerHTML = `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;color:#000;padding:24px;border:2px solid #000;max-width:500px;margin:0 auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:16px;">
            <h1 style="font-family:'Fredoka',sans-serif;font-size:32px;margin:0;">CRUMBLY</h1>
            <span style="font-weight:bold;font-size:14px;">PACKING SLIP</span>
          </div>
          <div style="margin-bottom:14px;">
            <strong>ORDER ID:</strong> ${order.id} | <strong>DATE:</strong> ${order.date}<br>
            <strong>CARRIER:</strong> ${order.carrier} | <strong>AWB:</strong> ${order.awb}
          </div>
          <div style="background:#f4f4f4;padding:10px;margin-bottom:16px;border-radius:6px;">
            <strong>DELIVER TO:</strong><br>
            <b>${order.customerName}</b><br>
            ${order.shippingAddress}<br>
            Phone: ${order.customerPhone}
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead>
              <tr style="border-bottom:1px solid #000;text-align:left;">
                <th style="padding:6px 0;">ITEM</th>
                <th style="padding:6px 0;text-align:right;">QTY</th>
                <th style="padding:6px 0;text-align:right;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(i => `
                <tr style="border-bottom:1px solid #ddd;">
                  <td style="padding:8px 0;"><b>${i.sku}</b> - ${i.pack}</td>
                  <td style="padding:8px 0;text-align:right;">${i.qty}</td>
                  <td style="padding:8px 0;text-align:right;">${cur}${i.price * i.qty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align:right;font-size:16px;font-weight:bold;border-top:2px solid #000;padding-top:8px;">
            TOTAL PAID: ${cur}${order.totalAmount}
          </div>
          <div style="text-align:center;font-size:12px;margin-top:24px;border-top:1px dashed #999;padding-top:10px;">
            Thank you for ordering fresh CRUMBLY Mini Coins!<br>
            <em>YOU KNOW YOU WANT IT.</em>
          </div>
        </div>
      `;
      window.print();
    }
  };

  // Helper status class mapper
  function getStatusClass(status) {
    if (status === 'In Oven') return 'status-in-oven';
    if (status === 'Quality Passed') return 'status-quality-passed';
    if (status === 'Packed & Ready') return 'status-packed';
    if (status === 'In Transit') return 'status-in-transit';
    if (status === 'Delivered') return 'status-delivered';
    return 'status-in-oven';
  }
});
