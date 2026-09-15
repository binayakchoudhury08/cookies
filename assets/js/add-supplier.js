document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB || !DB.isAuthenticated()) {
    setTimeout(() => window.location.href = 'login.html', 500);
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
      setTimeout(() => window.location.href = 'admin.html#settings', 500);
    });
  }
});

