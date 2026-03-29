require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = String(process.env.ADMIN_KEY || "trendsetter_admin_2026").trim();
const ADMIN_CHAT_ID = String(process.env.ADMIN_CHAT_ID || "").replace(/\s+/g, "").trim();
const ADMIN_IDS_ENV = String(process.env.ADMIN_IDS || "").trim();
const DB_FILE = path.join(__dirname, "data", "store.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function normalizeId(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function envAdmins() {
  const ids = ADMIN_IDS_ENV.split(",").map(v => normalizeId(v)).filter(Boolean);
  if (ADMIN_CHAT_ID && !ids.includes(ADMIN_CHAT_ID)) ids.unshift(ADMIN_CHAT_ID);
  return [...new Set(ids)];
}

function defaultStore() {
  return {
    banner: { enabled: true, text: "Новая коллекция уже в магазине • Скидки до 25% • Быстрая доставка", subtext: "TRENDSETTER MARKET — dark streetwear vibe", ctaText: "Смотреть дроп" },
    products: [],
    orders: [],
    admins: []
  };
}

function writeStore(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

function readStore() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    data = defaultStore();
    writeStore(data);
  }
  data.admins = Array.isArray(data.admins) ? data.admins.map(v => normalizeId(v)).filter(Boolean) : [];
  return data;
}

function allAdmins() {
  return [...new Set([...envAdmins(), ...readStore().admins])];
}

function signAdmin(userId) {
  return crypto.createHmac("sha256", ADMIN_KEY).update(normalizeId(userId)).digest("hex");
}

function requireAdmin(req, res, next) {
  const uid = normalizeId(req.headers["x-admin-uid"] || req.query.uid || "");
  const sig = String(req.headers["x-admin-sig"] || req.query.sig || "").trim();
  if (!uid || !sig) return res.status(401).json({ ok: false, message: "Нет админ-подписи" });
  if (sig !== signAdmin(uid) || !allAdmins().includes(uid)) {
    return res.status(401).json({ ok: false, message: "Нет доступа" });
  }
  req.adminUid = uid;
  next();
}

app.get("/api/store", (req, res) => {
  const store = readStore();
  res.json({ banner: store.banner, products: store.products });
});

app.post("/api/order", (req, res) => {
  const store = readStore();
  const order = req.body || {};
  order.id = "ord_" + Date.now();
  order.createdAt = new Date().toISOString();
  store.orders.unshift(order);
  writeStore(store);
  res.json({ ok: true, orderId: order.id });
});

app.get("/api/admin/auth", requireAdmin, (req, res) => res.json({ ok: true, adminUid: req.adminUid }));
app.get("/api/admin/store", requireAdmin, (req, res) => {
  const store = readStore();
  res.json({ ...store, admins: allAdmins() });
});
app.put("/api/admin/banner", requireAdmin, (req, res) => {
  const store = readStore();
  store.banner = { ...store.banner, ...req.body };
  writeStore(store);
  res.json({ ok: true, banner: store.banner });
});
app.post("/api/admin/products", requireAdmin, (req, res) => {
  const store = readStore();
  const product = req.body || {};
  product.id = product.id || "p_" + Date.now();
  store.products.unshift(product);
  writeStore(store);
  res.json({ ok: true, product });
});
app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const store = readStore();
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ ok: false, message: "Товар не найден" });
  store.products[idx] = { ...store.products[idx], ...req.body, id: store.products[idx].id };
  writeStore(store);
  res.json({ ok: true, product: store.products[idx] });
});
app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const store = readStore();
  store.products = store.products.filter(p => p.id !== req.params.id);
  writeStore(store);
  res.json({ ok: true });
});

app.get("/admin.html", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
