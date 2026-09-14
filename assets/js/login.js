/**
 * ═════════════════════════════════════════════════════════════════════
 * CRUMBLY™ — Admin Login Logic
 * ═════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  const DB = window.CRUMBLY_DB;
  if (!DB) {
    console.error('CRUMBLY_DB is not loaded!');
    return;
  }

  // Redirect if already authenticated
  if (DB.isAuthenticated()) {
    window.location.href = 'admin.html';
    return;
  }

  const lockScreen = document.getElementById('admin-lock-screen');
  const pinDots = document.querySelectorAll('.pin-dot');
  const keyBtns = document.querySelectorAll('.key-btn');
  const lockError = document.getElementById('lock-error-msg');
  const rememberChk = document.getElementById('remember-pin-chk');

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
      enteredPin = "";
      updatePinDots();
      lockError.textContent = "";
      window.location.href = 'admin.html';
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
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      enteredPin = "";
      updatePinDots();
    }
  });
});
