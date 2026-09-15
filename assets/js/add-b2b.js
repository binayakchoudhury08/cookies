document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB || !DB.isAuthenticated()) {
    setTimeout(() => window.location.href = 'login.html', 500);
    return;
  }

  const clientSelect = document.getElementById('b2b-client');
  if (clientSelect) {
    const clients = DB.getB2BClients();
    clients.forEach(c => {
      const option = document.createElement('option');
      option.value = c.name;
      option.textContent = c.name;
      clientSelect.appendChild(option);
    });
  }

  const form = document.getElementById('form-add-b2b');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const orderData = {
        clientName: document.getElementById('b2b-client').value,
        contactPerson: document.getElementById('b2b-contact').value,
        phone: document.getElementById('b2b-phone').value,
        flavours: document.getElementById('b2b-flavours').value,
        unit: document.getElementById('b2b-unit').value,
        totalAmount: +document.getElementById('b2b-amount').value,
        paymentTerms: document.getElementById('b2b-terms').value,
        deliveryDate: document.getElementById('b2b-delivery').value
      };

      DB.addB2BOrder(orderData);
      
      // Redirect back to dashboard B2B tab
      setTimeout(() => window.location.href = 'admin.html#b2b', 500);
    });
  }
});

