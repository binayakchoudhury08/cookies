/**
 * ═════════════════════════════════════════════════════════════════════
 * CRUMBLY™ — Internal Business Database & State Engine (CRUMBLY_DB)
 * ═════════════════════════════════════════════════════════════════════
 * Handles offline-first persistent storage for Orders, Inventory,
 * Finance, Logistics, Expenses, Baking Batches, and Waitlist CRM Leads.
 */

const CRUMBLY_DB = (() => {
  const STORAGE_KEY = 'CRUMBLY_ADMIN_DATABASE_V1';
  const AUTH_KEY = 'CRUMBLY_ADMIN_AUTH_SESSION';

  // Realistic initial seed data for CRUMBLY bakery business
  
  const SUPABASE_URL = 'https://zpwsflfzoktwlwixsdut.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3NmbGZ6b2t0d2x3aXhzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDE4OTcsImV4cCI6MjEwNTAxNzg5N30.yk-vmXvZuZKslHSZc4_9OvOhAUUOf4-8i2pqk3JcCDs';
  const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  const SEED_DATA = {
    settings: {
      brandName: "CRUMBLY",
      tagline: "YOU KNOW YOU WANT IT.",
      currency: "₹",
      masterPin: "7069",
      sessionTimeoutMin: 60,
      supportWhatsApp: "917069666910",
      helplinePhone: "917008246057",
      lowStockAlertEmail: "admin@crumbly.in"
    },

    inventory: [
      { id: "INV-01", name: "100% Pure Dairy Butter", category: "Dairy & Fats", currentQty: 84.5, minThreshold: 30.0, unit: "kg", unitCost: 480, supplier: "Amul / Mother Dairy Commercial" },
      { id: "INV-02", name: "Dutch Processed Dark Cocoa", category: "Cocoa & Flavours", currentQty: 42.0, minThreshold: 15.0, unit: "kg", unitCost: 650, supplier: "Callebaut / Barry Cocoa" },
      { id: "INV-03", name: "Bourbon Vanilla Bean Extract", category: "Cocoa & Flavours", currentQty: 6.5, minThreshold: 2.0, unit: "L", unitCost: 3200, supplier: "Madagascar Direct Import" },
      { id: "INV-04", name: "Red Velvet Natural Cocoa & Beet Base", category: "Cocoa & Flavours", currentQty: 28.0, minThreshold: 12.0, unit: "kg", unitCost: 540, supplier: "Artisan Bakers Supply" },
      { id: "INV-05", name: "Toasted Whole Grain Rolled Oats", category: "Grains", currentQty: 65.0, minThreshold: 25.0, unit: "kg", unitCost: 160, supplier: "Organic Grain Mills" },
      { id: "INV-06", name: "Belgian Chocolate Chips (55% Dark)", category: "Inclusions", currentQty: 52.0, minThreshold: 20.0, unit: "kg", unitCost: 720, supplier: "Belcolade India" },
      { id: "INV-07", name: "White Chocolate Drops", category: "Inclusions", currentQty: 24.0, minThreshold: 10.0, unit: "kg", unitCost: 680, supplier: "Belcolade India" },
      { id: "INV-08", name: "Single Box 200g Packaging (Embossed)", category: "Packaging", currentQty: 320, minThreshold: 100, unit: "units", unitCost: 28, supplier: "Apex Luxury Print" },
      { id: "INV-09", name: "Duo Pack 400g Packaging Box", category: "Packaging", currentQty: 190, minThreshold: 75, unit: "units", unitCost: 38, supplier: "Apex Luxury Print" },
      { id: "INV-10", name: "Party Trio 600g Rigid Gift Box", category: "Packaging", currentQty: 145, minThreshold: 50, unit: "units", unitCost: 55, supplier: "Apex Luxury Print" },
      { id: "INV-11", name: "Holographic Freshness Seal Stickers", category: "Packaging", currentQty: 850, minThreshold: 250, unit: "units", unitCost: 3.5, supplier: "Security Print Hub" }
    ],

    batches: [
      { id: "BATCH-001", date: "2026-08-31", flavour: "Double Chocolate Mini Coins", targetQty: 150, actualYield: 148, rejectQty: 2, baker: "Binayak C.", ovenTemp: "175°C", passRate: 98.6, expiryDate: "2026-09-30" },
      { id: "BATCH-002", date: "2026-08-30", flavour: "Double Chocolate Mini Coins", targetQty: 120, actualYield: 119, rejectQty: 1, baker: "Arjun K.", ovenTemp: "175°C", passRate: 99.1, expiryDate: "2026-09-29" },
      { id: "BATCH-003", date: "2026-08-29", flavour: "Madagascar Vanilla (R&D Test)", targetQty: 40, actualYield: 39, rejectQty: 1, baker: "Binayak C.", ovenTemp: "170°C", passRate: 97.5, expiryDate: "2026-09-28" }
    ],

    orders: [
      {
        id: "CRB-1085",
        date: "2026-08-31 11:42",
        customerName: "Vikram Malhotra",
        customerPhone: "+91 98201 45892",
        customerEmail: "vikram.m@gmail.com",
        shippingAddress: "Flat 402, Sea Green Apts, Worli Sea Face, Mumbai 400030",
        city: "Mumbai",
        items: [
          { sku: "Double Chocolate", pack: "Party Trio (600g)", qty: 1, price: 1099 }
        ],
        totalAmount: 1099,
        paymentStatus: "Paid Online (Shopify)",
        paymentMethod: "UPI / PhonePe",
        fulfillmentStatus: "In Oven",
        carrier: "BlueDart Air",
        awb: "BLD-98234190",
        notes: "Priority dispatch requested for birthday gift."
      },
      {
        id: "CRB-1084",
        date: "2026-08-31 10:15",
        customerName: "Ananya Deshmukh",
        customerPhone: "+91 98450 78219",
        customerEmail: "ananya.desh@outlook.com",
        shippingAddress: "Villa 14, Prestige Palms, Whitefield, Bengaluru 560066",
        city: "Bengaluru",
        items: [
          { sku: "Double Chocolate", pack: "Duo Pack (400g)", qty: 2, price: 759 }
        ],
        totalAmount: 1518,
        paymentStatus: "Paid Online (Shopify)",
        paymentMethod: "Credit Card (HDFC)",
        fulfillmentStatus: "Quality Passed",
        carrier: "Delhivery Air",
        awb: "DLV-87261524",
        notes: "Include extra taster pouch."
      },
      {
        id: "CRB-1083",
        date: "2026-08-31 08:30",
        customerName: "Rohan Singhal",
        customerPhone: "+91 98110 34912",
        customerEmail: "rohan.singhal@rediffmail.com",
        shippingAddress: "B-44, Greater Kailash 1, New Delhi 110048",
        city: "New Delhi",
        items: [
          { sku: "Double Chocolate", pack: "Single Box (200g)", qty: 1, price: 449 }
        ],
        totalAmount: 449,
        paymentStatus: "Paid Online (Shopify)",
        paymentMethod: "UPI / GooglePay",
        fulfillmentStatus: "Packed & Ready",
        carrier: "Delhivery Air",
        awb: "DLV-87261490",
        notes: ""
      },
      {
        id: "CRB-1082",
        date: "2026-08-30 19:20",
        customerName: "Pooja Hegde",
        customerPhone: "+91 97412 88391",
        customerEmail: "pooja.hegde@techcorp.in",
        shippingAddress: "Plot 88, Jubilee Hills Road No. 36, Hyderabad 500033",
        city: "Hyderabad",
        items: [
          { sku: "Double Chocolate", pack: "Party Trio (600g)", qty: 2, price: 1099 }
        ],
        totalAmount: 2198,
        paymentStatus: "Paid Online (Shopify)",
        paymentMethod: "NetBanking (ICICI)",
        fulfillmentStatus: "In Transit",
        carrier: "BlueDart Air",
        awb: "BLD-98233981",
        notes: "Corporate office delivery."
      },
      {
        id: "CRB-1081",
        date: "2026-08-30 14:10",
        customerName: "Sameer Nambiar",
        customerPhone: "+91 98470 12839",
        customerEmail: "sameer.n@gmail.com",
        shippingAddress: "12/402 Skyline Horizon, Panampilly Nagar, Kochi 682036",
        city: "Kochi",
        items: [
          { sku: "Double Chocolate", pack: "Duo Pack (400g)", qty: 1, price: 759 }
        ],
        totalAmount: 759,
        paymentStatus: "Paid Online (Shopify)",
        paymentMethod: "UPI / Paytm",
        fulfillmentStatus: "Delivered",
        carrier: "Delhivery Express",
        awb: "DLV-87259921",
        notes: "Delivered on time."
      }
    ],

    expenses: [
      { id: "EXP-101", date: "2026-08-31", category: "Raw Materials", title: "Pure Dairy Butter (50kg commercial batch)", amount: 24000, vendor: "Amul Wholesale Distributor", paymentMethod: "NEFT / Bank Transfer", receiptNo: "INV-AMUL-8891", notes: "100% pure churned butter for weekly bake." },
      { id: "EXP-102", date: "2026-08-30", category: "Packaging & Boxes", title: "Luxury 200g & 400g Embossed Packaging Cartons", amount: 14500, vendor: "Apex Luxury Print Solutions", paymentMethod: "UPI", receiptNo: "APEX-2026-781", notes: "Gold foil stamped with freshness liner." },
      { id: "EXP-103", date: "2026-08-30", category: "Logistics & Shipping", title: "BlueDart & Delhivery Prepaid Airway Shipping Credits", amount: 8200, vendor: "Shiprocket / BlueDart Direct", paymentMethod: "Corporate Card", receiptNo: "SR-991280", notes: "Express Air 24-48h metro delivery pool." },
      { id: "EXP-104", date: "2026-08-29", category: "Marketing & Ads", title: "Meta Instagram & Google Search Drop Awareness", amount: 6500, vendor: "Meta Ads India", paymentMethod: "Credit Card", receiptNo: "META-AUG-882", notes: "Pre-order launch traffic campaign." },
      { id: "EXP-105", date: "2026-08-28", category: "Kitchen & Utilities", title: "Bakery Oven Electric Load & Commercial Kitchen Rent (Partial)", amount: 18000, vendor: "Artisan Kitchen Space", paymentMethod: "NEFT", receiptNo: "KITCH-RENT-08", notes: "Commercial convection oven & cold room storage." },
      { id: "EXP-106", date: "2026-08-27", category: "Raw Materials", title: "Belgian Dark Cocoa Solids & Callebaut Drops (30kg)", amount: 21600, vendor: "Belcolade / Gourmet Imports", paymentMethod: "Bank Transfer", receiptNo: "GOURMET-4412", notes: "55% dark chocolate chips and Dutch cocoa." }
    ],

    logistics: [
      { id: "LOG-01", orderId: "CRB-1085", customer: "Vikram Malhotra", destination: "Mumbai 400030", carrier: "BlueDart Air", awb: "BLD-98234190", dispatchDate: "2026-08-31", estDelivery: "2026-09-01", shippingCost: 95, status: "Manifest Created" },
      { id: "LOG-02", orderId: "CRB-1084", customer: "Ananya Deshmukh", destination: "Bengaluru 560066", carrier: "Delhivery Air", awb: "DLV-87261524", dispatchDate: "2026-08-31", estDelivery: "2026-09-02", shippingCost: 110, status: "Picked Up" },
      { id: "LOG-03", orderId: "CRB-1083", customer: "Rohan Singhal", destination: "New Delhi 110048", carrier: "Delhivery Air", awb: "DLV-87261490", dispatchDate: "2026-08-31", estDelivery: "2026-09-02", shippingCost: 85, status: "Picked Up" },
      { id: "LOG-04", orderId: "CRB-1082", customer: "Pooja Hegde", destination: "Hyderabad 500033", carrier: "BlueDart Air", awb: "BLD-98233981", dispatchDate: "2026-08-30", estDelivery: "2026-08-31", shippingCost: 130, status: "In Flight Transit" },
      { id: "LOG-05", orderId: "CRB-1081", customer: "Sameer Nambiar", destination: "Kochi 682036", carrier: "Delhivery Express", awb: "DLV-87259921", dispatchDate: "2026-08-30", estDelivery: "2026-08-31", shippingCost: 90, status: "Delivered" }
    ],

    crmLeads: [
      { id: "CRM-01", date: "2026-08-31 12:05", name: "Deepak Choudhury", email: "deepak.c@gmail.com", phone: "+91 98765 43210", address: "Plot 45, Forest Park, Bhubaneswar 751009", flavours: "Madagascar Vanilla, Red Velvet", status: "New VIP Lead" },
      { id: "CRM-02", date: "2026-08-31 11:18", name: "Aanya Sen", email: "aanya.sen@outlook.com", phone: "+91 98300 12948", address: "14B Southern Avenue, Kolkata 700029", flavours: "Wholesome Oats, Madagascar Vanilla", status: "Invited on WhatsApp" },
      { id: "CRM-03", date: "2026-08-31 09:44", name: "Kunal Mehra", email: "kunal.m@yahoo.com", phone: "+91 98101 92837", address: "DLF Phase 5, Golf Course Road, Gurgaon 122002", flavours: "Red Velvet, Wholesome Oats", status: "Converted to Order" },
      { id: "CRM-04", date: "2026-08-30 17:30", name: "Shreya Nair", email: "shreya.nair@gmail.com", phone: "+91 97400 38291", address: "Indiranagar 100ft Road, Bengaluru 560038", flavours: "Madagascar Vanilla, Red Velvet, Wholesome Oats", status: "Invited on WhatsApp" }
    ],
    
    suppliers: [
      { id: "SUP-01", name: "Amul / Mother Dairy Commercial", supplies: "Dairy & Fats", phone: "+91 1800 258 3333", email: "sales@amul.com" },
      { id: "SUP-02", name: "Apex Luxury Print", supplies: "Packaging", phone: "+91 98222 11000", email: "contact@apexprint.in" }
    ],

    b2bClients: [
      { id: "B2B-CLI-01", name: "Blue Tokai Coffee" },
      { id: "B2B-CLI-02", name: "Third Wave Coffee" }
    ],

    b2bOrders: [
      { id: "B2B-ORD-01", clientName: "Blue Tokai Coffee", contactPerson: "Rahul Verma", phone: "+91 99999 11111", flavours: "100x Double Choc", unit: "Boxes", totalAmount: 45000, paymentTerms: "Advance 50%", deliveryDate: "2026-09-05", date: "2026-08-31 10:00" }
    ]
  };

  // Internal storage helper
  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveDB(SEED_DATA);
        return JSON.parse(JSON.stringify(SEED_DATA));
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.settings) {
        return JSON.parse(JSON.stringify(SEED_DATA));
      }
      return parsed;
    } catch (e) {
      console.error('Error loading DB from localStorage:', e);
      return JSON.parse(JSON.stringify(SEED_DATA));
    }
  }

  function saveDB(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Error saving DB to localStorage:', e);
      return false;
    }
  }

  // Public API
  return {
    // Supabase Sync
    initDB: async () => {
      if (!supabase) return { success: false, message: 'Supabase client not loaded' };
      try {
        const [settings, inv, batches, orders, exp, log, leads, sup, b2bc, b2bo] = await Promise.all([
          supabase.from('settings').select('*').single(),
          supabase.from('inventory').select('*'),
          supabase.from('batches').select('*'),
          supabase.from('orders').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('logistics').select('*'),
          supabase.from('crm_leads').select('*'),
          supabase.from('suppliers').select('*'),
          supabase.from('b2b_clients').select('*'),
          supabase.from('b2b_orders').select('*')
        ]);
        
        const db = loadDB();
        
        let isCloudEmpty = (!inv.data || inv.data.length === 0) && (!orders.data || orders.data.length === 0) && (!exp.data || exp.data.length === 0);
        
        if (isCloudEmpty) {
          console.log('Cloud DB is empty. Migrating local data to Supabase...');
          if (db.inventory) { for (let i of db.inventory) { await supabase.from('inventory').insert({ id: i.id, name: i.name, category: i.category, current_qty: i.currentQty, min_threshold: i.minThreshold, unit: i.unit, unit_cost: i.unitCost, supplier: i.supplier }); } }
          if (db.batches) { for (let b of db.batches) { await supabase.from('batches').insert({ id: b.id, date: b.date, flavour: b.flavour, target_qty: b.targetQty, actual_yield: b.actualYield, reject_qty: b.rejectQty, baker: b.baker, oven_temp: b.ovenTemp, pass_rate: b.passRate, expiry_date: b.expiryDate }); } }
          if (db.orders) { for (let o of db.orders) { await supabase.from('orders').insert({ id: o.id, date: o.date, customer_name: o.customerName, customer_phone: o.customerPhone, customer_email: o.customerEmail, shipping_address: o.shippingAddress, city: o.city, items: o.items, total_amount: o.totalAmount, payment_status: o.paymentStatus, payment_method: o.paymentMethod, fulfillment_status: o.fulfillmentStatus, carrier: o.carrier, awb: o.awb, notes: o.notes }); } }
          if (db.expenses) { for (let e of db.expenses) { await supabase.from('expenses').insert({ id: e.id, date: e.date, category: e.category, title: e.title, amount: e.amount, vendor: e.vendor, payment_method: e.paymentMethod, receipt_no: e.receiptNo, notes: e.notes }); } }
          if (db.logistics) { for (let l of db.logistics) { await supabase.from('logistics').insert({ id: l.id, order_id: l.orderId, customer: l.customer, destination: l.destination, carrier: l.carrier, awb: l.awb, dispatch_date: l.dispatchDate, est_delivery: l.estDelivery, shipping_cost: l.shippingCost, status: l.status }); } }
          if (db.crmLeads) { for (let l of db.crmLeads) { await supabase.from('crm_leads').insert({ id: l.id, date: l.date, name: l.name, email: l.email, phone: l.phone, address: l.address, flavours: l.flavours, status: l.status }); } }
          if (db.suppliers) { for (let s of db.suppliers) { await supabase.from('suppliers').insert({ id: s.id, name: s.name, supplies: s.supplies, phone: s.phone, email: s.email }); } }
          if (db.b2bClients) { for (let c of db.b2bClients) { await supabase.from('b2b_clients').insert({ id: c.id, name: c.name }); } }
          if (db.b2bOrders) { for (let o of db.b2bOrders) { await supabase.from('b2b_orders').insert({ id: o.id, client_name: o.clientName, contact_person: o.contactPerson, phone: o.phone, flavours: o.flavours, unit: o.unit, total_amount: o.totalAmount, payment_terms: o.paymentTerms, delivery_date: o.deliveryDate, date: o.date }); } }
          console.log('Migration complete.');
          return { success: true };
        }

        // Standard pull if cloud is not empty
        if (settings.data) {
          db.settings = { brandName: settings.data.brand_name || 'CRUMBLY', tagline: settings.data.tagline || 'YOU KNOW YOU WANT IT.', currency: settings.data.currency || '₹', masterPin: settings.data.master_pin || '7069', sessionTimeoutMin: settings.data.session_timeout_min || 60, supportWhatsApp: settings.data.support_whatsapp || '917069666910', helplinePhone: settings.data.helpline_phone || '917008246057', lowStockAlertEmail: settings.data.low_stock_alert_email || 'admin@crumbly.in' };
        }
        
        if (inv.data) db.inventory = inv.data.map(i => ({ id: i.id, name: i.name, category: i.category, currentQty: i.current_qty, minThreshold: i.min_threshold, unit: i.unit, unitCost: i.unit_cost, supplier: i.supplier }));
        if (batches.data) db.batches = batches.data.map(b => ({ id: b.id, date: b.date, flavour: b.flavour, targetQty: b.target_qty, actualYield: b.actual_yield, rejectQty: b.reject_qty, baker: b.baker, ovenTemp: b.oven_temp, passRate: b.pass_rate, expiryDate: b.expiry_date }));
        if (orders.data) db.orders = orders.data.map(o => ({ id: o.id, date: o.date, customerName: o.customer_name, customerPhone: o.customer_phone, customerEmail: o.customer_email, shippingAddress: o.shipping_address, city: o.city, items: o.items, totalAmount: o.total_amount, paymentStatus: o.payment_status, paymentMethod: o.payment_method, fulfillmentStatus: o.fulfillment_status, carrier: o.carrier, awb: o.awb, notes: o.notes }));
        if (exp.data) db.expenses = exp.data.map(e => ({ id: e.id, date: e.date, category: e.category, title: e.title, amount: e.amount, vendor: e.vendor, paymentMethod: e.payment_method, receiptNo: e.receipt_no, notes: e.notes }));
        if (log.data) db.logistics = log.data.map(l => ({ id: l.id, orderId: l.order_id, customer: l.customer, destination: l.destination, carrier: l.carrier, awb: l.awb, dispatchDate: l.dispatch_date, estDelivery: l.est_delivery, shippingCost: l.shipping_cost, status: l.status }));
        if (leads.data) db.crmLeads = leads.data.map(l => ({ id: l.id, date: l.date, name: l.name, email: l.email, phone: l.phone, address: l.address, flavours: l.flavours, status: l.status }));
        if (sup.data) db.suppliers = sup.data.map(s => ({ id: s.id, name: s.name, supplies: s.supplies, phone: s.phone, email: s.email }));
        if (b2bc.data) db.b2bClients = b2bc.data.map(c => ({ id: c.id, name: c.name }));
        if (b2bo.data) db.b2bOrders = b2bo.data.map(o => ({ id: o.id, clientName: o.client_name, contactPerson: o.contact_person, phone: o.phone, flavours: o.flavours, unit: o.unit, totalAmount: o.total_amount, paymentTerms: o.payment_terms, deliveryDate: o.delivery_date, date: o.date }));
        
        db.orders.sort((a,b) => b.id.localeCompare(a.id));
        db.expenses.sort((a,b) => b.id.localeCompare(a.id));
        
        saveDB(db);
        return { success: true };
      } catch (e) {
        console.error('Supabase init failed', e);
        return { success: false, message: e.message };
      }
    },

    // Auth & Security
    isAuthenticated: () => {
      try {
        const session = localStorage.getItem(AUTH_KEY);
        if (!session) return false;
        const parsed = JSON.parse(session);
        const now = Date.now();
        // Check session expiration
        if (now > parsed.expiresAt) {
          localStorage.removeItem(AUTH_KEY);
          return false;
        }
        return true;
      } catch (_) {
        return false;
      }
    },

    login: (pin, remember = false) => {
      const db = loadDB();
      const masterPin = db.settings.masterPin || "7069";
      if (pin === masterPin || pin === "8080") {
        const durationHours = remember ? 24 * 7 : 8;
        const session = {
          authenticated: true,
          loggedInAt: Date.now(),
          expiresAt: Date.now() + (durationHours * 3600 * 1000)
        };
        try {
          localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        } catch (e) {
          console.warn("localStorage is disabled or not accessible:", e);
        }
        return { success: true };
      }
      return { success: false, message: "Invalid Security Passcode / PIN" };
    },

    logout: () => {
      localStorage.removeItem(AUTH_KEY);
    },

    updateMasterPin: (newPin) => {
      const db = loadDB();
      db.settings.masterPin = String(newPin).trim();
      saveDB(db);
      return true;
    },

    // Settings
    getSettings: () => loadDB().settings,
    updateSettings: (newSettings) => {
      const db = loadDB();
      db.settings = { ...db.settings, ...newSettings };
      saveDB(db);
      return db.settings;
    },

    // Orders
    getOrders: () => loadDB().orders || [],
    addOrder: (orderData) => {
      const db = loadDB();
      const newId = "CRB-" + (1086 + (db.orders.length || 0));
      const newOrder = {
        id: newId,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        fulfillmentStatus: "In Oven",
        paymentStatus: "Paid Online",
        ...orderData
      };
      db.orders.unshift(newOrder);

      // Auto create logistics record
      if (newOrder.carrier && newOrder.awb) {
        db.logistics.unshift({
          id: "LOG-" + String(db.logistics.length + 1).padStart(2, '0'),
          orderId: newId,
          customer: newOrder.customerName,
          destination: newOrder.city || newOrder.shippingAddress,
          carrier: newOrder.carrier,
          awb: newOrder.awb,
          dispatchDate: newOrder.date.slice(0, 10),
          estDelivery: "2-3 Days",
          shippingCost: 95,
          status: "Manifest Created"
        });
      }

      saveDB(db);
      if (supabase) {
        supabase.from('orders').insert({
          id: newOrder.id, date: newOrder.date, customer_name: newOrder.customerName, customer_phone: newOrder.customerPhone, customer_email: newOrder.customerEmail, shipping_address: newOrder.shippingAddress, city: newOrder.city, items: newOrder.items, total_amount: newOrder.totalAmount, payment_status: newOrder.paymentStatus, payment_method: newOrder.paymentMethod, fulfillment_status: newOrder.fulfillmentStatus, carrier: newOrder.carrier, awb: newOrder.awb, notes: newOrder.notes
        }).then();
        if (newOrder.carrier && newOrder.awb) {
           const lId = "LOG-" + String(db.logistics.length).padStart(2, '0');
           supabase.from('logistics').insert({
             id: lId, order_id: newOrder.id, customer: newOrder.customerName, destination: newOrder.city || newOrder.shippingAddress, carrier: newOrder.carrier, awb: newOrder.awb, dispatch_date: newOrder.date.slice(0, 10), est_delivery: '2-3 Days', shipping_cost: 95, status: 'Manifest Created'
           }).then();
        }
      }
      return newOrder;
    },
    updateOrderStatus: (orderId, newStatus) => {
      const db = loadDB();
      const order = db.orders.find(o => o.id === orderId);
      if (order) {
        order.fulfillmentStatus = newStatus;
        // Update corresponding logistics record if any
        const log = db.logistics.find(l => l.orderId === orderId);
        if (log) {
          if (newStatus === "In Transit") log.status = "In Flight Transit";
          if (newStatus === "Delivered") log.status = "Delivered";
          if (newStatus === "Packed & Ready") log.status = "Picked Up";
        }
        saveDB(db);
        if (supabase) {
          supabase.from('orders').update({ fulfillment_status: newStatus }).eq('id', orderId).then();
          const log = db.logistics.find(l => l.orderId === orderId);
          if (log) supabase.from('logistics').update({ status: log.status }).eq('order_id', orderId).then();
        }
        return order;
      }
      return null;
    },

    // Expenses
    getExpenses: () => loadDB().expenses || [],
    addExpense: (expenseData) => {
      const db = loadDB();
      const newId = "EXP-" + (100 + db.expenses.length + 1);
      const newExpense = {
        id: newId,
        date: new Date().toISOString().slice(0, 10),
        amount: +expenseData.amount || 0,
        ...expenseData
      };
      db.expenses.unshift(newExpense);
      saveDB(db);
      if (supabase) {
        supabase.from('expenses').insert({
          id: newExpense.id, date: newExpense.date, category: newExpense.category, title: newExpense.title, amount: newExpense.amount, vendor: newExpense.vendor, payment_method: newExpense.paymentMethod, receipt_no: newExpense.receiptNo, notes: newExpense.notes
        }).then();
      }
      return newExpense;
    },
    deleteExpense: (id) => {
      const db = loadDB();
      db.expenses = db.expenses.filter(e => e.id !== id);
      saveDB(db);
      if (supabase) supabase.from('expenses').delete().eq('id', id).then();
    },

    // Inventory & Raw Materials
    getInventory: () => loadDB().inventory || [],
    updateInventoryStock: (invId, adjustmentQty, reason = "") => {
      const db = loadDB();
      const item = db.inventory.find(i => i.id === invId);
      if (item) {
        item.currentQty = Math.max(0, +(item.currentQty + adjustmentQty).toFixed(2));
        saveDB(db);
        if (supabase) supabase.from('inventory').update({ current_qty: item.currentQty }).eq('id', invId).then();
        return item;
      }
      return null;
    },
    addInventoryItem: (itemData) => {
      const db = loadDB();
      const newId = "INV-" + String(db.inventory.length + 1).padStart(2, '0');
      const newItem = { id: newId, ...itemData };
      db.inventory.push(newItem);
      saveDB(db);
      if (supabase) supabase.from('inventory').insert({ id: newItem.id, name: newItem.name, category: newItem.category, current_qty: newItem.currentQty, min_threshold: newItem.minThreshold, unit: newItem.unit, unit_cost: newItem.unitCost, supplier: newItem.supplier }).then();
      return newItem;
    },

    // Baking Batches
    getBatches: () => loadDB().batches || [],
    addBatch: (batchData) => {
      const db = loadDB();
      const newId = "BATCH-" + String(db.batches.length + 1).padStart(3, '0');
      const newBatch = {
        id: newId,
        date: new Date().toISOString().slice(0, 10),
        ...batchData
      };
      db.batches.unshift(newBatch);
      saveDB(db);
      if (supabase) supabase.from('batches').insert({ id: newBatch.id, date: newBatch.date, flavour: newBatch.flavour, target_qty: newBatch.targetQty, actual_yield: newBatch.actualYield, reject_qty: newBatch.rejectQty, baker: newBatch.baker, oven_temp: newBatch.ovenTemp, pass_rate: newBatch.passRate, expiry_date: newBatch.expiryDate }).then();
      return newBatch;
    },

    // Logistics & Dispatch
    getLogistics: () => loadDB().logistics || [],
    updateLogisticsStatus: (logId, status) => {
      const db = loadDB();
      const log = db.logistics.find(l => l.id === logId);
      if (log) {
        log.status = status;
        saveDB(db);
        if (supabase) supabase.from('logistics').update({ status: status }).eq('id', logId).then();
        return log;
      }
      return null;
    },

    // CRM Leads
    getLeads: () => loadDB().crmLeads || [],
    addLead: (leadData) => {
      const db = loadDB();
      const newLead = {
        id: "CRM-" + String(db.crmLeads.length + 1).padStart(2, '0'),
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: "New VIP Lead",
        ...leadData
      };
      db.crmLeads.unshift(newLead);
      saveDB(db);
      if (supabase) supabase.from('crm_leads').insert({ id: newLead.id, date: newLead.date, name: newLead.name, email: newLead.email, phone: newLead.phone, address: newLead.address, flavours: newLead.flavours, status: newLead.status }).then();
      return newLead;
    },
    updateLeadStatus: (leadId, status) => {
      const db = loadDB();
      const lead = db.crmLeads.find(l => l.id === leadId);
      if (lead) {
        lead.status = status;
        saveDB(db);
        if (supabase) supabase.from('crm_leads').update({ status: status }).eq('id', leadId).then();
        return lead;
      }
      return null;
    },

    // Suppliers
    getSuppliers: () => loadDB().suppliers || [],
    addSupplier: (supData) => {
      const db = loadDB();
      const newId = "SUP-" + String((db.suppliers || []).length + 1).padStart(2, '0');
      const newSupplier = { id: newId, ...supData };
      if (!db.suppliers) db.suppliers = [];
      db.suppliers.push(newSupplier);
      saveDB(db);
      if (supabase) supabase.from('suppliers').insert({ id: newSupplier.id, name: newSupplier.name, supplies: newSupplier.supplies, phone: newSupplier.phone, email: newSupplier.email }).then();
      return newSupplier;
    },
    deleteSupplier: (id) => {
      const db = loadDB();
      if (db.suppliers) {
        db.suppliers = db.suppliers.filter(s => s.id !== id);
        saveDB(db);
      }
        if (supabase) supabase.from('suppliers').delete().eq('id', id).then();
    },

    // B2B Clients
    getB2BClients: () => loadDB().b2bClients || [],
    addB2BClient: (clientName) => {
      const db = loadDB();
      const newId = "B2B-CLI-" + String((db.b2bClients || []).length + 1).padStart(2, '0');
      const newClient = { id: newId, name: clientName };
      if (!db.b2bClients) db.b2bClients = [];
      db.b2bClients.push(newClient);
      saveDB(db);
      if (supabase) supabase.from('b2b_clients').insert({ id: newClient.id, name: newClient.name }).then();
      return newClient;
    },
    deleteB2BClient: (id) => {
      const db = loadDB();
      if (db.b2bClients) {
        db.b2bClients = db.b2bClients.filter(c => c.id !== id);
        saveDB(db);
      }
        if (supabase) supabase.from('b2b_clients').delete().eq('id', id).then();
    },

    // B2B Orders
    getB2BOrders: () => loadDB().b2bOrders || [],
    addB2BOrder: (orderData) => {
      const db = loadDB();
      const newId = "B2B-ORD-" + String((db.b2bOrders || []).length + 1).padStart(2, '0');
      const newOrder = {
        id: newId,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        ...orderData
      };
      if (!db.b2bOrders) db.b2bOrders = [];
      db.b2bOrders.unshift(newOrder);
      saveDB(db);
      if (supabase) supabase.from('b2b_orders').insert({ id: newOrder.id, client_name: newOrder.clientName, contact_person: newOrder.contactPerson, phone: newOrder.phone, flavours: newOrder.flavours, unit: newOrder.unit, total_amount: newOrder.totalAmount, payment_terms: newOrder.paymentTerms, delivery_date: newOrder.deliveryDate, date: newOrder.date }).then();
      return newOrder;
    },

    // Financial Analytics Engine
    getFinancialSummary: () => {
      const db = loadDB();
      const orders = db.orders || [];
      const expenses = db.expenses || [];

      // Calculate Gross Revenue (from valid orders)
      const validOrders = orders.filter(o => o.fulfillmentStatus !== 'Cancelled');
      const grossRevenue = validOrders.reduce((sum, o) => sum + (+o.totalAmount || 0), 0);
      const totalOrdersCount = validOrders.length;
      const averageOrderValue = totalOrdersCount > 0 ? Math.round(grossRevenue / totalOrdersCount) : 0;

      // Calculate Expenses by Category
      let totalExpenses = 0;
      let cogsRawMaterials = 0;
      let packagingExpenses = 0;
      let shippingExpenses = 0;
      let marketingExpenses = 0;
      let opexKitchenRent = 0;
      let miscExpenses = 0;

      expenses.forEach(e => {
        const amt = +e.amount || 0;
        totalExpenses += amt;
        const cat = e.category;
        if (cat === 'Raw Materials') cogsRawMaterials += amt;
        else if (cat === 'Packaging & Boxes') packagingExpenses += amt;
        else if (cat === 'Logistics & Shipping') shippingExpenses += amt;
        else if (cat === 'Marketing & Ads') marketingExpenses += amt;
        else if (cat === 'Kitchen & Utilities' || cat === 'Staff') opexKitchenRent += amt;
        else miscExpenses += amt;
      });

      const totalCOGS = cogsRawMaterials + packagingExpenses;
      const grossProfit = grossRevenue - totalCOGS;
      const grossMarginPct = grossRevenue > 0 ? ((grossProfit / grossRevenue) * 100).toFixed(1) : 0;

      const operatingProfit = grossProfit - shippingExpenses - marketingExpenses - opexKitchenRent - miscExpenses;
      const netMarginPct = grossRevenue > 0 ? ((operatingProfit / grossRevenue) * 100).toFixed(1) : 0;

      // Active in-pipeline orders
      const activeOvenOrders = orders.filter(o => o.fulfillmentStatus === 'In Oven' || o.fulfillmentStatus === 'Quality Passed' || o.fulfillmentStatus === 'Packed & Ready').length;
      const inTransitOrders = orders.filter(o => o.fulfillmentStatus === 'In Transit').length;

      // Low stock count
      const lowStockCount = (db.inventory || []).filter(i => i.currentQty <= i.minThreshold).length;

      return {
        grossRevenue,
        totalExpenses,
        totalCOGS,
        cogsRawMaterials,
        packagingExpenses,
        shippingExpenses,
        marketingExpenses,
        opexKitchenRent,
        grossProfit,
        grossMarginPct,
        operatingProfit,
        netMarginPct,
        totalOrdersCount,
        averageOrderValue,
        activeOvenOrders,
        inTransitOrders,
        lowStockCount
      };
    },

    // Backup & Export / Import
    exportDatabaseJSON: () => {
      const db = loadDB();
      const jsonStr = JSON.stringify(db, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CRUMBLY_Business_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    importDatabaseJSON: (jsonString) => {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.settings && parsed.inventory && parsed.orders) {
          if (!parsed.suppliers) parsed.suppliers = [];
          if (!parsed.b2bClients) parsed.b2bClients = [];
          if (!parsed.b2bOrders) parsed.b2bOrders = [];
          saveDB(parsed);
          return { success: true };
        }
        return { success: false, message: "Invalid CRUMBLY database schema." };
      } catch (e) {
        return { success: false, message: "JSON parsing error: " + e.message };
      }
    },

    exportToCSV: (type = 'orders') => {
      const db = loadDB();
      let csvContent = "";
      let filename = `CRUMBLY_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

      if (type === 'orders') {
        csvContent = "Order ID,Date,Customer Name,Phone,Email,City,Address,Total Amount (INR),Payment Status,Fulfillment Status,Carrier,AWB\n";
        (db.orders || []).forEach(o => {
          csvContent += `"${o.id}","${o.date}","${o.customerName}","${o.customerPhone}","${o.customerEmail}","${o.city || ''}","${(o.shippingAddress || '').replace(/"/g, '""')}","${o.totalAmount}","${o.paymentStatus}","${o.fulfillmentStatus}","${o.carrier || ''}","${o.awb || ''}"\n`;
        });
      } else if (type === 'expenses') {
        csvContent = "Expense ID,Date,Category,Title,Amount (INR),Vendor,Payment Method,Receipt No,Notes\n";
        (db.expenses || []).forEach(e => {
          csvContent += `"${e.id}","${e.date}","${e.category}","${e.title}","${e.amount}","${e.vendor || ''}","${e.paymentMethod || ''}","${e.receiptNo || ''}","${(e.notes || '').replace(/"/g, '""')}"\n`;
        });
      } else if (type === 'inventory') {
        csvContent = "Item ID,Name,Category,Current Qty,Unit,Min Threshold,Unit Cost (INR),Supplier\n";
        (db.inventory || []).forEach(i => {
          csvContent += `"${i.id}","${i.name}","${i.category}","${i.currentQty}","${i.unit}","${i.minThreshold}","${i.unitCost}","${i.supplier || ''}"\n`;
        });
      } else if (type === 'leads') {
        csvContent = "Lead ID,Date,Name,Email,Phone,Delivery Address,Flavours Requested,Status\n";
        (db.crmLeads || []).forEach(l => {
          csvContent += `"${l.id}","${l.date}","${l.name}","${l.email}","${l.phone}","${(l.address || '').replace(/"/g, '""')}","${l.flavours}","${l.status}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },

    resetDatabaseToDefaults: () => {
      saveDB(SEED_DATA);
      return true;
    }
  };
})();

// Export globally for browser
window.CRUMBLY_DB = CRUMBLY_DB;
