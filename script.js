// ---------- Data ----------
const dishes = [
  { id: 1,  name: "Margherita Pizza",   cat: "Pizza",    price: 299, rating: 4.6, emoji: "🍕", desc: "Classic tomato, mozzarella and fresh basil." },
  { id: 2,  name: "Pepperoni Pizza",    cat: "Pizza",    price: 399, rating: 4.7, emoji: "🍕", desc: "Loaded with spicy pepperoni and cheese." },
  { id: 3,  name: "Cheese Burger",      cat: "Burgers",  price: 179, rating: 4.4, emoji: "🍔", desc: "Juicy patty, cheddar, lettuce and house sauce." },
  { id: 4,  name: "Crispy Chicken Burger", cat: "Burgers", price: 199, rating: 4.5, emoji: "🍔", desc: "Crunchy fried chicken with creamy mayo." },
  { id: 5,  name: "Chicken Biryani",    cat: "Indian",   price: 289, rating: 4.8, emoji: "🍛", desc: "Fragrant basmati rice with tender spiced chicken." },
  { id: 6,  name: "Paneer Butter Masala", cat: "Indian", price: 249, rating: 4.5, emoji: "🥘", desc: "Soft paneer cubes in a rich buttery gravy." },
  { id: 7,  name: "Masala Dosa",        cat: "Indian",   price: 119, rating: 4.6, emoji: "🌯", desc: "Crispy dosa stuffed with spiced potato." },
  { id: 8,  name: "Veg Hakka Noodles",  cat: "Chinese",  price: 189, rating: 4.3, emoji: "🍜", desc: "Wok-tossed noodles with fresh vegetables." },
  { id: 9,  name: "Chicken Manchurian", cat: "Chinese",  price: 229, rating: 4.4, emoji: "🥡", desc: "Crispy chicken in tangy Indo-Chinese sauce." },
  { id: 10, name: "Salmon Sushi Roll",  cat: "Sushi",    price: 449, rating: 4.7, emoji: "🍣", desc: "Fresh salmon, rice and nori, 8 pieces." },
  { id: 11, name: "Chocolate Brownie",  cat: "Desserts", price: 129, rating: 4.7, emoji: "🍫", desc: "Warm fudgy brownie with chocolate drizzle." },
  { id: 12, name: "Vanilla Ice Cream",  cat: "Desserts", price: 99,  rating: 4.3, emoji: "🍨", desc: "Creamy vanilla scoops with a crunchy cone." },
  { id: 13, name: "Cold Coffee",        cat: "Drinks",   price: 109, rating: 4.4, emoji: "🥤", desc: "Chilled blended coffee with ice cream." },
  { id: 14, name: "Fresh Lime Soda",    cat: "Drinks",   price: 69,  rating: 4.2, emoji: "🍋", desc: "Refreshing sweet and salty lime soda." },
  { id: 15, name: "Veg Club Sandwich",  cat: "Snacks",   price: 139, rating: 4.3, emoji: "🥪", desc: "Triple-layer toasted sandwich with fresh veggies." },
  { id: 16, name: "French Fries",       cat: "Snacks",   price: 99,  rating: 4.2, emoji: "🍟", desc: "Golden crispy fries with peri-peri seasoning." }
];

const DELIVERY_FEE = 40;
const FREE_DELIVERY_ABOVE = 500;

// ---------- State ----------
let activeCategory = "All";
let searchText = "";
let cart = loadCart();

// ---------- Elements ----------
const $ = (id) => document.getElementById(id);
const menuGrid = $("menuGrid");
const filtersEl = $("filters");
const emptyMsg = $("emptyMsg");
const cartEl = $("cart");
const overlay = $("overlay");
const cartItemsEl = $("cartItems");
const cartCount = $("cartCount");
const toastEl = $("toast");

// ---------- Helpers ----------
const rupee = (n) => "₹" + n.toLocaleString("en-IN");

