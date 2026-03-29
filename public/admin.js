const adminView = document.getElementById("adminView");
const deniedView = document.getElementById("deniedView");
const productsAdmin = document.getElementById("productsAdmin");
const ordersAdmin = document.getElementById("ordersAdmin");
const adminsAdmin = document.getElementById("adminsAdmin");

const params = new URLSearchParams(location.search);
const adminUid = params.get("uid") || "";
const adminSig = params.get("sig") || "";

let store = { banner: {}, products: [], orders: [], admins: [] };

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-admin-uid": adminUid,
    "x-admin-sig": adminSig
  };
}

function parseNumber(value) {
  const cleaned = String(value || "").trim().replace(",", ".");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

async function checkAccess() {
  const res = await fetch(`/api/admin/auth?uid=${encodeURIComponent(adminUid)}&sig=${encodeURIComponent(adminSig)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    adminView.classList.add("hidden");
    deniedView.classList.remove("hidden");
    return false;
  }
  adminView.classList.remove("hidden");
  deniedView.classList.add("hidden");
  return true;
}

async function loadStore() {
  const res = await fetch("/api/admin/store", { headers: authHeaders() });
  if (!res.ok) {
    alert("Нет доступа к админке");
    return;
  }
  store = await res.json();
  fillBanner();
  renderAdmins();
  renderProducts();
  renderOrders();
}

function fillBanner() {
  document.getElementById("bannerEnabled").value = String(store.banner.enabled);
  document.getElementById("bannerText").value = store.banner.text || "";
  document.getElementById("bannerSubtext").value = store.banner.subtext || "";
  document.getElementById("bannerCtaText").value = store.banner.ctaText || "";
}

function renderAdmins() {
  if (!adminsAdmin) return;
  const admins = store.admins || [];
  if (!admins.length) {
    adminsAdmin.innerHTML = `<div class="admin-item">Админов пока нет</div>`;
    return;
  }

  adminsAdmin.innerHTML = "";
  admins.forEach(id => {
    const card = document.createElement("div");
    card.className = "admin-item";
    const isCurrent = String(id) === String(adminUid);
    card.innerHTML = `
      <div class="admin-item__top">
        <div>
          <strong>ID: ${escapeHtml(id)}</strong>
          <div class="tiny">${isCurrent ? "Это ты" : "Администратор магазина"}</div>
        </div>
        <div class="admin-actions">
          <button class="admin-mini-btn copy-id">Скопировать ID</button>
        </div>
      </div>
    `;
    card.querySelector(".copy-id").onclick = async () => {
      try {
        await navigator.clipboard.writeText(String(id));
        alert("ID скопирован");
      } catch {
        alert("Не удалось скопировать");
      }
    };
    adminsAdmin.appendChild(card);
  });
}

function renderProducts() {
  if (!store.products.length) {
    productsAdmin.innerHTML = `<div class="admin-item">Товаров пока нет</div>`;
    return;
  }

  productsAdmin.innerHTML = "";
  store.products.forEach(product => {
    const card = document.createElement("div");
    card.className = "admin-item";
    card.innerHTML = `
      <div class="admin-item__top">
        <div>
          <strong>${escapeHtml(product.title)}</strong>
          <div class="tiny">${escapeHtml(product.category || "")}</div>
          <div class="tiny">$${product.price} ${product.oldPrice ? ` / <span style="text-decoration:line-through">$${product.oldPrice}</span>` : ""}</div>
          <div class="tiny">Скидка: ${product.discount || 0}%</div>
          <div class="tiny">Размеры: ${(product.sizes || []).join(", ")}</div>
          <div class="tiny">Статус: ${product.inStock ? "В наличии" : "Нет в наличии"} ${product.featured ? "• Хит" : ""}</div>
        </div>
        <div class="admin-actions">
          <button class="admin-mini-btn toggle-stock">${product.inStock ? "Сделать out of stock" : "Вернуть в наличие"}</button>
          <button class="admin-mini-btn toggle-featured">${product.featured ? "Убрать хит" : "Сделать хитом"}</button>
          <button class="admin-mini-btn danger delete-product">Удалить</button>
        </div>
      </div>
      <div class="tiny">${escapeHtml(product.description || "")}</div>
    `;

    card.querySelector(".toggle-stock").onclick = () => updateProduct(product.id, { inStock: !product.inStock });
    card.querySelector(".toggle-featured").onclick = () => updateProduct(product.id, { featured: !product.featured });
    card.querySelector(".delete-product").onclick = () => deleteProduct(product.id);
    productsAdmin.appendChild(card);
  });
}

function renderOrders() {
  if (!store.orders.length) {
    ordersAdmin.innerHTML = `<div class="admin-item">Заказов пока нет</div>`;
    return;
  }

  ordersAdmin.innerHTML = "";
  store.orders.forEach(order => {
    const card = document.createElement("div");
    card.className = "admin-item";
    const items = (order.items || []).map(item => `${item.title} / ${item.size} / x${item.qty}`).join("<br>");
    card.innerHTML = `
      <strong>Заказ ${escapeHtml(order.id || "")}</strong>
      <div class="tiny">${escapeHtml(order.createdAt || "")}</div>
      <div style="margin-top:10px">${items}</div>
      <div style="margin-top:10px"><strong>Итого: $${order.total || 0}</strong></div>
    `;
    ordersAdmin.appendChild(card);
  });
}

async function updateProduct(id, payload) {
  await fetch(`/api/admin/products/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  await loadStore();
}

async function deleteProduct(id) {
  if (!confirm("Удалить товар?")) return;
  await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
    headers: {
      "x-admin-uid": adminUid,
      "x-admin-sig": adminSig
    }
  });
  await loadStore();
}

async function saveBanner() {
  const payload = {
    enabled: document.getElementById("bannerEnabled").value === "true",
    text: document.getElementById("bannerText").value.trim(),
    subtext: document.getElementById("bannerSubtext").value.trim(),
    ctaText: document.getElementById("bannerCtaText").value.trim()
  };
  await fetch("/api/admin/banner", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  alert("Баннер сохранен");
  await loadStore();
}

async function addProduct() {
  const payload = {
    title: document.getElementById("title").value.trim(),
    price: parseNumber(document.getElementById("price").value),
    oldPrice: parseNumber(document.getElementById("oldPrice").value),
    discount: parseNumber(document.getElementById("discount").value),
    category: document.getElementById("category").value.trim(),
    image: document.getElementById("image").value.trim() || "/assets/brand-avatar.png",
    sizes: document.getElementById("sizes").value.split(",").map(v => v.trim()).filter(Boolean),
    badge: document.getElementById("badge").value.trim(),
    description: document.getElementById("description").value.trim(),
    inStock: document.getElementById("inStock").value === "true",
    featured: document.getElementById("featured").value === "true"
  };

  if (!payload.title || !payload.price) {
    alert("Заполни название и цену");
    return;
  }

  await fetch("/api/admin/products", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  document.querySelectorAll(".admin-form input, .admin-form textarea").forEach(el => {
    if (el.id !== "bannerText" && el.id !== "bannerSubtext" && el.id !== "bannerCtaText") el.value = "";
  });
  document.getElementById("inStock").value = "true";
  document.getElementById("featured").value = "false";

  alert("Товар добавлен");
  await loadStore();
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

document.getElementById("reloadBtn").onclick = loadStore;
document.getElementById("saveBannerBtn").onclick = saveBanner;
document.getElementById("addProductBtn").onclick = addProduct;

(async () => {
  const ok = await checkAccess();
  if (ok) await loadStore();
})();
