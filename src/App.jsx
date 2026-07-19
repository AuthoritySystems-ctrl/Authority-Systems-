import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://eysjofloowkuzpivxcpx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5c2pvZmxvb3drdXpwaXZ4Y3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTA2MzEsImV4cCI6MjA5ODI2NjYzMX0.VEtOdjcY1M5TTnEkw6MLA526FxM0iMNtilkzg4SSZB0"
);

import { useState, useCallback, useEffect, useRef } from "react";

const tableToRow = (t) => ({
  id: t.id, status: t.status, guests: t.guests, waiter_id: t.waiterId,
  order_data: t.order, order_sent_at: t.orderSentAt, opened_at: t.openedAt,
  reservation: t.reservation, is_takeaway: t.isTakeaway,
  takeaway_number: t.takeawayNumber, customer_name: t.customerName || null,
  opened_ts: t.openedTs || null,
  kitchen_ready_at: t.kitchenReadyAt || null, bar_ready_at: t.barReadyAt || null,
  order_sent_ts: t.orderSentTs || null,
});
const rowToTable = (r) => ({
  id: r.id, status: r.status, guests: r.guests, waiterId: r.waiter_id,
  order: r.order_data || [], orderSentAt: r.order_sent_at, openedAt: r.opened_at,
  reservation: r.reservation, isTakeaway: r.is_takeaway,
  takeawayNumber: r.takeaway_number, customerName: r.customer_name,
  openedTs: r.opened_ts || null,
  kitchenReadyAt: r.kitchen_ready_at || null, barReadyAt: r.bar_ready_at || null,
  orderSentTs: r.order_sent_ts || null,
});
const menuToRow = (m) => ({ id: m.id, name: m.name, category: m.category, sub_category: m.subCategory || null, price: m.price, stock: m.stock, has_sides: m.hasSides, sides_required: m.sidesRequired });
const rowToMenu = (r) => ({ id: r.id, name: r.name, category: r.category, subCategory: r.sub_category || "", price: r.price, stock: r.stock, hasSides: r.has_sides, sidesRequired: r.sides_required });
const sideToRow = (s) => ({ id: s.id, name: s.name, stock: s.stock });
const rowToSide = (r) => ({ id: r.id, name: r.name, stock: r.stock });

const C = {
  purple: "#5C0F4E", purpleDark: "#3D0A34", purpleLight: "#7A1A68",
  gold: "#D4A017", goldLight: "#E8B830", goldPale: "#F5D97A",
  white: "#FFFFFF", gray300: "#C9B8B2", gray500: "#8A7570",
  red: "#C0392B", redLight: "#E74C3C", green: "#1E8449",
  greenLight: "#27AE60", orange: "#D35400", blue: "#1A5276",
  teal: "#0E6655",
};

const SIDES = [
  { id: "s1", name: "Chips / Fries", stock: 12 },
  { id: "s2", name: "Mashed Potato", stock: 6 },
  { id: "s3", name: "Steamed Rice", stock: 10 },
  { id: "s4", name: "Garden Salad", stock: 4 },
  { id: "s5", name: "Coleslaw", stock: 0 },
  { id: "s6", name: "Roasted Veg", stock: 2 },
];

const INITIAL_MENU = [
  { id: 1, name: "Chicken Schnitzel", category: "Mains", price: 13.5, stock: 8, hasSides: true, sidesRequired: 2 },
  { id: 2, name: "Beef Burger", category: "Mains", price: 10.0, stock: 0, hasSides: true, sidesRequired: 1 },
  { id: 3, name: "Grilled Salmon", category: "Mains", price: 15.0, stock: 5, hasSides: true, sidesRequired: 2 },
  { id: 4, name: "Pasta Carbonara", category: "Mains", price: 11.0, stock: 5, hasSides: false, sidesRequired: 0 },
  { id: 5, name: "Caesar Salad", category: "Starters", price: 7.5, stock: 3, hasSides: false, sidesRequired: 0 },
  { id: 6, name: "Garlic Bread", category: "Starters", price: 4.0, stock: 15, hasSides: false, sidesRequired: 0 },
  { id: 7, name: "Soup of the Day", category: "Starters", price: 5.5, stock: 7, hasSides: false, sidesRequired: 0 },
  { id: 8, name: "Bruschetta", category: "Starters", price: 6.0, stock: 0, hasSides: false, sidesRequired: 0 },
  { id: 9, name: "Tiramisu", category: "Desserts", price: 6.0, stock: 2, hasSides: false, sidesRequired: 0 },
  { id: 10, name: "Cheesecake", category: "Desserts", price: 6.5, stock: 4, hasSides: false, sidesRequired: 0 },
  { id: 11, name: "Chocolate Fondant", category: "Desserts", price: 7.0, stock: 0, hasSides: false, sidesRequired: 0 },
  { id: 12, name: "Coca Cola", category: "Drinks", price: 2.5, stock: 20, hasSides: false, sidesRequired: 0 },
  { id: 13, name: "Orange Juice", category: "Drinks", price: 3.0, stock: 12, hasSides: false, sidesRequired: 0 },
  { id: 14, name: "Sparkling Water", category: "Drinks", price: 2.0, stock: 18, hasSides: false, sidesRequired: 0 },
  { id: 15, name: "House Wine (Glass)", category: "Drinks", price: 5.5, stock: 8, hasSides: false, sidesRequired: 0 },
];

const INITIAL_TABLES = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1, status: "free", guests: 0, waiterId: null,
  order: [], orderSentAt: null, openedAt: null, reservation: null,
  isTakeaway: false, takeawayNumber: null,
}));

const STAFF = [
  { id: "r1", name: "Chipo", role: "receptionist", pin: "1111" },
  { id: "w1", name: "Amara", role: "waiter", pin: "1234" },
  { id: "w2", name: "Tendai", role: "waiter", pin: "2345" },
  { id: "k1", name: "Chef Moyo", role: "kitchen", pin: "3456" },
  { id: "lc1", name: "Tapiwa", role: "line_chef", pin: "7890" },
  { id: "b1", name: "Kuda", role: "bar", pin: "6789" },
  { id: "c1", name: "Rudo", role: "cashier", pin: "4567" },
  { id: "st1", name: "Farai", role: "stock", pin: "5678" },
  { id: "m1", name: "Manager", role: "manager", pin: "0000" },
];

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const stockColor = (s) => s === 0 ? C.red : s <= 3 ? C.orange : C.green;
const orderTotal = (order) => order.reduce((s, o) => s + o.price * o.qty, 0);
const CATEGORIES = ["Starters", "Mains", "Desserts", "Drinks"];
const bufToB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64ToBuf = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
const orderAgeColor = (sentTs) => {
  if (!sentTs) return null;
  const mins = (Date.now() - sentTs) / 60000;
  if (mins >= 30) return "#C0392B";
  if (mins >= 15) return "#D4A017";
  return null;
};
const orderAgeMins = (sentTs) => sentTs ? Math.floor((Date.now() - sentTs) / 60000) : null;

const Logo = ({ size = 32 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: size, height: size, background: C.gold, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: size * 0.55, color: C.purple, fontFamily: "serif", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>A</div>
    <div>
      <div style={{ fontWeight: 800, fontSize: size * 0.52, color: C.gold, letterSpacing: 2, fontFamily: "serif" }}>AUTHORITY</div>
      <div style={{ fontSize: size * 0.27, color: C.goldPale, letterSpacing: 1 }}>Know Your Worth</div>
    </div>
  </div>
);

const Btn = ({ children, onClick, color = C.gold, textColor = C.purple, style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#444" : color, color: disabled ? "#888" : textColor, border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.4, ...style }}>{children}</button>
);

const Notification = ({ msg, onClose }) => (
  <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: C.gold, color: C.purple, borderRadius: 10, padding: "12px 20px", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 12, maxWidth: 340, width: "90%" }}>
    <span>🔔 {msg}</span>
    <span onClick={onClose} style={{ cursor: "pointer", fontWeight: 900, marginLeft: "auto" }}>x</span>
  </div>
);

const TopBar = ({ user }) => (
  <div style={{ background: C.purple, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
    <Logo size={26} />
    <div style={{ textAlign: "right" }}>
      <div style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{user.name}</div>
      <div style={{ color: C.goldPale, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{user.role}</div>
    </div>
  </div>
);

const PinLogin = ({ onLogin }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [hasBiometric, setHasBiometric] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  useEffect(() => {
    try {
      setHasBiometric(!!localStorage.getItem("authorityBiometric"));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      const staff = STAFF.find(s => s.pin === pin);
      if (staff) { onLogin(staff); setPin(""); }
      else { setError("Wrong PIN"); setTimeout(() => setPin(""), 400); }
    } else {
      setError("");
    }
  }, [pin]);

  const useBiometric = async () => {
    setBioBusy(true);
    setError("");
    try {
      const stored = JSON.parse(localStorage.getItem("authorityBiometric"));
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ id: b64ToBuf(stored.credentialId), type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      if (assertion) {
        const staff = STAFF.find(s => s.id === stored.staffId);
        if (staff) onLogin(staff);
        else setError("Fingerprint not linked to a known staff member");
      }
    } catch (e) {
      setError("Fingerprint login failed — use PIN instead");
    }
    setBioBusy(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 28 }}>
      <Logo size={44} />
      <div style={{ width: "100%", maxWidth: 320 }}>
        <p style={{ color: C.goldPale, textAlign: "center", marginBottom: 14, fontSize: 13 }}>Enter your PIN</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 42, height: 42, borderRadius: 8, background: C.purple, border: `2px solid ${pin.length > i ? C.gold : C.purpleLight}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20, fontWeight: 900 }}>
              {pin.length > i ? "●" : ""}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 230, margin: "0 auto 10px" }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
            <button key={i} onClick={() => { if (k === "⌫") setPin(p => p.slice(0,-1)); else if (k !== "" && pin.length < 4) setPin(p => p + k); }} style={{ height: 50, borderRadius: 10, border: k === "" ? "none" : `1px solid ${C.purpleLight}`, background: k === "" ? "transparent" : C.purple, color: C.gold, fontSize: 20, fontWeight: 700, cursor: k === "" ? "default" : "pointer" }}>{k}</button>
          ))}
        </div>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <button onClick={() => setPin("")} style={{ background: "none", border: "none", color: C.goldPale, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Clear</button>
        </div>
        {hasBiometric && (
          <Btn onClick={useBiometric} disabled={bioBusy} color={C.purpleLight} textColor={C.goldPale} style={{ width: "100%", marginBottom: 8 }}>
            {bioBusy ? "Checking fingerprint..." : "👆 Use Fingerprint"}
          </Btn>
        )}
        {error && <p style={{ color: C.redLight, textAlign: "center", fontSize: 12 }}>{error}</p>}
      </div>
    </div>
  );
};

const ClockInScreen = ({ staff, onClockIn, onCancel }) => {
  const [supported, setSupported] = useState(false);
  const [bioStatus, setBioStatus] = useState("idle");

  useEffect(() => {
    (async () => {
      try {
        if (window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
          setSupported(true);
        }
      } catch (e) {}
    })();
  }, []);

  const enableBiometric = async () => {
    setBioStatus("working");
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Authority Systems" },
          user: { id: new TextEncoder().encode(staff.id), name: staff.name, displayName: staff.name },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
          attestation: "none",
        },
      });
      if (cred) {
        localStorage.setItem("authorityBiometric", JSON.stringify({ credentialId: bufToB64(cred.rawId), staffId: staff.id }));
        setBioStatus("done");
      }
    } catch (e) {
      setBioStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 24 }}>
      <Logo size={44} />
      <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
        <p style={{ color: C.goldPale, fontSize: 14, marginBottom: 4 }}>Welcome back,</p>
        <h2 style={{ color: C.gold, margin: "0 0 4px", fontSize: 22 }}>{staff.name}</h2>
        <p style={{ color: C.gray300, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 28 }}>{staff.role}</p>
        <Btn onClick={onClockIn} style={{ width: "100%", padding: "16px" }}>🕐 Start My Shift</Btn>
        {supported && bioStatus !== "done" && (
          <button onClick={enableBiometric} disabled={bioStatus === "working"} style={{ background: "none", border: `1px solid ${C.purpleLight}`, color: C.goldPale, fontSize: 12, marginTop: 14, padding: "10px 12px", borderRadius: 8, cursor: "pointer", width: "100%" }}>
            {bioStatus === "working" ? "Follow the prompt..." : bioStatus === "error" ? "Try Fingerprint Again" : "👆 Enable Fingerprint Login on This Device"}
          </button>
        )}
        {bioStatus === "done" && <p style={{ color: C.greenLight, fontSize: 12, marginTop: 12 }}>✓ Fingerprint enabled for next time</p>}
        <button onClick={onCancel} style={{ background: "none", border: "none", color: C.gray500, fontSize: 12, marginTop: 16, cursor: "pointer" }}>Not you? Go back</button>
      </div>
    </div>
  );
};

const ClockOutSummaryScreen = ({ data, onDone }) => {
  const fmtTime = (iso) => iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const roleLabel = { waiter: "Waiter", cashier: "Cashier", bar: "Bar", stock: "Stock", kitchen: "Head Chef", line_chef: "Line Chef", manager: "Manager", receptionist: "Receptionist" }[data.role] || data.role;

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 380, background: C.purple, borderRadius: 16, padding: 24, border: `2px solid ${C.gold}`, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 30 }}>✅</div>
          <h2 style={{ color: C.gold, margin: "8px 0 2px" }}>Shift Complete</h2>
          <div style={{ color: C.goldPale, fontSize: 13 }}>{data.name} · {roleLabel}</div>
        </div>
        <div style={{ background: C.purpleDark, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 4 }}>Clocked in: <span style={{ color: C.gold, fontWeight: 700 }}>{fmtTime(data.clockIn)}</span></div>
          <div style={{ color: C.goldPale, fontSize: 12 }}>Clocked out: <span style={{ color: C.gold, fontWeight: 700 }}>{fmtTime(data.clockOut)}</span></div>
        </div>

        {(data.role === "waiter" || data.role === "manager") && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>Tables served</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.tablesServed || 0}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>Food items sold</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.food || 0}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>Drink items sold</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.drinks || 0}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: C.goldPale, fontSize: 13, fontWeight: 700 }}>Total items sold</span><span style={{ color: C.greenLight, fontWeight: 800 }}>{data.total || 0}</span></div>
          </div>
        )}

        {data.role === "cashier" && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>Tables closed</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.tablesClosed || 0}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>💵 Cash</span><span style={{ color: C.gold, fontWeight: 700 }}>{fmt(data.cash || 0)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>💳 Card/Tap</span><span style={{ color: C.gold, fontWeight: 700 }}>{fmt(data.card || 0)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>📱 Mobile</span><span style={{ color: C.gold, fontWeight: 700 }}>{fmt(data.mobile || 0)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: C.goldPale, fontSize: 13, fontWeight: 700 }}>Total revenue</span><span style={{ color: C.greenLight, fontWeight: 800 }}>{fmt(data.total || 0)}</span></div>
          </div>
        )}

        {data.role === "bar" && (
          <div style={{ marginBottom: 10 }}>
            {(data.items || []).length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12, padding: "8px 0" }}>No drinks served this shift</div>
            ) : (data.items || []).map(([name, qty]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>{name}</span><span style={{ color: C.gold, fontWeight: 700 }}>{qty}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: C.goldPale, fontSize: 13, fontWeight: 700 }}>Total drinks served</span><span style={{ color: C.greenLight, fontWeight: 800 }}>{data.total || 0}</span></div>
          </div>
        )}

        {data.role === "stock" && (
          <div style={{ marginBottom: 10 }}>
            {(data.items || []).length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12, padding: "8px 0" }}>No stock updates this shift</div>
            ) : (data.items || []).map(([name, info]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}>
                <span style={{ color: C.goldPale, fontSize: 13 }}>{name} <span style={{ color: C.gray500, fontSize: 10 }}>({info.category})</span></span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{info.stock}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: C.goldPale, fontSize: 13, fontWeight: 700 }}>Total updates sent</span><span style={{ color: C.greenLight, fontWeight: 800 }}>{data.updates || 0}</span></div>
          </div>
        )}

        {(data.role === "kitchen" || data.role === "line_chef") && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.purpleLight}` }}><span style={{ color: C.goldPale, fontSize: 13 }}>Orders completed</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.ordersCompleted || 0}</span></div>
            {data.role === "kitchen" && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}><span style={{ color: C.goldPale, fontSize: 13 }}>Stock updates made</span><span style={{ color: C.gold, fontWeight: 700 }}>{data.stockUpdates || 0}</span></div>
            )}
          </div>
        )}

        <p style={{ color: C.gray500, fontSize: 11, textAlign: "center", margin: "12px 0 18px" }}>This summary is view-only. If something looks wrong, let your manager know.</p>
        <Btn onClick={onDone} style={{ width: "100%" }}>Done</Btn>
      </div>
    </div>
  );
};