function loadCart() {
  try { return JSON.parse(localStorage.getItem("qb_cart")) || []; }
  catch { return []; }
}
function saveCart() {
  try { localStorage.setItem("qb_cart", JSON.stringify(cart)); } catch {}
}

let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

// ---------- Filters ----------
function renderFilters() {
  const cats = ["All", ...new Set(dishes.map((d) => d.cat))];
  filtersEl.innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCategory ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  activeCategory = btn.dataset.cat;
  renderFilters();
  renderMenu();
});

// ---------- Menu ----------
function renderMenu() {
  const q = searchText.trim().toLowerCase();
  const list = dishes.filter((d) => {
    const matchCat = activeCategory === "All" || d.cat === activeCategory;
    const matchText = !q || d.name.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q);
    return matchCat && matchText;
  });

  emptyMsg.hidden = list.length > 0;
  menuGrid.innerHTML = list
    .map(
      (d) => `
      <article class="card">
        <div class="card-img">${d.emoji}</div>
        <div class="card-body">
          <div class="card-top">
            <h3>${d.name}</h3>
            <span class="rating">★ ${d.rating}</span>
          </div>
          <p class="card-desc">${d.desc}</p>
          <div class="card-foot">
            <span class="price">${rupee(d.price)}</span>
            <button class="add-btn" data-id="${d.id}">ADD</button>
          </div>
        </div>
      </article>`
    )
    .join("");
}

menuGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  addToCart(Number(btn.dataset.id));
});

// ---------- Search ----------
$("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  searchText = $("searchInput").value;
  activeCategory = "All";
  renderFilters();
  renderMenu();
  $("menu").scrollIntoView({ behavior: "smooth" });
});
$("searchInput").addEventListener("input", (e) => {
  searchText = e.target.value;
  renderMenu();
});

// ---------- Cart ----------
function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const dish = dishes.find((d) => d.id === id);
  showToast(`${dish.name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  cartCount.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">🛒<br />Your cart is empty.<br />Add something tasty!</p>`;
  } else {
    cartItemsEl.innerHTML = cart
      .map((i) => {
        const d = dishes.find((x) => x.id === i.id);
        return `
        <div class="cart-item">
          <div class="emoji">${d.emoji}</div>
          <div class="info">
            <h4>${d.name}</h4>
            <span>${rupee(d.price)} × ${i.qty} = ${rupee(d.price * i.qty)}</span>
          </div>
          <div class="qty">
            <button data-act="dec" data-id="${i.id}" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button data-act="inc" data-id="${i.id}" aria-label="Increase">+</button>
          </div>
        </div>`;
      })
      .join("");
  }

  const subtotal = cart.reduce((s, i) => s + dishes.find((d) => d.id === i.id).price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  $("subtotal").textContent = rupee(subtotal);
  $("delivery").textContent = subtotal >= FREE_DELIVERY_ABOVE ? "FREE" : rupee(delivery);
  $("total").textContent = rupee(subtotal + delivery);
  $("checkoutBtn").disabled = cart.length === 0;
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  changeQty(Number(btn.dataset.id), btn.dataset.act === "inc" ? 1 : -1);
});

function openCart() {
  cartEl.classList.add("open");
  overlay.classList.add("show");
  cartEl.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartEl.classList.remove("open");
  overlay.classList.remove("show");
  cartEl.setAttribute("aria-hidden", "true");
}
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

$("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return;
  cart = [];
  saveCart();
  renderCart();
  closeCart();
  showToast("🎉 Order placed! Your food is on the way.");
});

// ---------- Mobile nav ----------
const nav = $("nav");
$("menuToggle").addEventListener("click", () => nav.classList.toggle("open"));
nav.addEventListener("click", (e) => { if (e.target.tagName === "A") nav.classList.remove("open"); });

// ---------- Init ----------
renderFilters();
renderMenu();
renderCart();