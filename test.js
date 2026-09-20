const check = async () => {
  const r = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'api1@crumbly.com', password: '9zP0E*qzE9NTO$EBYWmBu*%yeW&oqe!C' })
  });
  const d = await r.json();
  console.log("Token exists?", !!d.token);
  if (d.token) {
    const r2 = await fetch('https://apiv2.shiprocket.in/v1/external/orders/show/1594405741', {
      headers: { 'Authorization': 'Bearer ' + d.token }
    });
    const t = await r2.json();
    console.log("Order Data status:", t.status_code || "OK");
    require('fs').writeFileSync('order_dump.json', JSON.stringify(t, null, 2));
  }
};
check().catch(console.error);
