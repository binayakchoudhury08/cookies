/**
 * Logic for Add Manual Order page
 */
document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB) return;

  if (!DB.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const formAddOrder = document.getElementById('form-add-order');
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
      window.location.href = 'admin.html#orders';
    });
  }
});