const SidesPicker = ({ item, sides, onConfirm, onCancel }) => {
  const [chosen, setChosen] = useState([]);
  const required = item.sidesRequired;
  const toggle = (id) => {
    if (sides.find(s => s.id === id)?.stock === 0) return;
    setChosen(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= required ? [...prev.slice(1), id] : [...prev, id]);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: C.purpleDark, borderRadius: "20px 20px 0 0", padding: 20, width: "100%", maxWidth: 480, border: `2px solid ${C.gold}`, borderBottom: "none" }}>
        <div style={{ color: C.gold, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{item.name}</div>
        <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 14 }}>Choose {required} side{required > 1 ? "s" : ""} — {chosen.length}/{required} selected</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {sides.map(side => {
            const out = side.stock === 0;
            const low = side.stock > 0 && side.stock <= 3;
            const picked = chosen.includes(side.id);
            return (
              <button key={side.id} onClick={() => toggle(side.id)} disabled={out} style={{ background: picked ? C.gold : out ? "#1a0a18" : C.purple, color: picked ? C.purple : out ? C.gray500 : C.goldPale, border: `2px solid ${picked ? C.gold : out ? C.red : low ? C.orange : C.purpleLight}`, borderRadius: 10, padding: "12px 14px", cursor: out ? "not-allowed" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{side.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: out ? C.red : low ? C.orange : "transparent", color: out || low ? C.white : picked ? C.gold : "transparent", padding: out || low ? "2px 8px" : 0, borderRadius: 8 }}>
                  {out ? "OUT OF STOCK" : low ? `Only ${side.stock} left` : picked ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onCancel} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={() => onConfirm(chosen)} disabled={chosen.length < required} style={{ flex: 1 }}>Add to Order →</Btn>
        </div>
      </div>
    </div>
  );
};

const OpenTableModal = ({ tableId, onOpen, onCancel }) => {
  const [guests, setGuests] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.purple, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320, border: `2px solid ${C.gold}` }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px" }}>Open Table {tableId}</h3>
        <p style={{ color: C.goldPale, fontSize: 13, marginBottom: 10 }}>Guests</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 18 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => setGuests(String(n))} style={{ height: 42, borderRadius: 8, border: `2px solid ${guests == n ? C.gold : C.purpleLight}`, background: guests == n ? C.gold : "transparent", color: guests == n ? C.purple : C.goldPale, fontWeight: 700, cursor: "pointer" }}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onCancel} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={() => onOpen(guests)} disabled={!guests} style={{ flex: 1 }}>Open →</Btn>
        </div>
      </div>
    </div>
  );
};

const TakeawayModal = ({ onConfirm, onCancel, existingCount }) => {
  const [name, setName] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: C.purple, borderRadius: 16, padding: 24, width: "100%", maxWidth: 320, border: `2px solid ${C.teal}` }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>🥡</div>
        <h3 style={{ color: C.gold, margin: "0 0 6px", textAlign: "center" }}>New Takeaway Order</h3>
        <p style={{ color: C.goldPale, fontSize: 13, marginBottom: 16, textAlign: "center" }}>TK{existingCount + 1}</p>
        <input placeholder="Customer name (optional)" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 18, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={onCancel} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={() => onConfirm(name || `TK${existingCount + 1}`)} color={C.teal} textColor={C.white} style={{ flex: 1 }}>Start Order →</Btn>
        </div>
      </div>
    </div>
  );
};

