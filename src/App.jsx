import { useState, useCallback } from "react";

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
  { id: "c1", name: "Rudo", role: "cashier", pin: "4567" },
  { id: "m1", name: "Manager", role: "manager", pin: "0000" },
];

const fmt = (n) => `$${Number(n).toFixed(2)}`;
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const stockColor = (s) => s === 0 ? C.red : s <= 3 ? C.orange : C.green;
const orderTotal = (order) => order.reduce((s, o) => s + o.price * o.qty, 0);
const CATEGORIES = ["Starters", "Mains", "Desserts", "Drinks"];const Logo = ({ size = 32 }) => (
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
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const roleIcon = { waiter: "🧑‍🍽️", kitchen: "👨‍🍳", cashier: "💳", manager: "👔", receptionist: "🛎️" };

  const attempt = () => {
    const staff = STAFF.find(s => s.id === selected && s.pin === pin);
    if (staff) onLogin(staff);
    else { setError("Wrong PIN"); setPin(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, gap: 28 }}>
      <Logo size={44} />
      <div style={{ width: "100%", maxWidth: 400 }}>
        <p style={{ color: C.goldPale, textAlign: "center", marginBottom: 14, fontSize: 13 }}>Select your name</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {STAFF.map(s => (
            <button key={s.id} onClick={() => { setSelected(s.id); setPin(""); setError(""); }} style={{ background: selected === s.id ? C.gold : C.purple, color: selected === s.id ? C.purple : C.goldPale, border: `2px solid ${selected === s.id ? C.gold : C.purpleLight}`, borderRadius: 10, padding: "10px 6px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
              <div style={{ fontSize: 18 }}>{roleIcon[s.role]}</div>
              <div style={{ marginTop: 4 }}>{s.name}</div>
              <div style={{ fontSize: 9, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{s.role}</div>
            </button>
          ))}
        </div>
        {selected && (
          <>
            <p style={{ color: C.goldPale, textAlign: "center", marginBottom: 10, fontSize: 13 }}>Enter PIN</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 42, height: 42, borderRadius: 8, background: C.purple, border: `2px solid ${pin.length > i ? C.gold : C.purpleLight}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.gold, fontSize: 20, fontWeight: 900 }}>
                  {pin.length > i ? "●" : ""}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, maxWidth: 230, margin: "0 auto 14px" }}>
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
                <button key={i} onClick={() => { if (k === "⌫") setPin(p => p.slice(0,-1)); else if (k !== "" && pin.length < 4) setPin(p => p + k); }} style={{ height: 50, borderRadius: 10, border: k === "" ? "none" : `1px solid ${C.purpleLight}`, background: k === "" ? "transparent" : C.purple, color: C.gold, fontSize: 20, fontWeight: 700, cursor: k === "" ? "default" : "pointer" }}>{k}</button>
              ))}
            </div>
            {error && <p style={{ color: C.redLight, textAlign: "center", marginBottom: 8, fontSize: 12 }}>{error}</p>}
            <Btn onClick={attempt} disabled={pin.length < 4} style={{ width: "100%" }}>Login →</Btn>
          </>
        )}
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
};const OrderPanel = ({ activeTable, setActiveTable, tables, setTables, menu, sides, userId, addNotification, onBack, showBillButton = true }) => {
  const [selectedCat, setSelectedCat] = useState("Starters");
  const [sidesPicker, setSidesPicker] = useState(null);

  const syncActive = (tableId, updater) => {
    setTables(prev => prev.map(t => t.id === tableId ? updater(t) : t));
    setActiveTable(prev => prev ? updater(prev) : prev);
  };

  const addItem = (item) => {
    if (item.stock === 0) return;
    if (item.hasSides) { setSidesPicker(item); return; }
    syncActive(activeTable.id, t => {
      const existing = t.order.find(o => o.id === item.id && !o.sides);
      return { ...t, order: existing ? t.order.map(o => (o.id === item.id && !o.sides) ? { ...o, qty: o.qty + 1 } : o) : [...t.order, { ...item, qty: 1, sides: null, orderKey: Date.now() + Math.random() }] };
    });
  };

  const confirmSides = (ids) => {
    const item = sidesPicker;
    const chosenSides = ids.map(id => sides.find(s => s.id === id));
    syncActive(activeTable.id, t => ({ ...t, order: [...t.order, { ...item, qty: 1, sides: chosenSides, orderKey: Date.now() + Math.random() }] }));
    setSidesPicker(null);
  };

  const removeLine = (key) => {
    syncActive(activeTable.id, t => ({ ...t, order: t.order.map(o => o.orderKey === key ? { ...o, qty: o.qty - 1 } : o).filter(o => o.qty > 0) }));
  };

  const sendToKitchen = () => {
    syncActive(activeTable.id, t => ({ ...t, orderSentAt: nowTime() }));
    addNotification(`${activeTable.isTakeaway ? "Takeaway " + activeTable.takeawayNumber : "Table " + activeTable.id} order sent to kitchen`);
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
            <button key={cat} onClick={() => setSelectedCat(cat)} style={{ width: "100%", padding: "16px 4px", background: selectedCat === cat ? C.purple : "transparent", color: selectedCat === cat ? C.gold : C.goldPale, border: "none", borderLeft: `3px solid ${selectedCat === cat ? C.gold : "transparent"}`, fontWeight: 700, fontSize: 11, cursor: "pointer", textAlign: "center", lineHeight: 1.3 }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredMenu.map(item => {
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
          })}
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
                    {o.sides && <div style={{ color: C.gray300, fontSize: 11 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.gold, fontSize: 12, fontWeight: 700 }}>{fmt(o.price * o.qty)}</span>
                    <button onClick={() => removeLine(o.orderKey)} style={{ background: "none", border: "none", color: C.redLight, fontWeight: 900, fontSize: 16, cursor: "pointer", padding: 0 }}>x</button>
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
};const WaiterView = ({ tables, setTables, menu, sides, user, addNotification }) => {
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
    const updated = { ...base, status: "occupied", guests: g, waiterId: user.id, order: [], openedAt: nowTime(), orderSentAt: null, reservation: null };
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
      order: [], orderSentAt: null, openedAt: nowTime(), reservation: null,
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
        tables={tables} setTables={setTables} menu={menu} sides={sides}
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
  const pending = tables.filter(t => t.status === "occupied" && t.orderSentAt && t.order.length > 0);
  const markReady = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    setMenu(prev => prev.map(m => { const o = table.order.find(x => x.id === m.id); return o ? { ...m, stock: Math.max(0, m.stock - o.qty) } : m; }));
    setSides(prev => prev.map(s => { const used = table.order.flatMap(o => o.sides || []).filter(x => x.id === s.id).length; return { ...s, stock: Math.max(0, s.stock - used) }; }));
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: "bill" } : t));
    const label = table.isTakeaway ? `Takeaway ${table.takeawayNumber}` : `Table ${tableId}`;
    addNotification(`${label} is ready!`);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.purpleDark }}>
      <TopBar user={user} />
      <div style={{ padding: 16 }}>
        <h2 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15 }}>🍳 ORDER QUEUE</h2>
        {pending.length === 0
          ? <div style={{ background: C.purple, borderRadius: 12, padding: 40, textAlign: "center" }}><div style={{ fontSize: 36 }}>✅</div><div style={{ color: C.goldPale, marginTop: 10 }}>All caught up!</div></div>
          : pending.map(t => (
            <div key={t.id} style={{ background: t.isTakeaway ? C.teal : C.purple, borderRadius: 12, padding: 16, border: `2px solid ${C.gold}`, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800, fontSize: 18 }}>{t.isTakeaway ? `🥡 ${t.takeawayNumber}` : `Table ${t.id}`}</div>
                  {t.isTakeaway && <div style={{ color: C.white, fontSize: 11 }}>{t.customerName}</div>}
                </div>
                <div style={{ color: C.goldPale, fontSize: 12 }}>Sent {t.orderSentAt}</div>
              </div>
              {t.order.map((o, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ color: C.goldPale, fontSize: 14, fontWeight: 700 }}>{o.qty}x {o.name}</div>
                  {o.sides && <div style={{ color: C.gray300, fontSize: 12, marginTop: 2 }}>↳ {o.sides.map(s => s.name).join(", ")}</div>}
                </div>
              ))}
              <Btn onClick={() => markReady(t.id)} color={C.greenLight} textColor={C.white} style={{ marginTop: 10, width: "100%" }}>✓ Mark Ready</Btn>
            </div>
          ))}

        <h2 style={{ color: C.gold, margin: "24px 0 12px", fontSize: 15 }}>📦 STOCK</h2>
        <div style={{ color: C.goldPale, fontSize: 12, marginBottom: 8, fontWeight: 700 }}>Menu Items</div>
        {menu.map(item => (
          <div key={item.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${item.stock === 0 ? C.red : item.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{item.name}</div><div style={{ color: stockColor(item.stock), fontSize: 11 }}>{item.stock === 0 ? "OUT" : item.stock <= 3 ? `⚠ ${item.stock} left` : `${item.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: Math.max(0, m.stock - 1) } : m))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(item.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{item.stock}</span>
              <button onClick={() => setMenu(p => p.map(m => m.id === item.id ? { ...m, stock: m.stock + 1 } : m))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
        <div style={{ color: C.goldPale, fontSize: 12, margin: "14px 0 8px", fontWeight: 700 }}>Sides</div>
        {sides.map(side => (
          <div key={side.id} style={{ background: C.purple, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, border: `1px solid ${side.stock === 0 ? C.red : side.stock <= 3 ? C.orange : C.purpleLight}` }}>
            <div><div style={{ color: C.goldPale, fontWeight: 700, fontSize: 13 }}>{side.name}</div><div style={{ color: stockColor(side.stock), fontSize: 11 }}>{side.stock === 0 ? "OUT OF STOCK" : side.stock <= 3 ? `⚠ ${side.stock} left` : `${side.stock} avail`}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSides(p => p.map(s => s.id === side.id ? { ...s, stock: Math.max(0, s.stock - 1) } : s))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.purpleLight, color: C.gold, fontWeight: 900, cursor: "pointer" }}>-</button>
              <span style={{ color: stockColor(side.stock), fontWeight: 800, minWidth: 22, textAlign: "center" }}>{side.stock}</span>
              <button onClick={() => setSides(p => p.map(s => s.id === side.id ? { ...s, stock: s.stock + 1 } : s))} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.gold, color: C.purple, fontWeight: 900, cursor: "pointer" }}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};const CashierView = ({ tables, setTables, user }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const billTables = tables.filter(t => t.status === "bill");
  const processPay = (tableId) => {
    setTables(prev => {
      const t = prev.find(x => x.id === tableId);
      if (t.isTakeaway) return prev.filter(x => x.id !== tableId);
      return prev.map(x => x.id === tableId ? { ...x, status: "free", guests: 0, waiterId: null, order: [], orderSentAt: null, openedAt: null, reservation: null } : x);
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
          <button onClick={() => processPay(selTable.id)} style={{ background: C.greenLight, color: C.white, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💵</span> Cash
          </button>
          <button onClick={() => processPay(selTable.id)} style={{ background: C.gold, color: C.purple, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💳</span> Card / Tap
          </button>
          <button onClick={() => processPay(selTable.id)} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 12, padding: "16px", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
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
};const FloorPlan = ({ tables, setTables, canReserve, addNotification }) => {
  const [selected, setSelected] = useState(null);
  const [reserveModal, setReserveModal] = useState(null);
  const [showTakeaway, setShowTakeaway] = useState(false);
  const [rName, setRName] = useState(""); const [rTime, setRTime] = useState(""); const [rGuests, setRGuests] = useState("2");

  const diningTables = tables.filter(t => !t.isTakeaway);
  const takeawayOrders = tables.filter(t => t.isTakeaway && t.status !== "free");
  const takeawayCount = takeawayOrders.length;
  const statusColor = (t) => ({ free: C.green, reserved: C.blue, bill: C.orange, occupied: C.purpleLight }[t.status] || C.purpleLight);
  const statusLabel = (t) => ({ free: "Free", reserved: "Reserved", bill: "Bill", occupied: "Active" }[t.status] || t.status);
  const selTable = selected ? tables.find(t => t.id === selected) : null;

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
      id: newId, status: "occupied", guests: 1, waiterId: null,
      order: [], orderSentAt: null, openedAt: nowTime(), reservation: null,
      isTakeaway: true, takeawayNumber: tkNumber, customerName,
    };
    setTables(prev => [...prev, newOrder]);
    setShowTakeaway(false);
    addNotification && addNotification(`Takeaway order ${tkNumber} created`);
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
              <div key={t.id} style={{ background: C.teal, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: C.gold, fontWeight: 800 }}>{t.takeawayNumber}</div>
                  <div style={{ color: C.white, fontSize: 11 }}>{t.customerName} · {t.openedAt}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: C.gold, fontWeight: 700 }}>{fmt(orderTotal(t.order))}</div>
                  <div style={{ color: C.white, fontSize: 11 }}>{t.status === "bill" ? "⏳ Bill" : `${t.order.length} items`}</div>
                </div>
              </div>
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

const ReceptionistView = ({ tables, setTables, user, addNotification }) => (
  <div style={{ minHeight: "100vh", background: C.purpleDark }}>
    <TopBar user={user} />
    <div style={{ padding: 16 }}>
      <h2 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, letterSpacing: 1 }}>🛎️ FLOOR PLAN</h2>
      <FloorPlan tables={tables} setTables={setTables} canReserve={true} addNotification={addNotification} />
    </div>
  </div>
);

const ManagerView = ({ tables, setTables, menu, setMenu, sides, user, addNotification }) => {
  const [tab, setTab] = useState("floor");
  const [activeTable, setActiveTable] = useState(null);
  const [openingTable, setOpeningTable] = useState(null);
  const [showOrder, setShowOrder] = useState(false);
  const [showTakeaway, setShowTakeaway] = useState(false);

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
    const updated = { ...base, status: "occupied", guests: g, waiterId: user.id, order: [], openedAt: nowTime(), orderSentAt: null, reservation: null };
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
      order: [], orderSentAt: null, openedAt: nowTime(), reservation: null,
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
        tables={tables} setTables={setTables} menu={menu} sides={sides}
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
        {[["floor","Floor"], ["tables","Tables"], ["staff","Staff"], ["stock","Stock"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 2px", background: tab === k ? C.gold : C.purple, color: tab === k ? C.purple : C.goldPale, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: 16 }}>
        {tab === "floor" && <FloorPlan tables={tables} setTables={setTables} canReserve={true} addNotification={addNotification} />}
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
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [sides, setSides] = useState(SIDES);
  const [notification, setNotification] = useState(null);

  const addNotification = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  if (!user) return <PinLogin onLogin={setUser} />;

  const props = { tables, setTables, menu, setMenu, sides, setSides, user, addNotification };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: C.purpleDark }}>
      {notification && <Notification msg={notification} onClose={() => setNotification(null)} />}
      {user.role === "receptionist" && <ReceptionistView {...props} />}
      {user.role === "waiter" && <WaiterView {...props} />}
      {user.role === "kitchen" && <KitchenView {...props} />}
      {user.role === "cashier" && <CashierView {...props} />}
      {user.role === "manager" && <ManagerView {...props} />}
      <button onClick={() => setUser(null)} style={{ position: "fixed", bottom: 16, right: 16, zIndex: 500, background: C.purple, border: `2px solid ${C.gold}`, borderRadius: 50, color: C.gold, fontWeight: 700, fontSize: 11, cursor: "pointer", padding: "7px 13px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>Logout</button>
    </div>
  );
                                                             }
