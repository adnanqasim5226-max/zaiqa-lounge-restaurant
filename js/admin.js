// ==============================================================================
// ADMIN DASHBOARD JAVASCRIPT
// Part B: Admin Login, Sidebar, Order Status Updates (Pending -> Preparing -> Delivered)
// ==============================================================================

(function () {
  const state = {
    isLoggedIn: false,
    orders: [],
    filter: "All",
    searchQuery: ""
  };

  const elements = {};

  function initElements() {
    elements.loginView = document.getElementById("admin-login-view");
    elements.dashboardView = document.getElementById("admin-dashboard-view");
    elements.loginForm = document.getElementById("admin-login-form");
    elements.emailInput = document.getElementById("admin-email");
    elements.passwordInput = document.getElementById("admin-password");
    elements.logoutBtn = document.getElementById("admin-logout-btn");
    elements.refreshBtn = document.getElementById("refresh-orders-btn");
    elements.tableBody = document.getElementById("orders-table-body");
    elements.noOrdersNotice = document.getElementById("no-orders-notice");
    elements.searchInput = document.getElementById("search-orders");
    elements.sidebarOrderCount = document.getElementById("sidebar-order-count");

    // Stats
    elements.statTotal = document.getElementById("stat-total");
    elements.statPending = document.getElementById("stat-pending");
    elements.statPreparing = document.getElementById("stat-preparing");
    elements.statDelivered = document.getElementById("stat-delivered");
  }

  // -------------------------------------------------------------
  // 1. AUTHENTICATION (Part B Requirement 5)
  // -------------------------------------------------------------
  function checkAuth() {
    const session = sessionStorage.getItem("admin_authenticated");
    if (session === "true") {
      state.isLoggedIn = true;
      showDashboard();
    } else {
      state.isLoggedIn = false;
      showLogin();
    }
  }

  function handleLogin(e) {
    if (e) e.preventDefault();
    const email = elements.emailInput ? elements.emailInput.value.trim() : "";
    const pass = elements.passwordInput ? elements.passwordInput.value.trim() : "";

    const validEmail = (window.CONFIG && window.CONFIG.admin && window.CONFIG.admin.email) || "admin@zaiqa.com";
    const validPass = (window.CONFIG && window.CONFIG.admin && window.CONFIG.admin.password) || "admin123";

    if (email === validEmail && pass === validPass) {
      sessionStorage.setItem("admin_authenticated", "true");
      state.isLoggedIn = true;
      showDashboard();
      showAdminToast("Welcome back, Admin!", "success");
    } else {
      showAdminToast("Invalid email or password!", "error");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_authenticated");
    state.isLoggedIn = false;
    showLogin();
    showAdminToast("Logged out successfully.", "info");
  }

  function showLogin() {
    if (elements.loginView) elements.loginView.classList.remove("hidden");
    if (elements.dashboardView) elements.dashboardView.classList.add("hidden");
  }

  function showDashboard() {
    if (elements.loginView) elements.loginView.classList.add("hidden");
    if (elements.dashboardView) elements.dashboardView.classList.remove("hidden");
    loadOrders();
  }

  // -------------------------------------------------------------
  // 2. FETCH & RENDER ORDERS
  // -------------------------------------------------------------
  async function loadOrders() {
    if (!window.DB) return;

    if (elements.refreshBtn) {
      elements.refreshBtn.innerHTML = `<span>🔄</span> <span>Loading...</span>`;
      elements.refreshBtn.disabled = true;
    }

    try {
      const res = await window.DB.getOrders();
      state.orders = res.orders || [];
      console.log("Loaded orders:", state.orders);
      renderOrders();
      updateStats();
    } catch (err) {
      console.error("Error loading orders:", err);
      showAdminToast("Failed to fetch orders from database.", "error");
    } finally {
      if (elements.refreshBtn) {
        elements.refreshBtn.innerHTML = `<span>🔄</span> <span>Refresh</span>`;
        elements.refreshBtn.disabled = false;
      }
    }
  }

  function renderOrders() {
    if (!elements.tableBody) return;

    // Filter by status & search
    let filtered = state.orders;

    if (state.filter !== "All") {
      filtered = filtered.filter(o => (o.status || "Pending").toLowerCase() === state.filter.toLowerCase());
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").toLowerCase().includes(q) ||
        (o.customer_address || "").toLowerCase().includes(q) ||
        (o.id || "").toString().toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      elements.tableBody.innerHTML = "";
      if (elements.noOrdersNotice) elements.noOrdersNotice.classList.remove("hidden");
      return;
    }

    if (elements.noOrdersNotice) elements.noOrdersNotice.classList.add("hidden");

    elements.tableBody.innerHTML = filtered.map(order => {
      const currentStatus = order.status || "Pending";
      const timeStr = order.created_at ? new Date(order.created_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }) : "Just now";
      
      // Parse dishes
      let dishesHtml = "";
      try {
        const dishes = typeof order.dishes === "string" ? JSON.parse(order.dishes) : (order.dishes || []);
        dishesHtml = dishes.map(d => `
          <div class="text-xs text-slate-300">
            <span class="font-bold text-white">${d.name}</span> × ${d.quantity}
            <span class="text-slate-400 text-[11px]">(Rs. ${(d.price * d.quantity).toLocaleString()})</span>
          </div>
        `).join("");
      } catch (e) {
        dishesHtml = `<div class="text-xs text-slate-400">${order.dishes}</div>`;
      }

      const shortId = (order.id || "").toString().slice(0, 8);

      return `
        <tr class="hover:bg-slate-900/60 transition-colors">
          <!-- Order ID & Time -->
          <td class="px-6 py-4">
            <div class="font-mono text-xs font-bold text-orange-400">#${shortId}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">${timeStr}</div>
            <a href="track.html?id=${encodeURIComponent(order.id)}" target="_blank" class="inline-flex items-center gap-1 text-[11px] text-amber-400/90 hover:text-amber-300 hover:underline mt-1 font-sans">
              <span>🔍</span>
              <span>Track</span>
            </a>
          </td>

          <!-- Customer Info -->
          <td class="px-6 py-4">
            <div class="font-bold text-white text-sm">${order.customer_name}</div>
            <div class="text-xs text-amber-300 font-mono mt-0.5">📞 ${order.customer_phone}</div>
            <div class="text-[11px] text-slate-400 mt-1 max-w-xs truncate" title="${order.customer_address}">
              📍 ${order.customer_address}
            </div>
            ${order.special_instructions ? `
              <div class="text-[10px] text-orange-300/80 mt-1 italic">
                Note: ${order.special_instructions}
              </div>` : ''}
          </td>

          <!-- Dishes & Quantities -->
          <td class="px-6 py-4">
            <div class="space-y-1">
              ${dishesHtml}
            </div>
          </td>

          <!-- Total Amount -->
          <td class="px-6 py-4">
            <div class="font-extrabold text-white text-sm">
              Rs. ${Number(order.total_price || 0).toLocaleString()}
            </div>
          </td>

          <!-- Change Order Status (Part B Requirement 6: Pending -> Preparing -> Delivered) -->
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <select 
                onchange="window.Admin.changeStatus('${order.id}', this.value)"
                class="px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${
                  currentStatus === 'Delivered' 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                    : currentStatus === 'Preparing'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-600'
                    : 'bg-amber-950/80 text-amber-300 border-amber-600'
                }"
              >
                <option value="Pending" ${currentStatus === "Pending" ? "selected" : ""}>⏳ Pending</option>
                <option value="Preparing" ${currentStatus === "Preparing" ? "selected" : ""}>🍳 Preparing</option>
                <option value="Delivered" ${currentStatus === "Delivered" ? "selected" : ""}>✅ Delivered</option>
              </select>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  // -------------------------------------------------------------
  // 3. CHANGE STATUS (Part B Requirement 6)
  // Saves to Supabase and persists on refresh
  // -------------------------------------------------------------
  async function changeStatus(orderId, newStatus) {
    console.log(`Updating order ${orderId} status to:`, newStatus);
    showAdminToast(`Updating status to ${newStatus}...`, "info");

    try {
      const res = await window.DB.updateStatus(orderId, newStatus);
      
      // Update local state
      const target = state.orders.find(o => o.id === orderId);
      if (target) {
        target.status = newStatus;
      }

      updateStats();
      renderOrders();

      showAdminToast(`Order status saved as "${newStatus}" in Supabase!`, "success");
    } catch (err) {
      console.error("Status update error:", err);
      showAdminToast("Failed to update status in Supabase.", "error");
    }
  }

  // -------------------------------------------------------------
  // 4. STATS & FILTERS
  // -------------------------------------------------------------
  function updateStats() {
    const total = state.orders.length;
    const pending = state.orders.filter(o => (o.status || "").toLowerCase() === "pending").length;
    const preparing = state.orders.filter(o => (o.status || "").toLowerCase() === "preparing").length;
    const delivered = state.orders.filter(o => (o.status || "").toLowerCase() === "delivered").length;

    if (elements.statTotal) elements.statTotal.textContent = total;
    if (elements.statPending) elements.statPending.textContent = pending;
    if (elements.statPreparing) elements.statPreparing.textContent = preparing;
    if (elements.statDelivered) elements.statDelivered.textContent = delivered;
    if (elements.sidebarOrderCount) elements.sidebarOrderCount.textContent = total;
  }

  function setFilter(filterName) {
    state.filter = filterName;
    document.querySelectorAll(".status-filter-btn").forEach(btn => {
      if (btn.dataset.filter === filterName) {
        btn.className = "status-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-orange-600 text-white shadow-md";
      } else {
        btn.className = "status-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-300 hover:text-white";
      }
    });
    renderOrders();
  }

  function showAdminToast(message, type = "info") {
    let container = document.getElementById("admin-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "admin-toast-container";
      container.className = "fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-emerald-600 text-white",
      error: "bg-red-600 text-white",
      info: "bg-slate-800 text-slate-100 border border-slate-700"
    };

    toast.className = `p-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium ${bgColors[type] || bgColors.info} pointer-events-auto`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initElements();
    checkAuth();

    if (elements.loginForm) {
      elements.loginForm.addEventListener("submit", handleLogin);
    }

    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener("click", handleLogout);
    }

    if (elements.refreshBtn) {
      elements.refreshBtn.addEventListener("click", loadOrders);
    }

    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderOrders();
      });
    }
  });

  window.Admin = {
    changeStatus,
    setFilter,
    loadOrders
  };
})();