const OrderPanel = ({ activeTable, setActiveTable, tables, setTables, menu, sides, setMenu, setSides, userId, addNotification, onBack, showBillButton = true }) => {
  const [selectedCat, setSelectedCat] = useState("Starters");
  const [openGroup, setOpenGroup] = useState(null);
  const changeCat = (cat) => { setSelectedCat(cat); setOpenGroup(null); };
  const [sidesPicker, setSidesPicker] = useState(null);

  const syncActive = (tableId, updater) => {
    setTables(prev => prev.map(t => t.id === tableId ? updater(t) : t));
    setActiveTable(prev => prev ? updater(prev) : prev);
  };

  const addItem = (item) => {
    if (item.stock === 0) return;
    if (item.hasSides) { setSidesPicker(item); return; }
    syncActive(activeTable.id, t => {
      const existing = t.order.find(o => o.id === item.id && !o.sides && !o.committed);
      return { ...t, order: existing ? t.order.map(o => (o === existing) ? { ...o, qty: o.qty + 1 } : o) : [...t.order, { ...item, qty: 1, sides: null, committed: false, orderKey: Date.now() + Math.random() }] };
    });
  };

  const confirmSides = (ids) => {
    const item = sidesPicker;
    const chosenSides = ids.map(id => sides.find(s => s.id === id));
    syncActive(activeTable.id, t => ({ ...t, order: [...t.order, { ...item, qty: 1, sides: chosenSides, committed: false, orderKey: Date.now() + Math.random() }] }));
    setSidesPicker(null);
  };

  const removeLine = (key) => {
    syncActive(activeTable.id, t => ({ ...t, order: t.order.map(o => (o.orderKey === key && !o.committed) ? { ...o, qty: o.qty - 1 } : o).filter(o => o.qty > 0) }));
  };

  const sendToKitchen = () => {
    const newLines = activeTable.order.filter(o => !o.committed);
    if (newLines.length === 0) {
      addNotification("No new items to send");
      return;
    }
    setMenu(prev => prev.map(m => { const o = newLines.find(x => x.id === m.id); return o ? { ...m, stock: Math.max(0, m.stock - o.qty) } : m; }));
    setSides(prev => prev.map(s => { const used = newLines.flatMap(o => o.sides || []).filter(x => x.id === s.id).length; return used ? { ...s, stock: Math.max(0, s.stock - used) } : s; }));
    syncActive(activeTable.id, t => ({ ...t, order: t.order.map(o => ({ ...o, committed: true })), orderSentAt: nowTime(), orderSentTs: Date.now(), kitchenReadyAt: null, barReadyAt: null }));
    addNotification(`${activeTable.isTakeaway ? "Takeaway " + activeTable.takeawayNumber : "Table " + activeTable.id} order sent`);
    onBack();
  };

  const filteredMenu = menu.filter(m => m.category === selectedCat);
  const total = orderTotal(activeTable.order);
  const label = activeTable.isTakeaway ? `🥡 ${activeTable.takeawayNumber}` : `Table ${activeTable.id}`;

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark, display: "flex", flexDirection: "column" }}>
      {sidesPicker && <SidesPicker item={sidesPicker} sides={sides} onConfirm={confirmSides} onCancel={() => setSidesPicker(null)} />}
      <div style={{ background: activeTable.isTakeaway ? C.teal : C.purple, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.gold, fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.gold, fontWeight: 800 }}>{label}</div>
          <div style={{ color: C.goldPale, fontSize: 11 }}>{activeTable.isTakeaway ? activeTable.takeawayNumber : `${activeTable.guests} guests`} · {activeTable.openedAt}</div>
        </div>
        <Logo size={22} />
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 58px - 180px)" }}>
        <div style={{ width: 88, background: "#2a1020", borderRight: `2px solid ${C.purpleLight}`, display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => changeCat(cat)} style={{ width: "100%", padding: "16px 4px", background: selectedCat === cat ? C.purple : "transparent", color: selectedCat === cat ? C.gold : C.goldPale, border: "none", borderLeft: `3px solid ${selectedCat === cat ? C.gold : "transparent"}`, fontWeight: 700, fontSize: 11, cursor: "pointer", textAlign: "center", lineHeight: 1.3 }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {(() => {
            const groups = {};
            const ungrouped = [];
            filteredMenu.forEach(item => {
              const key = item.subCategory && item.subCategory.trim() ? item.subCategory.trim() : null;
              if (key) { if (!groups[key]) groups[key] = []; groups[key].push(item); }
              else ungrouped.push(item);
            });
            const groupKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));

            const renderItemCard = (item) => {
              const qty = activeTable.order.filter(o => o.id === item.id).reduce((s, o) => s + o.qty, 0);
              const out = item.stock === 0;
              return (
                <div key={item.id} style={{ background: out ? "#1a0a18" : C.purple, borderRadius: 10, padding: "12px 14px", border: `1px solid ${qty > 0 ? C.gold : out ? C.red : C.purpleLight}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: out ? C.gray500 : C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ color: C.gold, fontWeight: 800, fontSize: 14 }}>{fmt(item.price)}</span>
                      {item.hasSides && !out && <span style={{ fontSize: 10, color: C.goldPale, background: C.purpleLight, padding: "1px 6px", borderRadius: 8 }}>+{item.sidesRequired} sides</span>}
                      {out && <span style={{ fontSize: 10, color: C.white, background: C.red, padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>OUT OF STOCK</span>}
                      {!out && item.stock <= 3 && <span style={{ fontSize: 10, color: C.white, background: C.orange, padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>{item.stock} left</span>}
                    </div>
                  </div>
                  {!out && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {qty > 0 && <span style={{ color: C.gold, fontWeight: 800 }}>{qty}</span>}
                      <button onClick={() => addItem(item)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, fontSize: 20, cursor: "pointer" }}>+</button>
                    </div>
                  )}
                </div>
              );
            };

            if (groupKeys.length === 0) {
              return filteredMenu.map(renderItemCard);
            }

            return (
              <>
                {openGroup && groups[openGroup] ? (
                  <>
                    <button onClick={() => setOpenGroup(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.gold, fontWeight: 700, fontSize: 13, cursor: "pointer", padding: "4px 0 8px" }}>← {openGroup}</button>
                    {groups[openGroup].map(renderItemCard)}
                  </>
                ) : (
                  <>
                    {groupKeys.map(key => {
                      const items = groups[key];
                      const anyAvailable = items.some(it => it.stock > 0);
                      return (
                        <button key={key} onClick={() => setOpenGroup(key)} style={{ width: "100%", textAlign: "left", background: C.purple, borderRadius: 10, padding: "14px", border: `1px solid ${C.purpleLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                          <div>
                            <div style={{ color: C.gold, fontWeight: 800, fontSize: 14 }}>{key}</div>
                            <div style={{ color: C.gray500, fontSize: 11, marginTop: 2 }}>{items.length} option{items.length !== 1 ? "s" : ""}{!anyAvailable ? " · all out of stock" : ""}</div>
                          </div>
                          <span style={{ color: C.goldPale, fontSize: 18 }}>→</span>
                        </button>
                      );
                    })}
                    {ungrouped.map(renderItemCard)}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <div style={{ background: activeTable.isTakeaway ? C.teal : C.purple, borderTop: `2px solid ${C.gold}`, padding: 14, position: "sticky", bottom: 0 }}>
        {activeTable.order.length === 0 ? (
          <div style={{ color: C.gray500, textAlign: "center", fontSize: 13 }}>No items yet — select from the menu above</div>
        ) : (
          <>
            <div style={{ maxHeight: 130, overflowY: "auto", marginBottom: 10 }}>
              {activeTable.order.map(o => (
                <div key={o.orderKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: C.goldPale, fontWeight: 700, fontSize: 12 }}>{o.qty}x {o.name}</span>
                    {o.committed && <span style={{ color: C.greenLight, fontSize: 9, marginLeft: 6, fontWeight: 700 }}>SENT</span>}
                    {o.sides && <div style={{ color: C.gray300, fontSize: 11 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{fmt(o.price * o.qty)}</span>
                    {!o.committed && <button onClick={() => removeLine(o.orderKey)} style={{ background: "none", border: "none", color: C.redLight, fontWeight: 900, fontSize: 16, cursor: "pointer", padding: 0 }}>x</button>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.gold, fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={sendToKitchen} style={{ flex: 1 }}>Send to Kitchen →</Btn>
              {showBillButton && activeTable.orderSentAt && (
                <Btn onClick={() => { syncActive(activeTable.id, t => ({ ...t, status: "bill" })); onBack(); }} color={C.orange} textColor={C.white} style={{ flex: 1 }}>Request Bill</Btn>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const WaiterView = ({ tables, setTables, menu, sides, setMenu, setSides, user, addNotification }) => {
  const [view, setView] = useState("tables");
  const [activeTable, setActiveTable] = useState(null);
  const [openingTable, setOpeningTable] = useState(null);
  const [showTakeaway, setShowTakeaway] = useState(false);

  const takeawayOrders = tables.filter(t => t.isTakeaway && t.status !== "free");
  const takeawayCount = takeawayOrders.length;

  const openTable = (tableId, guestsStr) => {
    const g = parseInt(guestsStr);
    if (!g) return;
    const base = tables.find(t => t.id === tableId);
    const updated = { ...base, status: "occupied", guests: g, waiterId: user.id, order: [], openedAt: nowTime(), openedTs: Date.now(), orderSentAt: null, reservation: null };
    setTables(prev => prev.map(t => t.id === tableId ? updated : t));
    setActiveTable(updated);
    setOpeningTable(null);
    setView("order");
  };

  const startTakeaway = (customerName) => {
    const newId = 100 + takeawayCount + 1;
    const tkNumber = `TK${takeawayCount + 1}`;
    const newOrder = {
      id: newId, status: "occupied", guests: 1, waiterId: user.id,
      order: [], orderSentAt: null, openedAt: nowTime(), openedTs: Date.now(), reservation: null,
      isTakeaway: true, takeawayNumber: tkNumber, customerName,
    };
    setTables(prev => [...prev, newOrder]);
    setActiveTable(newOrder);
    setShowTakeaway(false);
    setView("order");
  };

  if (view === "order" && activeTable) {
    return (
      <OrderPanel
        activeTable={activeTable} setActiveTable={setActiveTable}
        tables={tables} setTables={setTables} menu={menu} sides={sides} setMenu={setMenu} setSides={setSides}
        userId={user.id} addNotification={addNotification}
        onBack={() => setView("tables")} showBillButton={true}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      {showTakeaway && <TakeawayModal existingCount={takeawayCount} onConfirm={startTakeaway} onCancel={() => setShowTakeaway(false)} />}
      {openingTable && <OpenTableModal tableId={openingTable} onOpen={(g) => openTable(openingTable, g)} onCancel={() => setOpeningTable(null)} />}

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ color: C.gold, margin: 0, fontSize: 15, letterSpacing: 1 }}>TABLES</h2>
          <button onClick={() => setShowTakeaway(true)} style={{ background: C.teal, color: C.white, border: "none", borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            🥡 Takeaway
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
          {tables.filter(t => !t.isTakeaway).map(t => {
            const mine = t.waiterId === user.id;
            const free = t.status === "free";
            const reserved = t.status === "reserved";
            const bg = free ? C.purple : reserved ? C.blue : t.status === "bill" ? C.orange : C.purpleLight;
            return (
              <button key={t.id} onClick={() => { if (free || reserved) setOpeningTable(t.id); else if (mine) { setActiveTable(tables.find(x => x.id === t.id)); setView("order"); } }} style={{ background: bg, border: `2px solid ${mine ? C.gold : (free || reserved) ? C.purpleLight : "transparent"}`, borderRadius: 12, padding: "14px 10px", cursor: (free || reserved || mine) ? "pointer" : "default", textAlign: "left", opacity: (!free && !reserved && !mine) ? 0.4 : 1 }}>
                <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>T{t.id}</div>
                <div style={{ color: C.goldPale, fontSize: 11, marginTop: 3 }}>{free ? "Free" : reserved ? `🔖 ${t.reservation?.name}` : t.status === "bill" ? "⏳ Bill" : `${t.guests} guests`}</div>
                {mine && t.order.length > 0 && <div style={{ color: C.goldLight, fontSize: 11, marginTop: 3 }}>{fmt(orderTotal(t.order))}</div>}
              </button>
            );
          })}
        </div>

        {takeawayOrders.length > 0 && (
          <>
            <h3 style={{ color: C.teal, margin: "0 0 10px", fontSize: 13, letterSpacing: 1 }}>🥡 TAKEAWAY ORDERS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {takeawayOrders.map(t => (
                <button key={t.id} onClick={() => { if (t.waiterId === user.id) { setActiveTable(t); setView("order"); } }} style={{ background: C.teal, border: `2px solid ${t.waiterId === user.id ? C.gold : "transparent"}`, borderRadius: 12, padding: "12px 14px", cursor: t.waiterId === user.id ? "pointer" : "default", textAlign: "left", opacity: t.waiterId === user.id ? 1 : 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: C.gold, fontWeight: 800, fontSize: 16 }}>{t.takeawayNumber}</div>
                    <div style={{ color: C.white, fontSize: 11, marginTop: 2 }}>{t.customerName} · {t.openedAt}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: C.gold, fontWeight: 800 }}>{fmt(orderTotal(t.order))}</div>
                    <div style={{ color: C.white, fontSize: 11 }}>{t.status === "bill" ? "⏳ Bill" : `${t.order.length} items`}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const KitchenView = ({ tables, setTables, menu, setMenu, sides, setSides, user, addNotification }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(x => x + 1), 15000); return () => clearInterval(iv); }, []);
  const [compact, setCompact] = useState(false);
  const [requestsCompact, setRequestsCompact] = useState(false);
  const [stockRequests, setStockRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      const { data } = await supabase.from("stock_requests").select("*").eq("status", "pending").order("created_at", { ascending: true });
      setStockRequests(data || []);
    };
    loadRequests();
    const iv = setInterval(loadRequests, 10000);
    return () => clearInterval(iv);
  }, []);

  const applyStockRequest = async (req) => {
    setMenu(prev => prev.map(m => { const it = (req.items || []).find(x => x.kind === "menu" && x.id === m.id); return it ? { ...m, stock: it.stock } : m; }));
    setSides(prev => prev.map(s => { const it = (req.items || []).find(x => x.kind === "sides" && x.id === s.id); return it ? { ...s, stock: it.stock } : s; }));
    await supabase.from("stock_requests").update({ status: "applied", applied_at: new Date().toISOString() }).eq("id", req.id);
    for (const it of (req.items || [])) {
      await supabase.from("shift_events").insert({
        staff_id: user.id, staff_name: user.name, role: "kitchen",
        event_type: "kitchen_stock_update", details: { name: it.name, stock: it.stock },
      });
    }
    await supabase.from("notifications").insert({
      message: `${user.name} updated kitchen stock: ${(req.items || []).map(it => `${it.name} (${it.stock})`).join(", ")}`,
      target_roles: "line_chef", sender_name: user.name, sender_role: user.role,
    });
    addNotification(`Applied ${req.staff_name}'s stock update`);
    setStockRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const isDrink = (o) => { const m = menu.find(x => x.id === o.id); return m && m.category === "Drinks"; };
  const pending = tables.filter(t => t.status === "occupied" && t.orderSentAt && !t.kitchenReadyAt && t.order.some(o => !isDrink(o)))
    .sort((a, b) => (a.orderSentTs || 0) - (b.orderSentTs || 0));

  const markReady = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const foodItems = table.order.filter(o => !isDrink(o));
    const hasDrinks = table.order.some(o => isDrink(o));
    const barDone = !hasDrinks || !!table.barReadyAt;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, kitchenReadyAt: nowTime(), status: barDone ? "bill" : t.status } : t));
    const label = table.isTakeaway ? `Takeaway ${table.takeawayNumber}` : `Table ${tableId}`;
    addNotification(barDone ? `${label} is ready!` : `${label} food ready — waiting on bar`);
    const items = foodItems.map(o => `${o.qty}x ${o.name}`).join(", ");
    supabase.from("shift_events").insert({
      staff_id: user.id, staff_name: user.name, role: "kitchen",
      event_type: "order_ready", details: { label, items, sentAt: table.orderSentAt, readyAt: nowTime() },
    });
  };

  const adjustStock = (kind, id, delta) => {
    const setter = kind === "menu" ? setMenu : setSides;
    const list = kind === "menu" ? menu : sides;
    const item = list.find(x => x.id === id);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    setter(prev => prev.map(x => x.id === id ? { ...x, stock: newStock } : x));
    supabase.from("shift_events").insert({
      staff_id: user.id, staff_name: user.name, role: "kitchen",
      event_type: "kitchen_stock_update", details: { name: item.name, stock: newStock },
    });
    if (delta > 0) {
      supabase.from("notifications").insert({
        message: `${user.name} added kitchen stock: ${item.name} now ${newStock}`,
        target_roles: "line_chef", sender_name: user.name, sender_role: user.role,
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ color: C.gold, margin: 0, fontSize: 15 }}>🍳 ORDER QUEUE</h2>
          <button onClick={() => setCompact(v => !v)} style={{ background: compact ? C.gold : C.purple, color: compact ? C.purple : C.goldPale, border: `1px solid ${C.purpleLight}`, borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{compact ? "Full View" : "Compact View"}</button>
        </div>
        {pending.length === 0 ? (
          <div style={{ background: C.purple, borderRadius: 12, padding: 40, textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 36 }}>✅</div><div style={{ color: C.goldPale, marginTop: 10 }}>All caught up!</div></div>
        ) : compact ? (
          <div style={{ marginBottom: 20 }}>
            {pending.map(t => (
              <button key={t.id} onClick={() => markReady(t.id)} style={{ width: "100%", textAlign: "left", background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `2px solid ${orderAgeColor(t.orderSentTs) || C.purpleLight}`, cursor: "pointer" }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 14 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                  <div style={{ color: C.gray500, fontSize: 11 }}>{t.order.filter(o => !isDrink(o)).length} food item{t.order.filter(o => !isDrink(o)).length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.goldPale, fontSize: 11 }}>Sent {t.orderSentAt}</div>
                  <div style={{ color: orderAgeColor(t.orderSentTs) || C.gray500, fontWeight: 700, fontSize: 12 }}>{orderAgeMins(t.orderSentTs) != null ? `${orderAgeMins(t.orderSentTs)} min` : ""}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {pending.map(t => (
              <div key={t.id} style={{ background: t.isTakeaway ? C.teal : C.purple, borderRadius: 12, padding: 16, border: `2px solid ${orderAgeColor(t.orderSentTs) || C.gold}`, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                    {t.isTakeaway && <div style={{ color: C.white, fontSize: 11 }}>{t.customerName}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: C.goldPale, fontSize: 12 }}>Sent {t.orderSentAt}</div>
                    {orderAgeMins(t.orderSentTs) != null && <div style={{ color: orderAgeColor(t.orderSentTs) || C.gray500, fontSize: 11, fontWeight: 700 }}>{orderAgeMins(t.orderSentTs)} min ago</div>}
                  </div>
                </div>
                {t.order.filter(o => !isDrink(o)).map((o, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ color: C.goldPale, fontSize: 14, fontWeight: 700 }}>{o.qty}x {o.name}</div>
                    {o.sides && <div style={{ color: C.gray300, fontSize: 12, marginTop: 2 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
                  </div>
                ))}
                <Btn onClick={() => markReady(t.id)} color={C.greenLight} textColor={C.white} style={{ marginTop: 10, width: "100%" }}>✓ Mark Ready</Btn>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ color: C.gold, margin: 0, fontSize: 15 }}>📥 STOCK REQUESTS ({stockRequests.length})</h2>
          {stockRequests.length > 0 && (
            <button onClick={() => setRequestsCompact(v => !v)} style={{ background: requestsCompact ? C.gold : C.purple, color: requestsCompact ? C.purple : C.goldPale, border: `1px solid ${C.purpleLight}`, borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{requestsCompact ? "Full View" : "Compact View"}</button>
          )}
        </div>
        {stockRequests.length === 0 ? (
          <div style={{ color: C.gray500, fontSize: 12, marginBottom: 20 }}>No pending stock requests</div>
        ) : requestsCompact ? (
          <div style={{ marginBottom: 20 }}>
            {stockRequests.map(req => (
              <button key={req.id} onClick={() => applyStockRequest(req)} style={{ width: "100%", textAlign: "left", background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `2px solid ${C.orange}`, cursor: "pointer" }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 13 }}>{req.staff_name}</div>
                  <div style={{ color: C.gray500, fontSize: 11 }}>{(req.items || []).length} item{(req.items || []).length !== 1 ? "s" : ""} · {new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <span style={{ color: C.greenLight, fontSize: 12, fontWeight: 700 }}>Tap to apply →</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {stockRequests.map(req => (
              <div key={req.id} style={{ background: C.purple, borderRadius: 12, padding: 16, border: `2px solid ${C.orange}`, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 15 }}>{req.staff_name}</div>
                  <div style={{ color: C.goldPale, fontSize: 12 }}>{new Date(req.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                {(req.items || []).map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: C.goldPale, fontSize: 13 }}>{it.name} <span style={{ color: C.gray500, fontSize: 10 }}>({it.category})</span></span>
                    <span style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{it.stock}</span>
                  </div>
                ))}
                <Btn onClick={() => applyStockRequest(req)} color={C.greenLight} textColor={C.white} style={{ marginTop: 10, width: "100%" }}>✓ Mark Updated</Btn>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ color: C.gold, margin: "24px 0 12px", fontSize: 15 }}>📦 STOCK</h2>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Menu Items</div>
        {menu.map(item => (
          <div key={item.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${item.stock === 0 ? C.red : item.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div><div style={{ color: stockColor(item.stock), fontSize: 11 }}>{item.stock === 0 ? "OUT" : item.stock <= 3 ? `⚠ ${item.stock} left` : `${item.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => adjustStock("menu", item.id, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(item.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{item.stock}</span>
              <button onClick={() => adjustStock("menu", item.id, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ color: C.goldPale, fontSize: 12, margin: "14px 0 8px", fontWeight: 700 }}>Sides</div>
        {sides.map(side => (
          <div key={side.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${side.stock === 0 ? C.red : side.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{side.name}</div><div style={{ color: stockColor(side.stock), fontSize: 11 }}>{side.stock === 0 ? "OUT OF STOCK" : side.stock <= 3 ? `⚠ ${side.stock} left` : `${side.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => adjustStock("sides", side.id, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(side.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{side.stock}</span>
              <button onClick={() => adjustStock("sides", side.id, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LineChefView = ({ tables, setTables, menu, setMenu, sides, setSides, user, addNotification }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(x => x + 1), 15000); return () => clearInterval(iv); }, []);
  const isDrink = (o) => { const m = menu.find(x => x.id === o.id); return m && m.category === "Drinks"; };
  const pending = tables.filter(t => t.status === "occupied" && t.orderSentAt && !t.kitchenReadyAt && t.order.some(o => !isDrink(o)))
    .sort((a, b) => (a.orderSentTs || 0) - (b.orderSentTs || 0));

  const markReady = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const foodItems = table.order.filter(o => !isDrink(o));
    const hasDrinks = table.order.some(o => isDrink(o));
    const barDone = !hasDrinks || !!table.barReadyAt;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, kitchenReadyAt: nowTime(), status: barDone ? "bill" : t.status } : t));
    const label = table.isTakeaway ? `Takeaway ${table.takeawayNumber}` : `Table ${tableId}`;
    addNotification(barDone ? `${label} is ready!` : `${label} food ready — waiting on bar`);
    const items = foodItems.map(o => `${o.qty}x ${o.name}`).join(", ");
    supabase.from("shift_events").insert({
      staff_id: user.id, staff_name: user.name, role: "line_chef",
      event_type: "order_ready", details: { label, items, sentAt: table.orderSentAt, readyAt: nowTime() },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16 }}>
        <h2 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15 }}>🍳 ORDER QUEUE</h2>
        {pending.length === 0
          ? <div style={{ background: C.purple, borderRadius: 12, padding: 40, textAlign: "center" }}><div style={{ fontSize: 36 }}>✅</div><div style={{ color: C.goldPale, marginTop: 10 }}>All caught up!</div></div>
          : pending.map(t => (
            <div key={t.id} style={{ background: t.isTakeaway ? C.teal : C.purple, borderRadius: 12, padding: 16, border: `2px solid ${orderAgeColor(t.orderSentTs) || C.gold}`, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                  {t.isTakeaway && <div style={{ color: C.white, fontSize: 11 }}>{t.customerName}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.goldPale, fontSize: 12 }}>Sent {t.orderSentAt}</div>
                  {orderAgeMins(t.orderSentTs) != null && <div style={{ color: orderAgeColor(t.orderSentTs) || C.gray500, fontSize: 11, fontWeight: 700 }}>{orderAgeMins(t.orderSentTs)} min ago</div>}
                </div>
              </div>
              {t.order.filter(o => !isDrink(o)).map((o, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ color: C.goldPale, fontSize: 14, fontWeight: 700 }}>{o.qty}x {o.name}</div>
                  {o.sides && <div style={{ color: C.gray300, fontSize: 12, marginTop: 2 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
                </div>
              ))}
              <Btn onClick={() => markReady(t.id)} color={C.greenLight} textColor={C.white} style={{ marginTop: 10, width: "100%" }}>✓ Mark Ready</Btn>
            </div>
          ))}
      </div>
    </div>
  );
};

const BarView = ({ tables, setTables, menu, setMenu, sides, setSides, user, addNotification }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick(x => x + 1), 15000); return () => clearInterval(iv); }, []);
  const isDrink = (o) => { const m = menu.find(x => x.id === o.id); return m && m.category === "Drinks"; };
  const pending = tables.filter(t => t.status === "occupied" && t.orderSentAt && !t.barReadyAt && t.order.some(o => isDrink(o)));
  const markReady = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const drinkItems = table.order.filter(o => isDrink(o));
    const hasFood = table.order.some(o => !isDrink(o));
    const kitchenDone = !hasFood || !!table.kitchenReadyAt;
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, barReadyAt: nowTime(), status: kitchenDone ? "bill" : t.status } : t));
    const label = table.isTakeaway ? `Takeaway ${table.takeawayNumber}` : `Table ${tableId}`;
    addNotification(kitchenDone ? `${label} is ready!` : `${label} drinks ready — waiting on kitchen`);
    const items = drinkItems.map(o => ({ name: o.name, qty: o.qty }));
    supabase.from("shift_events").insert({
      staff_id: user.id, staff_name: user.name, role: "bar",
      event_type: "order_ready", details: { label, items },
    });
    supabase.from("shifts").select("id, bar_orders_ready").eq("staff_id", user.id).is("clock_out", null).limit(1).then(({ data }) => {
      if (data && data.length) supabase.from("shifts").update({ bar_orders_ready: (data[0].bar_orders_ready || 0) + 1 }).eq("id", data[0].id);
    });
  };

  const drinkMenu = menu.filter(m => m.category === "Drinks");

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16 }}>
        <h2 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15 }}>🍹 DRINKS QUEUE</h2>
        {pending.length === 0
          ? <div style={{ background: C.purple, borderRadius: 12, padding: 40, textAlign: "center" }}><div style={{ fontSize: 36 }}>✅</div><div style={{ color: C.goldPale, marginTop: 10 }}>All caught up!</div></div>
          : pending.map(t => (
            <div key={t.id} style={{ background: t.isTakeaway ? C.teal : C.purple, borderRadius: 12, padding: 16, border: `2px solid ${orderAgeColor(t.orderSentTs) || C.gold}`, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                  {t.isTakeaway && <div style={{ color: C.white, fontSize: 11 }}>{t.customerName}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.goldPale, fontSize: 12 }}>Sent {t.orderSentAt}</div>
                  {orderAgeMins(t.orderSentTs) != null && <div style={{ color: orderAgeColor(t.orderSentTs) || C.gray500, fontSize: 11, fontWeight: 700 }}>{orderAgeMins(t.orderSentTs)} min ago</div>}
                </div>
              </div>
              {t.order.filter(o => isDrink(o)).map((o, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ color: C.goldPale, fontSize: 14, fontWeight: 700 }}>{o.qty}x {o.name}</div>
                </div>
              ))}
              <Btn onClick={() => markReady(t.id)} color={C.greenLight} textColor={C.white} style={{ marginTop: 10, width: "100%" }}>✓ Mark Ready</Btn>
            </div>
          ))}

        <h2 style={{ color: C.gold, margin: "24px 0 12px", fontSize: 15 }}>📦 DRINKS STOCK</h2>
        {drinkMenu.map(item => (
          <div key={item.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${item.stock === 0 ? C.red : item.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div><div style={{ color: stockColor(item.stock), fontSize: 11 }}>{item.stock === 0 ? "OUT" : item.stock <= 3 ? `⚠ ${item.stock} left` : `${item.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(item.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{item.stock}</span>
              <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: m.stock + 1 } : m))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CashierView = ({ tables, setTables, user }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const billTables = tables.filter(t => t.status === "bill");
  const processPay = async (tableId, method) => {
    const t = tables.find(x => x.id === tableId);
    if (t) {
      const amount = orderTotal(t.order);
      const label = t.isTakeaway ? t.takeawayNumber : `Table ${t.id}`;
      const duration = t.openedTs ? Math.round((Date.now() - t.openedTs) / 60000) : null;
      if (t.waiterId) {
        const waiterStaff = STAFF.find(s => s.id === t.waiterId);
        const { data } = await supabase.from("shifts").select("id, tables_served, revenue").eq("staff_id", t.waiterId).is("clock_out", null).limit(1);
        if (data && data.length) {
          const s = data[0];
          await supabase.from("shifts").update({ tables_served: (s.tables_served || 0) + 1, revenue: (Number(s.revenue) || 0) + amount }).eq("id", s.id);
        }
        await supabase.from("shift_events").insert({
          staff_id: t.waiterId, staff_name: waiterStaff ? waiterStaff.name : t.waiterId, role: "waiter",
          event_type: "table_served", details: { label, guests: t.guests, duration, amount },
        });
      }
      const { data: cData } = await supabase.from("shifts").select("id, payments_processed, payments_total").eq("staff_id", user.id).is("clock_out", null).limit(1);
      if (cData && cData.length) {
        const cs = cData[0];
        await supabase.from("shifts").update({ payments_processed: (cs.payments_processed || 0) + 1, payments_total: (Number(cs.payments_total) || 0) + amount }).eq("id", cs.id);
      }
      await supabase.from("shift_events").insert({
        staff_id: user.id, staff_name: user.name, role: "cashier",
        event_type: "payment_processed", details: { label, amount, method },
      });
      const items = t.order.map(o => ({ name: o.name, qty: o.qty, price: o.price }));
      await supabase.from("sales").insert({
        table_label: label, waiter_id: t.waiterId || null,
        waiter_name: t.waiterId ? (STAFF.find(s => s.id === t.waiterId)?.name || t.waiterId) : null,
        items, amount, payment_method: method, cashier_id: user.id, cashier_name: user.name,
      });
    }
    setTables(prev => {
      if (t && t.isTakeaway) return prev.filter(x => x.id !== tableId);
      return prev.map(x => x.id === tableId ? { ...x, status: "free", guests: 0, waiterId: null, order: [], orderSentAt: null, orderSentTs: null, kitchenReadyAt: null, barReadyAt: null, openedAt: null, openedTs: null, reservation: null } : x);
    });
    setSelectedTable(null);
  };
  const selTable = selectedTable ? tables.find(t => t.id === selectedTable) : null;

  if (selTable) return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <div style={{ background: selTable.isTakeaway ? C.teal : C.purple, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => setSelectedTable(null)} style={{ background: "none", border: "none", color: C.gold, fontSize: 22, cursor: "pointer" }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.gold, fontWeight: 800, fontSize: 16 }}>{selTable.isTakeaway ? `🥡 ${selTable.takeawayNumber}` : `Table ${selTable.id}`}</div>
          <div style={{ color: C.goldPale, fontSize: 11 }}>{selTable.isTakeaway ? selTable.customerName : `${selTable.guests} guests`} · {selTable.openedAt}</div>
        </div>
        <div style={{ background: C.orange, color: C.white, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 10 }}>⏳ Bill</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ background: C.purple, borderRadius: 12, padding: 20, border: `1px solid ${C.gold}`, marginBottom: 20 }}>
          <div style={{ color: C.gold, fontWeight: 800, textAlign: "center", fontSize: 15, marginBottom: 16, letterSpacing: 1 }}>AUTHORITY SYSTEMS</div>
          {selTable.isTakeaway && <div style={{ color: C.teal, fontWeight: 700, textAlign: "center", marginBottom: 12, fontSize: 13 }}>🥡 TAKEAWAY — {selTable.takeawayNumber}</div>}
          {selTable.order.map((o, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px dotted ${C.purpleLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: C.goldPale, fontSize: 14 }}>
                <span style={{ fontWeight: 700 }}>{o.qty}x {o.name}</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>{fmt(o.price * o.qty)}</span>
              </div>
              {o.sides && <div style={{ color: C.gray500, fontSize: 11, marginTop: 3 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", color: C.gold, fontWeight: 900, fontSize: 22, paddingTop: 8 }}>
            <span>TOTAL</span><span>{fmt(orderTotal(selTable.order))}</span>
          </div>
        </div>
        <div style={{ color: C.goldPale, fontSize: 13, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>Select payment method</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => processPay(selTable.id, "cash")} style={{ background: C.greenLight, color: C.white, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💵</span> Cash
          </button>
          <button onClick={() => processPay(selTable.id, "card")} style={{ background: C.gold, color: C.purple, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💳</span> Card / Tap
          </button>
          <button onClick={() => processPay(selTable.id, "mobile")} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>📱</span> Mobile Pay
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16 }}>
        <h2 style={{ color: C.gold, margin: "0 0 6px", fontSize: 15 }}>💳 PENDING BILLS</h2>
        <p style={{ color: C.goldPale, fontSize: 12, marginBottom: 16 }}>Tap a table to view the order and process payment</p>
        {billTables.length === 0 ? (
          <div style={{ background: C.purple, borderRadius: 12, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>💤</div>
            <div style={{ color: C.goldPale, marginTop: 10 }}>No pending bills right now</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {billTables.map(t => (
              <button key={t.id} onClick={() => setSelectedTable(t.id)} style={{ background: t.isTakeaway ? C.teal : C.purple, borderRadius: 12, padding: "16px 18px", border: `2px solid ${C.orange}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left" }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                  <div style={{ color: C.goldPale, fontSize: 12, marginTop: 3 }}>{t.isTakeaway ? t.customerName : `${t.guests} guests`} · {t.order.length} item{t.order.length !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.gold, fontWeight: 900, fontSize: 20 }}>{fmt(orderTotal(t.order))}</div>
                  <div style={{ color: C.orange, fontSize: 11, fontWeight: 700, marginTop: 2 }}>Tap to pay →</div>
                </div>
              </button>
            ))}
          </div>
        )}
        <div style={{ background: C.purple, borderRadius: 12, padding: 16, marginTop: 24, border: `1px solid ${C.purpleLight}` }}>
          <div style={{ color: C.gold, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>SESSION SNAPSHOT</div>
          <div style={{ display: "flex", justifyContent: "space-between", color: C.goldPale, fontSize: 13, marginBottom: 6 }}>
            <span>Pending bills</span><span style={{ color: C.orange, fontWeight: 700 }}>{billTables.length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: C.goldPale, fontSize: 13, marginBottom: 6 }}>
            <span>Takeaway orders</span><span style={{ color: C.teal, fontWeight: 700 }}>{billTables.filter(t => t.isTakeaway).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: C.goldPale, fontSize: 13 }}>
            <span>Total outstanding</span><span style={{ color: C.gold, fontWeight: 700 }}>{fmt(billTables.reduce((s, t) => s + orderTotal(t.order), 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StockView = ({ menu, sides, user, addNotification }) => {
  const [draftMenu, setDraftMenu] = useState(() => menu.map(m => ({ id: m.id, name: m.name, category: m.category, stock: m.stock })));
  const [draftSides, setDraftSides] = useState(() => sides.map(s => ({ id: s.id, name: s.name, stock: s.stock })));
  const [sending, setSending] = useState(false);

  const adjustDraft = (kind, id, delta) => {
    const setter = kind === "menu" ? setDraftMenu : setDraftSides;
    setter(prev => prev.map(x => x.id === id ? { ...x, stock: Math.max(0, x.stock + delta) } : x));
  };

  const sendUpdate = async () => {
    const changedMenu = draftMenu.filter(m => { const orig = menu.find(o => o.id === m.id); return orig && orig.stock !== m.stock; });
    const changedSides = draftSides.filter(s => { const orig = sides.find(o => o.id === s.id); return orig && orig.stock !== s.stock; });
    if (!changedMenu.length && !changedSides.length) {
      addNotification("No stock changes to send yet");
      return;
    }
    const items = [
      ...changedMenu.map(m => ({ id: m.id, kind: "menu", name: m.name, stock: m.stock, category: m.category === "Drinks" ? "Drinks" : "Food" })),
      ...changedSides.map(s => ({ id: s.id, kind: "sides", name: s.name, stock: s.stock, category: "Food" })),
    ];
    const message = `${user.name} requested stock update: ${items.map(it => `${it.name} (${it.stock})`).join(", ")}`;
    setSending(true);
    const { error } = await supabase.from("stock_requests").insert({ staff_id: user.id, staff_name: user.name, items, status: "pending" });
    if (!error) {
      await supabase.from("notifications").insert({ message, target_roles: "manager", sender_name: user.name, sender_role: user.role });
      const { data } = await supabase.from("shifts").select("id, stock_updates").eq("staff_id", user.id).is("clock_out", null).limit(1);
      if (data && data.length) {
        await supabase.from("shifts").update({ stock_updates: (data[0].stock_updates || 0) + 1 }).eq("id", data[0].id);
      }
      await supabase.from("shift_events").insert({
        staff_id: user.id, staff_name: user.name, role: "stock",
        event_type: "stock_update", details: { message, items },
      });
      addNotification("Sent to Head Chef for approval");
    } else {
      addNotification("Failed to send update");
    }
    setSending(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16, paddingBottom: 90 }}>
        <h2 style={{ color: C.gold, margin: "0 0 4px", fontSize: 15 }}>📦 STOCK MANAGEMENT</h2>
        <p style={{ color: C.goldPale, fontSize: 12, marginBottom: 16 }}>Adjust counts, then send — nothing changes live until the Head Chef approves</p>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Menu Items</div>
        {draftMenu.map(item => (
          <div key={item.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${item.stock === 0 ? C.red : item.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div><div style={{ color: stockColor(item.stock), fontSize: 11 }}>{item.stock === 0 ? "OUT" : item.stock <= 3 ? `⚠ ${item.stock} left` : `${item.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => adjustDraft("menu", item.id, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(item.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{item.stock}</span>
              <button onClick={() => adjustDraft("menu", item.id, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ color: C.goldPale, fontSize: 12, margin: "14px 0 8px", fontWeight: 700 }}>Sides</div>
        {draftSides.map(side => (
          <div key={side.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${side.stock === 0 ? C.red : side.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{side.name}</div><div style={{ color: stockColor(side.stock), fontSize: 11 }}>{side.stock === 0 ? "OUT OF STOCK" : side.stock <= 3 ? `⚠ ${side.stock} left` : `${side.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => adjustDraft("sides", side.id, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(side.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{side.stock}</span>
              <button onClick={() => adjustDraft("sides", side.id, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: C.purple, borderTop: `2px solid ${C.gold}`, padding: 14 }}>
        <Btn onClick={sendUpdate} disabled={sending} style={{ width: "100%" }}>{sending ? "Sending..." : "📣 Send to Head Chef"}</Btn>
      </div>
    </div>
  );
};

const MenuItemModal = ({ item, onSave, onDelete, onCancel }) => {
  const isNew = !item;
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState(item?.category || CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState(item?.subCategory || "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [stock, setStock] = useState(item ? String(item.stock) : "0");
  const [hasSides, setHasSides] = useState(item?.hasSides || false);
  const [sidesRequired, setSidesRequired] = useState(item ? String(item.sidesRequired || 1) : "1");

  const valid = name.trim() && price !== "" && !isNaN(Number(price));

  const save = () => {
    onSave({
      id: item ? item.id : null,
      name: name.trim(), category, subCategory: subCategory.trim(), price: Number(price),
      stock: Number(stock) || 0, hasSides,
      sidesRequired: hasSides ? Math.max(1, Number(sidesRequired) || 1) : 0,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: C.purple, borderRadius: 16, padding: 22, width: "100%", maxWidth: 360, maxHeight: "85vh", overflowY: "auto", border: `2px solid ${C.gold}` }}>
        <h3 style={{ color: C.gold, margin: "0 0 16px" }}>{isNew ? "Add Menu Item" : "Edit Menu Item"}</h3>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Name</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Category</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "8px 2px", borderRadius: 8, border: `2px solid ${category === c ? C.gold : C.purpleLight}`, background: category === c ? C.gold : "transparent", color: category === c ? C.purple : C.goldPale, fontWeight: 700, fontSize: 10, cursor: "pointer" }}>{c}</button>
          ))}
        </div>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Group (optional — e.g. "Wine", "Burgers", "Pizza")</div>
        <input value={subCategory} onChange={e => setSubCategory(e.target.value)} placeholder="e.g. Wine, Burgers, Pizza" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Price ($)</div>
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" inputMode="decimal" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
        {isNew && (
          <>
            <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Starting Stock</div>
            <input value={stock} onChange={e => setStock(e.target.value)} placeholder="0" inputMode="numeric" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
          </>
        )}
        <button onClick={() => setHasSides(v => !v)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", marginBottom: hasSides ? 10 : 18, padding: 0 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${C.gold}`, background: hasSides ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.purple, fontWeight: 900, fontSize: 13 }}>{hasSides ? "✓" : ""}</div>
          <span style={{ color: C.goldPale, fontSize: 13 }}>Requires side dishes</span>
        </button>
        {hasSides && (
          <>
            <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Sides Required</div>
            <input value={sidesRequired} onChange={e => setSidesRequired(e.target.value)} inputMode="numeric" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 18, boxSizing: "border-box" }} />
          </>
        )}
        <div style={{ display: "flex", gap: 10, marginBottom: onDelete ? 10 : 0 }}>
          <Btn onClick={onCancel} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={save} disabled={!valid} style={{ flex: 1 }}>{isNew ? "Add Item" : "Save"}</Btn>
        </div>
        {onDelete && (
          <button onClick={onDelete} style={{ width: "100%", background: "none", border: `1px solid ${C.red}`, color: C.redLight, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Delete Item</button>
        )}
      </div>
    </div>
  );
};

const SideModal = ({ side, onSave, onDelete, onCancel }) => {
  const isNew = !side;
  const [name, setName] = useState(side?.name || "");
  const [stock, setStock] = useState(side ? String(side.stock) : "0");
  const valid = name.trim();

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
      <div style={{ background: C.purple, borderRadius: 16, padding: 22, width: "100%", maxWidth: 340, border: `2px solid ${C.gold}` }}>
        <h3 style={{ color: C.gold, margin: "0 0 16px" }}>{isNew ? "Add Side" : "Edit Side"}</h3>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Name</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Side name" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 14, boxSizing: "border-box" }} />
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 6 }}>Stock</div>
        <input value={stock} onChange={e => setStock(e.target.value)} placeholder="0" inputMode="numeric" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 18, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 10, marginBottom: onDelete ? 10 : 0 }}>
          <Btn onClick={onCancel} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
          <Btn onClick={() => onSave({ id: side ? side.id : null, name: name.trim(), stock: Number(stock) || 0 })} disabled={!valid} style={{ flex: 1 }}>{isNew ? "Add Side" : "Save"}</Btn>
        </div>
        {onDelete && (
          <button onClick={onDelete} style={{ width: "100%", background: "none", border: `1px solid ${C.red}`, color: C.redLight, borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Delete Side</button>
        )}
      </div>
    </div>
  );
};

const FloorPlan = ({ tables, setTables, canReserve, addNotification, menu, sides, setMenu, setSides, user }) => {
  const [selected, setSelected] = useState(null);
  const [reserveModal, setReserveModal] = useState(null);
  const [showTakeaway, setShowTakeaway] = useState(false);
  const [rName, setRName] = useState(""); const [rTime, setRTime] = useState(""); const [rGuests, setRGuests] = useState("2");
  const [orderingTable, setOrderingTable] = useState(null);

  const diningTables = tables.filter(t => !t.isTakeaway);
  const takeawayOrders = tables.filter(t => t.isTakeaway && t.status !== "free");
  const takeawayCount = takeawayOrders.length;
  const statusColor = (t) => ({ free: C.green, reserved: C.blue, bill: C.orange, occupied: C.purpleLight }[t.status] || C.purpleLight);
  const statusLabel = (t) => ({ free: "Free", reserved: "Reserved", bill: "Bill", occupied: "Active" }[t.status] || t.status);
  const selTable = selected ? tables.find(t => t.id === selected) : null;

  if (orderingTable) {
    const liveTable = tables.find(t => t.id === orderingTable.id) || orderingTable;
    return (
      <OrderPanel
        activeTable={liveTable} setActiveTable={setOrderingTable}
        tables={tables} setTables={setTables} menu={menu || []} sides={sides || []} setMenu={setMenu} setSides={setSides}
        userId={user?.id} addNotification={addNotification}
        onBack={() => setOrderingTable(null)} showBillButton={true}
      />
    );
  }

  const doReserve = () => {
    if (!rName || !rTime) return;
    setTables(prev => prev.map(t => t.id === reserveModal ? { ...t, status: "reserved", reservation: { name: rName, time: rTime, guests: parseInt(rGuests) } } : t));
    addNotification && addNotification(`Table ${reserveModal} reserved for ${rName} at ${rTime}`);
    setReserveModal(null); setRName(""); setRTime(""); setRGuests("2"); setSelected(null);
  };

  const cancelReservation = (id) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status: "free", reservation: null } : t));
    setSelected(null);
  };

  const startTakeaway = (customerName) => {
    const newId = 100 + takeawayCount + 1;
    const tkNumber = `TK${takeawayCount + 1}`;
    const newOrder = {
      id: newId, status: "occupied", guests: 1, waiterId: user?.id || null,
      order: [], orderSentAt: null, openedAt: nowTime(), openedTs: Date.now(), reservation: null,
      isTakeaway: true, takeawayNumber: tkNumber, customerName,
    };
    setTables(prev => [...prev, newOrder]);
    setShowTakeaway(false);
    setOrderingTable(newOrder);
  };

  const TableBtn = ({ id, w = 80 }) => {
    const t = diningTables.find(x => x.id === id);
    if (!t) return null;
    return (
      <button onClick={() => setSelected(id)} style={{ width: w, height: 68, borderRadius: 10, background: statusColor(t), border: `2px solid ${selected === id ? C.gold : "transparent"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 4 }}>
        <div style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>T{id}</div>
        <div style={{ color: C.white, fontSize: 9, opacity: 0.9 }}>{statusLabel(t)}</div>
        {t.status === "occupied" && t.openedAt && <div style={{ color: C.white, fontSize: 8, opacity: 0.8 }}>{t.openedAt}</div>}
        {t.status === "occupied" && t.order.length > 0 && <div style={{ color: C.white, fontSize: 9, fontWeight: 700 }}>{fmt(orderTotal(t.order))}</div>}
        {t.status === "reserved" && t.reservation && <div style={{ color: C.white, fontSize: 8 }}>{t.reservation.time}</div>}
      </button>
    );
  };

  return (
    <div>
      {showTakeaway && <TakeawayModal existingCount={takeawayCount} onConfirm={startTakeaway} onCancel={() => setShowTakeaway(false)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["Free", C.green], ["Active", C.purpleLight], ["Bill", C.orange], ["Reserved", C.blue]].map(([l, c]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: c }} /><span style={{ color: C.goldPale, fontSize: 11 }}>{l}</span></div>
          ))}
        </div>
        {canReserve && (
          <button onClick={() => setShowTakeaway(true)} style={{ background: C.teal, color: C.white, border: "none", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            🥡 Takeaway
          </button>
        )}
      </div>
      <div style={{ background: "#1e0d1a", borderRadius: 16, padding: "16px 12px", border: `2px solid ${C.purpleLight}`, marginBottom: 16 }}>
        <div style={{ color: C.gray500, fontSize: 9, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>← Window · Dining Floor · Kitchen →</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10 }}>{[1,2,3].map(id => <TableBtn key={id} id={id} />)}</div>
          <div style={{ display: "flex", gap: 10 }}>{[4,5,6].map(id => <TableBtn key={id} id={id} />)}</div>
          <div style={{ width: "100%", borderTop: `1px dashed ${C.purpleLight}`, opacity: 0.4, margin: "2px 0" }} />
          <div style={{ display: "flex", gap: 10 }}>{[7,8].map(id => <TableBtn key={id} id={id} w={100} />)}</div>
          <div style={{ display: "flex", gap: 10 }}>{[9,10].map(id => <TableBtn key={id} id={id} w={100} />)}</div>
        </div>
      </div>
      {takeawayOrders.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ color: C.teal, margin: "0 0 10px", fontSize: 13 }}>🥡 ACTIVE TAKEAWAYS</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {takeawayOrders.map(t => (
              <button key={t.id} onClick={() => setOrderingTable(t)} style={{ width: "100%", textAlign: "left", background: C.teal, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", cursor: "pointer" }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800 }}>{t.takeawayNumber}</div>
                  <div style={{ color: C.white, fontSize: 11 }}>{t.customerName} · {t.openedAt}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.gold, fontWeight: 700 }}>{fmt(orderTotal(t.order))}</div>
                  <div style={{ color: C.white, fontSize: 11 }}>{t.status === "bill" ? "⏳ Bill" : `${t.order.length} items`}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {selTable && (
        <div style={{ background: C.purple, borderRadius: 12, padding: 16, border: `2px solid ${C.gold}`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>Table {selTable.id}</div>
            <span style={{ background: statusColor(selTable), color: C.white, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 12 }}>{statusLabel(selTable)}</span>
          </div>
          {selTable.status === "free" && (
            <div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 12 }}>Available — no current booking</div>
              {canReserve && <Btn onClick={() => setReserveModal(selTable.id)} style={{ width: "100%" }}>🔖 Reserve This Table</Btn>}
            </div>
          )}
          {selTable.status === "reserved" && selTable.reservation && (
            <div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 4 }}>Name: <strong style={{ color: C.gold }}>{selTable.reservation.name}</strong></div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 4 }}>Time: <strong style={{ color: C.gold }}>{selTable.reservation.time}</strong></div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 14 }}>Guests: <strong style={{ color: C.gold }}>{selTable.reservation.guests}</strong></div>
              {canReserve && <Btn onClick={() => cancelReservation(selTable.id)} color={C.red} textColor={C.white} style={{ width: "100%" }}>Cancel Reservation</Btn>}
            </div>
          )}
          {selTable.status === "occupied" && (
            <div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 4 }}>Opened: <strong style={{ color: C.gold }}>{selTable.openedAt}</strong></div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 10 }}>Guests: <strong style={{ color: C.gold }}>{selTable.guests}</strong></div>
              {selTable.order.length > 0 && (
                <>
                  {selTable.order.map((o, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", color: C.goldPale, fontSize: 12, marginBottom: 5 }}>
                      <span>{o.qty}x {o.name}{o.sides ? ` (${o.sides.map(s => s.name).join(", ")})` : ""}</span>
                      <span style={{ color: C.gold }}>{fmt(o.price * o.qty)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${C.purpleLight}`, paddingTop: 8, marginTop: 8, display: "flex", justifyContent: "space-between", color: C.gold, fontWeight: 800, fontSize: 16 }}>
                    <span>Live Bill</span><span>{fmt(orderTotal(selTable.order))}</span>
                  </div>
                </>
              )}
            </div>
          )}
          {selTable.status === "bill" && (
            <div>
              <div style={{ color: C.goldPale, fontSize: 13, marginBottom: 6 }}>Awaiting payment</div>
              <div style={{ color: C.gold, fontWeight: 900, fontSize: 20 }}>{fmt(orderTotal(selTable.order))}</div>
            </div>
          )}
        </div>
      )}
      {reserveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }}>
          <div style={{ background: C.purple, borderRadius: 16, padding: 24, width: "100%", maxWidth: 340, border: `2px solid ${C.gold}` }}>
            <h3 style={{ color: C.gold, margin: "0 0 16px" }}>Reserve Table {reserveModal}</h3>
            <input placeholder="Guest name" value={rName} onChange={e => setRName(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }} />
            <input placeholder="Time (e.g. 7:30 PM)" value={rTime} onChange={e => setRTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.purpleLight}`, background: C.purpleDark, color: C.goldPale, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />
            <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 8 }}>Guests</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {[1,2,3,4,5,6,7,8].map(n => (
                <button key={n} onClick={() => setRGuests(String(n))} style={{ flex: 1, height: 34, borderRadius: 6, border: `2px solid ${rGuests == n ? C.gold : C.purpleLight}`, background: rGuests == n ? C.gold : "transparent", color: rGuests == n ? C.purple : C.goldPale, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>{n}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => setReserveModal(null)} color={C.purpleLight} textColor={C.goldPale} style={{ flex: 1 }}>Cancel</Btn>
              <Btn onClick={doReserve} disabled={!rName || !rTime} style={{ flex: 1 }}>Confirm →</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReceptionistView = ({ tables, setTables, menu, sides, setMenu, setSides, user, addNotification }) => (
  <div style={{ minHeight: "100vh", background: C.purpleDark }}>
    <TopBar user={user} />
    <div style={{ padding: 16 }}>
      <h2 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, letterSpacing: 1 }}>🛎️ FLOOR PLAN</h2>
      <FloorPlan tables={tables} setTables={setTables} canReserve={true} addNotification={addNotification} menu={menu} sides={sides} setMenu={setMenu} setSides={setSides} user={user} />
    </div>
  </div>
);

const ManagerView = ({ tables, setTables, menu, setMenu, sides, setSides, user, addNotification }) => {
  const [tab, setTab] = useState("floor");
  const [activeTable, setActiveTable] = useState(null);
  const [openingTable, setOpeningTable] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showTakeaway, setShowTakeaway] = useState(false);
  const [onShift, setOnShift] = useState([]);
  const [history, setHistory] = useState([]);
  const [sales, setSales] = useState([]);
  const [reportRange, setReportRange] = useState("today");
  const [editingItem, setEditingItem] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [editingSide, setEditingSide] = useState(null);
  const [addingSide, setAddingSide] = useState(false);

  const saveMenuItem = (data) => {
    if (data.id) {
      setMenu(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));
    } else {
      const newId = menu.length ? Math.max(...menu.map(m => m.id)) + 1 : 1;
      setMenu(prev => [...prev, { ...data, id: newId }]);
    }
    setEditingItem(null); setAddingItem(false);
  };
  const deleteMenuItem = (id) => {
    setMenu(prev => prev.filter(m => m.id !== id));
    setEditingItem(null);
  };
  const saveSide = (data) => {
    if (data.id) {
      setSides(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s));
    } else {
      const nums = sides.map(s => parseInt((s.id || "s0").replace("s", "")) || 0);
      const newId = "s" + (nums.length ? Math.max(...nums) + 1 : 1);
      setSides(prev => [...prev, { ...data, id: newId }]);
    }
    setEditingSide(null); setAddingSide(false);
  };
  const deleteSide = (id) => {
    setSides(prev => prev.filter(s => s.id !== id));
    setEditingSide(null);
  };

  useEffect(() => {
    const loadSales = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data } = await supabase.from("sales").select("*").gte("created_at", since.toISOString()).order("created_at", { ascending: false });
      setSales(data || []);
    };
    loadSales();
    const iv = setInterval(loadSales, 20000);
    return () => clearInterval(iv);
  }, []);

  const filteredSales = (() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(startOfToday);
    startOfMonth.setDate(startOfMonth.getDate() - 29);
    const cutoff = reportRange === "today" ? startOfToday : reportRange === "week" ? startOfWeek : startOfMonth;
    return sales.filter(s => new Date(s.created_at) >= cutoff);
  })();

  const reportTotal = filteredSales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const reportCount = filteredSales.length;
  const itemTotals = {};
  filteredSales.forEach(s => (s.items || []).forEach(it => {
    itemTotals[it.name] = (itemTotals[it.name] || 0) + it.qty;
  }));
  const topItems = Object.entries(itemTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const waiterTotals = {};
  filteredSales.forEach(s => {
    if (!s.waiter_name) return;
    waiterTotals[s.waiter_name] = (waiterTotals[s.waiter_name] || 0) + Number(s.amount || 0);
  });
  const topWaiters = Object.entries(waiterTotals).sort((a, b) => b[1] - a[1]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [shiftEvents, setShiftEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const openShiftDetail = async (s) => {
    setSelectedShift(s);
    setLoadingEvents(true);
    const endTime = s.clock_out || new Date().toISOString();
    const { data } = await supabase.from("shift_events").select("*").eq("staff_id", s.staff_id).gte("created_at", s.clock_in).lte("created_at", endTime).order("created_at");
    setShiftEvents(data || []);
    setLoadingEvents(false);
  };

  const renderEvent = (e) => {
    const time = new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const d = e.details || {};
    const itemsStr = (val) => Array.isArray(val) ? val.map(it => `${it.qty != null ? it.qty + "x " : ""}${it.name}${it.stock != null ? ` (${it.stock})` : ""}`).join(", ") : val;
    if (e.event_type === "table_served") return `${time} — ${d.label}: ${d.guests} guest${d.guests === 1 ? "" : "s"}${d.duration != null ? `, ${d.duration} min` : ""}, ${fmt(d.amount || 0)}`;
    if (e.event_type === "payment_processed") return `${time} — Processed ${d.label}: ${fmt(d.amount || 0)}${d.method ? ` (${d.method})` : ""}`;
    if (e.event_type === "stock_update") return `${time} — ${d.message}`;
    if (e.event_type === "kitchen_stock_update") return `${time} — Kitchen stock: ${d.name} now ${d.stock}`;
    if (e.event_type === "order_ready") return `${time} — ${d.label} ready: ${itemsStr(d.items)}`;
    return `${time} — ${e.event_type}`;
  };

  useEffect(() => {
    const loadHistory = async () => {
      const { data } = await supabase.from("shifts").select("*").not("clock_out", "is", null).order("clock_out", { ascending: false }).limit(30);
      setHistory(data || []);
    };
    loadHistory();
    const iv = setInterval(loadHistory, 20000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const loadShifts = async () => {
      const { data } = await supabase.from("shifts").select("*").is("clock_out", null).order("clock_in");
      setOnShift(data || []);
    };
    loadShifts();
    const iv = setInterval(loadShifts, 15000);
    return () => clearInterval(iv);
  }, []);

  const diningTables = tables.filter(t => !t.isTakeaway);
  const takeawayOrders = tables.filter(t => t.isTakeaway && t.status !== "free");
  const takeawayCount = takeawayOrders.length;
  const occupied = tables.filter(t => t.status === "occupied" || t.status === "bill").length;
  const liveRev = tables.reduce((s, t) => s + orderTotal(t.order), 0);
  const outOfStock = menu.filter(m => m.stock === 0).length;
  const lowStock = menu.filter(m => m.stock > 0 && m.stock <= 3).length;

  const openTable = (tableId, guestsStr) => {
    const g = parseInt(guestsStr);
    if (!g) return;
    const base = tables.find(t => t.id === tableId);
    const updated = { ...base, status: "occupied", guests: g, waiterId: user.id, order: [], openedAt: nowTime(), openedTs: Date.now(), orderSentAt: null, reservation: null };
    setTables(prev => prev.map(t => t.id === tableId ? updated : t));
    setActiveTable(updated);
    setOpeningTable(null);
    setShowOrder(true);
  };

  const startTakeaway = (customerName) => {
    const newId = 100 + takeawayCount + 1;
    const tkNumber = `TK${takeawayCount + 1}`;
    const newOrder = {
      id: newId, status: "occupied", guests: 1, waiterId: user.id,
      order: [], orderSentAt: null, openedAt: nowTime(), openedTs: Date.now(), reservation: null,
      isTakeaway: true, takeawayNumber: tkNumber, customerName,
    };
    setTables(prev => [...prev, newOrder]);
    setActiveTable(newOrder);
    setShowTakeaway(false);
    setShowOrder(true);
  };

  if (showOrder && activeTable) {
    return (
      <OrderPanel
        activeTable={activeTable} setActiveTable={setActiveTable}
        tables={tables} setTables={setTables} menu={menu} sides={sides} setMenu={setMenu} setSides={setSides}
        userId={user.id} addNotification={addNotification}
        onBack={() => { setShowOrder(false); setActiveTable(null); setTab("tables"); }}
        showBillButton={true}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      {showTakeaway && <TakeawayModal existingCount={takeawayCount} onConfirm={startTakeaway} onCancel={() => setShowTakeaway(false)} />}
      {openingTable && <OpenTableModal tableId={openingTable} onOpen={(g) => openTable(openingTable, g)} onCancel={() => setOpeningTable(null)} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "12px 16px 0" }}>
        {[["Active", occupied, C.gold], ["Revenue", fmt(liveRev), C.greenLight], ["Out", outOfStock, C.redLight], ["Low", lowStock, C.orange]].map(([l, v, c]) => (
          <div key={l} style={{ background: C.purple, borderRadius: 10, padding: "10px 6px", textAlign: "center", border: `1px solid ${C.purpleLight}` }}>
            <div style={{ color: c, fontWeight: 800, fontSize: 16 }}>{v}</div>
            <div style={{ color: C.goldPale, fontSize: 10 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", margin: "12px 16px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.purpleLight}` }}>
        {[["floor","Floor"], ["tables","Tables"], ["staff","Staff"], ["stock","Stock"], ["menu","Menu"], ["reports","Reports"], ["history","History"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 2px", background: tab === k ? C.gold : C.purple, color: tab === k ? C.purple : C.goldPale, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "floor" && <FloorPlan tables={tables} setTables={setTables} canReserve={true} addNotification={addNotification} menu={menu} sides={sides} setMenu={setMenu} setSides={setSides} user={user} />}
        {tab === "tables" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ color: C.goldPale, fontSize: 12, margin: 0 }}>Tap a table to open or manage</p>
              <button onClick={() => setShowTakeaway(true)} style={{ background: C.teal, color: C.white, border: "none", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>🥡 Takeaway</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
              {diningTables.map(t => {
                const free = t.status === "free";
                const reserved = t.status === "reserved";
                const active = t.status === "occupied" || t.status === "bill";
                const bg = free ? C.purple : reserved ? C.blue : t.status === "bill" ? C.orange : C.purpleLight;
                return (
                  <button key={t.id} onClick={() => { if (free || reserved) setOpeningTable(t.id); else if (active) { setActiveTable(tables.find(x => x.id === t.id)); setShowOrder(true); } }} style={{ background: bg, border: `2px solid ${active ? C.gold : (free || reserved) ? C.purpleLight : "transparent"}`, borderRadius: 12, padding: "14px 10px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>T{t.id}</div>
                    <div style={{ color: C.goldPale, fontSize: 11, marginTop: 3 }}>{free ? "Free" : reserved ? `🔖 ${t.reservation?.name}` : t.status === "bill" ? "⏳ Bill" : `${t.guests} guests`}</div>
                    {active && t.order.length > 0 && <div style={{ color: C.goldLight, fontSize: 11, marginTop: 3 }}>{fmt(orderTotal(t.order))}</div>}
                  </button>
                );
              })}
            </div>
            {takeawayOrders.length > 0 && (
              <>
                <h3 style={{ color: C.teal, margin: "0 0 10px", fontSize: 13 }}>🥡 ACTIVE TAKEAWAYS</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {takeawayOrders.map(t => (
                    <button key={t.id} onClick={() => { setActiveTable(t); setShowOrder(true); }} style={{ background: C.teal, borderRadius: 12, padding: "12px 14px", border: `2px solid ${C.gold}`, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "left" }}>
                      <div>
                        <div style={{ color: C.gold, fontWeight: 800 }}>{t.takeawayNumber}</div>
                        <div style={{ color: C.white, fontSize: 11 }}>{t.customerName} · {t.openedAt}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: C.gold, fontWeight: 700 }}>{fmt(orderTotal(t.order))}</div>
                        <div style={{ color: C.white, fontSize: 11 }}>{t.status === "bill" ? "⏳ Bill" : `${t.order.length} items`}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {tab === "staff" && (
          <div>
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🟢 ON SHIFT NOW</div>
            {onShift.length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12, marginBottom: 18 }}>No one is currently clocked in</div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                {onShift.map(s => (
                  <div key={s.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${C.greenLight}` }}>
                    <div>
                      <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{s.staff_name}</div>
                      <div style={{ color: C.gray500, fontSize: 11, textTransform: "uppercase" }}>{s.role}</div>
                    </div>
                    <div style={{ color: C.greenLight, fontSize: 11, fontWeight: 700 }}>
                      Since {new Date(s.clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>WAITER PERFORMANCE</div>
            {STAFF.filter(s => s.role === "waiter").map(s => {
              const myT = tables.filter(t => t.waiterId === s.id);
              const rev = myT.reduce((sum, t) => sum + orderTotal(t.order), 0);
              return (
                <div key={s.id} style={{ background: C.purple, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div><div style={{ color: C.goldPale, fontWeight: 700 }}>{s.name}</div><div style={{ color: C.gray500, fontSize: 12 }}>{myT.length} table{myT.length !== 1 ? "s" : ""}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ color: C.gold, fontWeight: 800 }}>{fmt(rev)}</div><div style={{ color: C.gray500, fontSize: 11 }}>live</div></div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "stock" && (
          <div>
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Menu Items</div>
            {menu.map(item => (
              <div key={item.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${item.stock === 0 ? C.red : item.stock <= 3 ? C.orange : C.purpleLight}` }}>
                <div><span style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</span><span style={{ color: C.gray500, fontSize: 11, marginLeft: 6 }}>{fmt(item.price)}</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m))} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
                  <span style={{ color: stockColor(item.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{item.stock}</span>
                  <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: m.stock + 1 } : m))} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
                </div>
              </div>
            ))}
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, margin: "16px 0 10px" }}>Sides</div>
            {sides.map(side => (
              <div key={side.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${side.stock === 0 ? C.red : side.stock <= 3 ? C.orange : C.purpleLight}` }}>
                <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{side.name}</div><div style={{ color: stockColor(side.stock), fontSize: 11 }}>{side.stock === 0 ? "OUT" : side.stock <= 3 ? `⚠ ${side.stock} left` : `${side.stock} avail`}</div></div>
                <span style={{ color: stockColor(side.stock), fontWeight: 800 }}>{side.stock}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "menu" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>Menu Items</div>
              <button onClick={() => setAddingItem(true)} style={{ background: C.gold, color: C.purple, border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Add Item</button>
            </div>
            {menu.map(item => (
              <button key={item.id} onClick={() => setEditingItem(item)} style={{ width: "100%", textAlign: "left", background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${C.purpleLight}`, cursor: "pointer" }}>
                <div>
                  <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  <div style={{ color: C.gray500, fontSize: 11 }}>{item.category}{item.subCategory ? ` · ${item.subCategory}` : ""} · {fmt(item.price)}{item.hasSides ? ` · +${item.sidesRequired} sides` : ""}</div>
                </div>
                <span style={{ color: C.gold, fontSize: 16 }}>✎</span>
              </button>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 10px" }}>
              <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>Sides</div>
              <button onClick={() => setAddingSide(true)} style={{ background: C.gold, color: C.purple, border: "none", borderRadius: 8, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Add Side</button>
            </div>
            {sides.map(side => (
              <button key={side.id} onClick={() => setEditingSide(side)} style={{ width: "100%", textAlign: "left", background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${C.purpleLight}`, cursor: "pointer" }}>
                <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{side.name}</div>
                <span style={{ color: C.gold, fontSize: 16 }}>✎</span>
              </button>
            ))}
          </div>
        )}
        {tab === "reports" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setReportRange("today")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${reportRange === "today" ? C.gold : C.purpleLight}`, background: reportRange === "today" ? C.gold : "transparent", color: reportRange === "today" ? C.purple : C.goldPale, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Today</button>
              <button onClick={() => setReportRange("week")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${reportRange === "week" ? C.gold : C.purpleLight}`, background: reportRange === "week" ? C.gold : "transparent", color: reportRange === "week" ? C.purple : C.goldPale, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Week</button>
              <button onClick={() => setReportRange("month")} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `2px solid ${reportRange === "month" ? C.gold : C.purpleLight}`, background: reportRange === "month" ? C.gold : "transparent", color: reportRange === "month" ? C.purple : C.goldPale, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Month</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <div style={{ background: C.purple, borderRadius: 12, padding: 16, border: `1px solid ${C.purpleLight}` }}>
                <div style={{ color: C.greenLight, fontWeight: 900, fontSize: 22 }}>{fmt(reportTotal)}</div>
                <div style={{ color: C.goldPale, fontSize: 11 }}>Total Revenue</div>
              </div>
              <div style={{ background: C.purple, borderRadius: 12, padding: 16, border: `1px solid ${C.purpleLight}` }}>
                <div style={{ color: C.gold, fontWeight: 900, fontSize: 22 }}>{reportCount}</div>
                <div style={{ color: C.goldPale, fontSize: 11 }}>Orders Closed</div>
              </div>
            </div>
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🔥 TOP SELLING ITEMS</div>
            {topItems.length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12, marginBottom: 20 }}>No sales recorded in this period yet</div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                {topItems.map(([name, qty], i) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.purple, borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                    <span style={{ color: C.goldPale, fontSize: 13 }}>{i + 1}. {name}</span>
                    <span style={{ color: C.gold, fontWeight: 700, fontSize: 13 }}>{qty} sold</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>💰 REVENUE BY WAITER</div>
            {topWaiters.length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12 }}>No waiter sales in this period yet</div>
            ) : (
              <div>
                {topWaiters.map(([name, amt]) => (
                  <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.purple, borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                    <span style={{ color: C.goldPale, fontSize: 13 }}>{name}</span>
                    <span style={{ color: C.greenLight, fontWeight: 700, fontSize: 13 }}>{fmt(amt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === "history" && (
          <div>
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>SHIFT HISTORY</div>
            {history.length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12 }}>No completed shifts yet</div>
            ) : history.map(s => (
              <button key={s.id} onClick={() => openShiftDetail(s)} style={{ background: C.purple, borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: `1px solid ${C.purpleLight}`, width: "100%", textAlign: "left", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{s.staff_name}</div>
                  <div style={{ color: C.gray500, fontSize: 11, textTransform: "uppercase" }}>{s.role}</div>
                </div>
                <div style={{ color: C.gray300, fontSize: 11, marginBottom: 6 }}>
                  {new Date(s.clock_in).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} → {new Date(s.clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{s.tables_served || 0} tables</div>
                  <div style={{ color: C.greenLight, fontSize: 12, fontWeight: 700 }}>{fmt(s.revenue || 0)}</div>
                  {s.role === "stock" && <div style={{ color: C.teal, fontSize: 12, fontWeight: 700 }}>{s.stock_updates || 0} stock updates</div>}
                  <div style={{ color: C.gray500, fontSize: 11, marginLeft: "auto" }}>Tap for details →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {(editingItem || addingItem) && (
        <MenuItemModal
          item={editingItem}
          onSave={saveMenuItem}
          onDelete={editingItem ? () => deleteMenuItem(editingItem.id) : null}
          onCancel={() => { setEditingItem(null); setAddingItem(false); }}
        />
      )}
      {(editingSide || addingSide) && (
        <SideModal
          side={editingSide}
          onSave={saveSide}
          onDelete={editingSide ? () => deleteSide(editingSide.id) : null}
          onCancel={() => { setEditingSide(null); setAddingSide(false); }}
        />
      )}
      {selectedShift && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 20 }}>
          <div style={{ background: C.purpleDark, borderRadius: 16, padding: 20, width: "100%", maxWidth: 420, maxHeight: "80vh", overflowY: "auto", border: `2px solid ${C.gold}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{selectedShift.staff_name}</div>
                <div style={{ color: C.goldPale, fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{selectedShift.role}</div>
              </div>
              <button onClick={() => setSelectedShift(null)} style={{ background: "none", border: "none", color: C.gold, fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ color: C.gray300, fontSize: 12, marginBottom: 4 }}>
              Clocked in: {new Date(selectedShift.clock_in).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ color: C.gray300, fontSize: 12, marginBottom: 16 }}>
              Clocked out: {selectedShift.clock_out ? new Date(selectedShift.clock_out).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Still on shift"}
            </div>
            <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>{selectedShift.tables_served || 0} tables served</div>
              <div style={{ color: C.greenLight, fontSize: 13, fontWeight: 700 }}>{fmt(selectedShift.revenue || 0)} revenue</div>
              {selectedShift.role === "stock" && <div style={{ color: C.teal, fontSize: 13, fontWeight: 700 }}>{selectedShift.stock_updates || 0} stock updates</div>}
            </div>
            <div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>ACTIVITY LOG</div>
            {loadingEvents ? (
              <div style={{ color: C.gray500, fontSize: 12 }}>Loading...</div>
            ) : shiftEvents.length === 0 ? (
              <div style={{ color: C.gray500, fontSize: 12 }}>No recorded activity for this shift</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {shiftEvents.map(e => (
                  <div key={e.id} style={{ background: C.purple, borderRadius: 8, padding: "8px 12px", color: C.goldPale, fontSize: 12 }}>
                    {renderEvent(e)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [pendingStaff, setPendingStaff] = useState(null);
  const [shiftId, setShiftId] = useState(null);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [sides, setSides] = useState(SIDES);
  const [notification, setNotification] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const lastNotifCheck = useRef(new Date().toISOString());

  const computeShiftSummary = async (staff, clockInIso, clockOutIso) => {
    const base = { name: staff.name, role: staff.role, clockIn: clockInIso, clockOut: clockOutIso };
    try {
      if (staff.role === "waiter" || staff.role === "manager") {
        const { data } = await supabase.from("sales").select("*").eq("waiter_id", staff.id).gte("created_at", clockInIso).lte("created_at", clockOutIso);
        const rows = data || [];
        let food = 0, drinks = 0;
        rows.forEach(s => (s.items || []).forEach(it => {
          const m = menu.find(x => x.name === it.name);
          if (m && m.category === "Drinks") drinks += it.qty; else food += it.qty;
        }));
        return { ...base, tablesServed: rows.length, food, drinks, total: food + drinks };
      }
      if (staff.role === "cashier") {
        const { data } = await supabase.from("sales").select("*").eq("cashier_id", staff.id).gte("created_at", clockInIso).lte("created_at", clockOutIso);
        const rows = data || [];
        const byMethod = { cash: 0, card: 0, mobile: 0 };
        rows.forEach(s => { const k = s.payment_method || "cash"; byMethod[k] = (byMethod[k] || 0) + Number(s.amount || 0); });
        const total = rows.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        return { ...base, tablesClosed: rows.length, cash: byMethod.cash, card: byMethod.card, mobile: byMethod.mobile, total };
      }
      if (staff.role === "bar") {
        const { data } = await supabase.from("shift_events").select("*").eq("staff_id", staff.id).eq("event_type", "order_ready").gte("created_at", clockInIso).lte("created_at", clockOutIso);
        const rows = data || [];
        const itemTotals = {};
        rows.forEach(e => (e.details?.items || []).forEach(it => { itemTotals[it.name] = (itemTotals[it.name] || 0) + (it.qty || 0); }));
        const total = Object.values(itemTotals).reduce((a, b) => a + b, 0);
        return { ...base, items: Object.entries(itemTotals), total };
      }
      if (staff.role === "stock") {
        const { data } = await supabase.from("shift_events").select("*").eq("staff_id", staff.id).eq("event_type", "stock_update").gte("created_at", clockInIso).lte("created_at", clockOutIso);
        const rows = data || [];
        const itemMap = {};
        rows.forEach(e => (e.details?.items || []).forEach(it => { itemMap[it.name] = { stock: it.stock, category: it.category }; }));
        return { ...base, updates: rows.length, items: Object.entries(itemMap) };
      }
      if (staff.role === "kitchen") {
        const { data: readyData } = await supabase.from("shift_events").select("*").eq("staff_id", staff.id).eq("event_type", "order_ready").gte("created_at", clockInIso).lte("created_at", clockOutIso);
        const { data: stockData } = await supabase.from("shift_events").select("*").eq("staff_id", staff.id).eq("event_type", "kitchen_stock_update").gte("created_at", clockInIso).lte("created_at", clockOutIso);
        return { ...base, ordersCompleted: (readyData || []).length, stockUpdates: (stockData || []).length };
      }
      if (staff.role === "line_chef") {
        const { data } = await supabase.from("shift_events").select("*").eq("staff_id", staff.id).eq("event_type", "order_ready").gte("created_at", clockInIso).lte("created_at", clockOutIso);
        return { ...base, ordersCompleted: (data || []).length };
      }
      return base;
    } catch (e) {
      return base;
    }
  };

  const handlePinMatch = useCallback(async (staff) => {
    const { data } = await supabase.from("shifts").select("id").eq("staff_id", staff.id).is("clock_out", null).order("clock_in", { ascending: false }).limit(1);
    if (data && data.length) {
      setShiftId(data[0].id);
      setUser(staff);
    } else {
      setPendingStaff(staff);
    }
  }, []);

  const handleClockIn = useCallback(async () => {
    const { data, error } = await supabase.from("shifts").insert({ staff_id: pendingStaff.id, staff_name: pendingStaff.name, role: pendingStaff.role }).select().single();
    if (!error && data) {
      setShiftId(data.id);
      setUser(pendingStaff);
      setPendingStaff(null);
    }
  }, [pendingStaff]);

  const handleClockOut = useCallback(async () => {
    if (user) {
      const activeTables = tables.filter(t => t.waiterId === user.id && (t.status === "occupied" || t.status === "bill"));
      if (activeTables.length > 0) {
        addNotification(`Close out ${activeTables.length} active table${activeTables.length > 1 ? "s" : ""} before clocking out`);
        return;
      }
    }
    if (shiftId && user) {
      const nowIso = new Date().toISOString();
      const { data } = await supabase.from("shifts").select("clock_in").eq("id", shiftId).single();
      await supabase.from("shifts").update({ clock_out: nowIso }).eq("id", shiftId);
      if (data && data.clock_in) {
        const summary = await computeShiftSummary(user, data.clock_in, nowIso);
        setShiftSummary(summary);
      }
    }
    setUser(null);
    setShiftId(null);
  }, [shiftId, user, tables, menu]);

  useEffect(() => {
    if (!user || !["manager", "kitchen", "line_chef"].includes(user.role)) return;
    const poll = async () => {
      const { data } = await supabase.from("notifications").select("*").gt("created_at", lastNotifCheck.current).ilike("target_roles", `%${user.role}%`).order("created_at");
      if (data && data.length) {
        data.forEach(n => addNotification(n.message));
        lastNotifCheck.current = data[data.length - 1].created_at;
      }
    };
    const iv = setInterval(poll, 10000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, mRes, sRes] = await Promise.all([
          supabase.from("tables").select("*").order("id"),
          supabase.from("menu_items").select("*").order("id"),
          supabase.from("sides").select("*").order("id"),
        ]);
        if (tRes.data?.length) setTables(tRes.data.map(rowToTable));
        if (mRes.data?.length) setMenu(mRes.data.map(rowToMenu));
        if (sRes.data?.length) setSides(sRes.data.map(rowToSide));
      } catch (e) {
        console.error("Load failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const { error } = await supabase.from("tables").upsert(tables.map(tableToRow));
      if (error) console.error("Save tables failed", error);
      const currentIds = tables.map(t => t.id);
      const { data: takeawayRows } = await supabase.from("tables").select("id").gte("id", 100);
      const toDelete = (takeawayRows || []).filter(r => !currentIds.includes(r.id)).map(r => r.id);
      if (toDelete.length) await supabase.from("tables").delete().in("id", toDelete);
    })();
  }, [tables, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const { error } = await supabase.from("menu_items").upsert(menu.map(menuToRow));
      if (error) console.error("Save menu failed", error);
      const currentIds = menu.map(m => m.id);
      const { data: existing } = await supabase.from("menu_items").select("id");
      const toDelete = (existing || []).filter(r => !currentIds.includes(r.id)).map(r => r.id);
      if (toDelete.length) await supabase.from("menu_items").delete().in("id", toDelete);
    })();
  }, [menu, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      const { error } = await supabase.from("sides").upsert(sides.map(sideToRow));
      if (error) console.error("Save sides failed", error);
      const currentIds = sides.map(s => s.id);
      const { data: existing } = await supabase.from("sides").select("id");
      const toDelete = (existing || []).filter(r => !currentIds.includes(r.id)).map(r => r.id);
      if (toDelete.length) await supabase.from("sides").delete().in("id", toDelete);
    })();
  }, [sides, loaded]);

  const addNotification = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  if (!user && shiftSummary) return <ClockOutSummaryScreen data={shiftSummary} onDone={() => setShiftSummary(null)} />;
  if (!user && pendingStaff) return <ClockInScreen staff={pendingStaff} onClockIn={handleClockIn} onCancel={() => setPendingStaff(null)} />;
  if (!user) return <PinLogin onLogin={handlePinMatch} />;

  const props = { tables, setTables, menu, setMenu, sides, setSides, user, addNotification };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.purpleDark }}>
      {notification && <Notification msg={notification} onClose={() => setNotification(null)} />}
      {user.role === "receptionist" && <ReceptionistView {...props} />}
      {user.role === "waiter" && <WaiterView {...props} />}
      {user.role === "kitchen" && <KitchenView {...props} />}
      {user.role === "line_chef" && <LineChefView {...props} />}
      {user.role === "bar" && <BarView {...props} />}
      {user.role === "cashier" && <CashierView {...props} />}
      {user.role === "stock" && <StockView {...props} />}
      {user.role === "manager" && <ManagerView {...props} />}
      <button onClick={handleClockOut} style={{ position: "fixed", bottom: 16, right: 16, zIndex: 500, background: C.purple, border: `2px solid ${C.gold}`, borderRadius: 50, color: C.gold, fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "7px 13px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>Clock Out</button>
    </div>
  );
  }
