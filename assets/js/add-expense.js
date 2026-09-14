document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB || !DB.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('form-add-expense');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const expData = {
        title: document.getElementById('exp-in-title').value,
        category: document.getElementById('exp-in-cat').value,
        amount: +document.getElementById('exp-in-amount').value,
        vendor: document.getElementById('exp-in-vendor').value,
        method: document.getElementById('exp-in-method').value
      };

      DB.addExpense(expData);
      
      // Redirect back to dashboard expenses tab
      window.location.href = 'admin.html#expenses';
    });
  }
});
