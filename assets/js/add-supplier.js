document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB || !DB.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('form-add-supplier');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const supData = {
        name: document.getElementById('sup-name').value,
        supplies: document.getElementById('sup-supplies').value,
        phone: document.getElementById('sup-phone').value,
        email: document.getElementById('sup-email').value
      };

      DB.addSupplier(supData);
      
      // Redirect back to dashboard Settings tab
      window.location.href = 'admin.html#settings';
    });
  }
});
