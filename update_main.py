import re

file_path = r"c:\Users\DELL\Downloads\crumbly-site (2)\crumbly\assets\js\main.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update PACKS
packs_old = '''  PACKS: {
    1: {
      name: "Single Box (200g)",
      weight: "200g",
      price: 449,
      mrp: 559,
      variantId: "47857840423061"
    },
    2: {
      name: "Duo Pack (400g)",
      weight: "400g",
      price: 759,
      mrp: 959,
      variantId: "47857840455829"
    },
    3: {
      name: "Party Trio (600g)",
      weight: "600g",
      price: 1099,
      mrp: 1499,
      variantId: "47857840488597"
    }
  },'''

packs_new = '''  PACKS: {
    1: {
      name: "Double Chocolate (180g)",
      weight: "180g",
      price: 449,
      mrp: 559,
      variantId: "47857840423061"
    },
    2: {
      name: "Choco Chips (180g)",
      weight: "180g",
      price: 449,
      mrp: 559,
      variantId: "0000000000000"
    }
  },'''

content = content.replace(packs_old, packs_new)

# 2. Remove physics engine (from "ADVANCED REAL-TIME CRUMB PHYSICS" to before "DTC E-COMMERCE")
content = re.sub(
    r'/\*\s*══════════════════════════════════════════════════════════\s*ADVANCED REAL-TIME CRUMB PHYSICS.*?\(\)\(\);\s*', 
    '', 
    content, flags=re.DOTALL
)

# 3. Update Checkout Link to Add to Cart
content = content.replace('?checkout', '')
content = content.replace('Pre-Order Now • ₹${totalPrice} ➔', 'Add to Cart • ₹${totalPrice} ➔')

# 4. Remove Savings Banner logic for pack 3 (which was Best Value)
content = content.replace(
    '''if (selectedPackId === 1) {
        savingsText.innerHTML = `You save <b>₹${totalSavings}</b> today · Fresh Oven-Baked Dispatch Guarantee!`;
      } else if (selectedPackId === 2) {
        savingsText.innerHTML = `⚡ Most Popular! You save <b>₹${totalSavings}</b> · Double the Freshness`;
      } else {
        savingsText.innerHTML = `👑 Best Value! You save <b>₹${totalSavings}</b> · Includes Free Air Shipping ✈️`;
      }''',
    '''if (selectedPackId === 1) {
        savingsText.innerHTML = `You save <b>₹${totalSavings}</b> today · Fresh Oven-Baked Dispatch Guarantee!`;
      } else if (selectedPackId === 2) {
        savingsText.innerHTML = `You save <b>₹${totalSavings}</b> today · Fresh Oven-Baked Dispatch Guarantee!`;
      }'''
)

# 5. Remove Oats from waitlist logic
content = content.replace("const chkOats = document.getElementById('vip-check-oats');", "")
content = content.replace("if (chkOats && chkOats.checked) selectedFlavours.push('Wholesome Oats');", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("main.js updated successfully!")
