// ==============================================================================
// ORDER TRACKER SCRIPT (Zaiqa Lounge & Grill)
// Allows customers to look up their order in real-time via Order ID or Phone.
// Powered by Supabase 'orders' table with local storage fallback.
// ==============================================================================

(function () {
  let currentOrderId = null;
  let autoRefreshTimer = null;

  document.addEventListener("DOMContentLoaded", () => {
    initTracker();
  });

  function initTracker() {
    const trackForm = document.getElementById("track-form");
    const trackInput = document.getElementById("track-query");
    const refreshBtn = document.getElementById("refresh-tracker-btn");
    const copyIdBtn = document.getElementById("copy-order-id-btn");

    // 1. Render recent orders stored in device
    renderRecentOrderPills();

    // 2. Check URL query string (e.g. track.html?id=ORD-12345 or UUID)
    const urlParams = new URLSearchParams(window.location.search);
    const queryId = urlParams.get("id");
    if (queryId && queryId.trim()) {
      trackInput.value = queryId.trim();
      trackOrder(queryId.trim());
    }

    // 3. Form submit handler
    if (trackForm) {
      trackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = trackInput.value.trim();
        if (!query) {
          if (window.App && window.App.showToast) {
            window.App.showToast("Please enter an Order ID or Phone number!", "warning");
          }
          return;
        }
        trackOrder(query);
      });
    }

    // 4. Refresh Button
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        if (currentOrderId) {
          refreshBtn.classList.add("animate-spin");
          trackOrder(currentOrderId).finally(() => {
            setTimeout(() => refreshBtn.classList.remove("animate-spin"), 600);
          });
        }
      });
    }

    // 5. Copy Order ID Button
    if (copyIdBtn) {
      copyIdBtn.addEventListener("click", () => {
        if (currentOrderId && navigator.clipboard) {
          navigator.clipboard.writeText(currentOrderId).then(() => {
            if (window.App && window.App.showToast) {
              window.App.showToast("Order ID copied to clipboard!", "success");
            }
          });
        }
      });
    }
  }

  // -------------------------------------------------------------
  // Render recent orders pill buttons
  // -------------------------------------------------------------
  function renderRecentOrderPills() {
    const pillsContainer = document.getElementById("recent-order-pills");
    const bar = document.getElementById("recent-orders-bar");
    if (!pillsContainer || !bar) return;

    const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
    if (localOrders.length === 0) {
      bar.classList.add("hidden");
      return;
    }

    bar.classList.remove("hidden");
    pillsContainer.innerHTML = localOrders.slice(0, 3).map(order => {
      const shortId = order.id ? (order.id.length > 12 ? order.id.substring(0, 8) + "..." : order.id) : "Recent";
      const total = order.total_price || order.totalAmount || 0;
      return `
        <button 
          type="button" 
          onclick="window.Tracker.selectRecent('${order.id}')"
          class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-600/20 text-slate-300 hover:text-orange-400 border border-slate-700 hover:border-orange-500/50 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>📦</span>
          <span>${shortId}</span>
          <span class="text-[10px] text-amber-400 font-bold">(Rs. ${Number(total).toLocaleString()})</span>
        </button>
      `;
    }).join("");
  }

  // -------------------------------------------------------------
  // Main Track Function
  // -------------------------------------------------------------
  async function trackOrder(query) {
    const idleState = document.getElementById("tracker-idle-state");
    const loadingState = document.getElementById("tracker-loading-state");
    const notFoundState = document.getElementById("tracker-not-found-state");
    const orderCard = document.getElementById("tracker-order-card");
    const errorMsg = document.getElementById("tracker-error-msg");

    // Reset view
    if (idleState) idleState.classList.add("hidden");
    if (notFoundState) notFoundState.classList.add("hidden");
    if (orderCard) orderCard.classList.add("hidden");
    if (loadingState) loadingState.classList.remove("hidden");

    try {
      console.log("🔍 Looking up order for query:", query);
      const res = await window.DB.getOrderById(query);

      if (loadingState) loadingState.classList.add("hidden");

      if (!res || !res.success || !res.order) {
        if (notFoundState) {
          notFoundState.classList.remove("hidden");
          if (errorMsg) {
            errorMsg.textContent = res && res.message ? res.message : `No order found matching "${query}". Please check the ID or contact our helpline.`;
          }
        }
        return;
      }

      const order = res.order;
      currentOrderId = order.id;

      // Update URL query string without reloading page
      const newUrl = new URL(window.location);
      newUrl.searchParams.set("id", order.id);
      window.history.replaceState({}, "", newUrl);

      // Render Order Details
      renderOrderUI(order);

      // Auto-refresh every 20 seconds if not yet Delivered
      clearInterval(autoRefreshTimer);
      if (order.status !== "Delivered") {
        autoRefreshTimer = setInterval(() => {
          console.log("🔄 Background polling order status...");
          trackOrder(currentOrderId);
        }, 20000);
      }

    } catch (err) {
      console.error("Order lookup exception:", err);
      if (loadingState) loadingState.classList.add("hidden");
      if (notFoundState) {
        notFoundState.classList.remove("hidden");
        if (errorMsg) errorMsg.textContent = "Error communicating with database: " + err.message;
      }
    }
  }

  // -------------------------------------------------------------
  // Render Order UI Details
  // -------------------------------------------------------------
  function renderOrderUI(order) {
    const orderCard = document.getElementById("tracker-order-card");
    if (!orderCard) return;

    // 1. Order ID & Time
    const idEl = document.getElementById("order-id-display");
    const timeEl = document.getElementById("order-time-display");
    if (idEl) idEl.textContent = order.id || "N/A";

    if (timeEl) {
      const dateVal = order.created_at || order.timestamp;
      if (dateVal) {
        const d = new Date(dateVal);
        timeEl.textContent = "Placed on: " + d.toLocaleString("en-PK", {
          dateStyle: "medium",
          timeStyle: "short"
        });
      } else {
        timeEl.textContent = "Recently placed";
      }
    }

    // 2. Status Badge & Stepper
    updateStatusStepper(order.status || "Pending");

    // 3. Customer Info
    const nameEl = document.getElementById("order-customer-name");
    const phoneEl = document.getElementById("order-customer-phone");
    const addressEl = document.getElementById("order-customer-address");
    const instructionsEl = document.getElementById("order-instructions");
    const instructionsContainer = document.getElementById("order-instructions-container");

    const customerName = order.customer_name || order.customerName || "Customer";
    const customerPhone = order.customer_phone || order.customerPhone || "N/A";
    const customerAddress = order.customer_address || order.customerAddress || "N/A";
    const specialInstructions = order.special_instructions || order.specialInstructions || "";

    if (nameEl) nameEl.textContent = customerName;
    if (phoneEl) {
      phoneEl.textContent = customerPhone;
      phoneEl.href = `tel:${customerPhone}`;
    }
    if (addressEl) addressEl.textContent = customerAddress;
    
    if (instructionsContainer) {
      if (specialInstructions && specialInstructions.trim()) {
        instructionsContainer.classList.remove("hidden");
        if (instructionsEl) instructionsEl.textContent = `"${specialInstructions}"`;
      } else {
        instructionsContainer.classList.add("hidden");
      }
    }

    // 4. WhatsApp Help Link
    const waLink = document.getElementById("whatsapp-tracker-link");
    if (waLink) {
      const msg = encodeURIComponent(`Hello Zaiqa Lounge, I want to inquire about my Order #${order.id} (Status: ${order.status || 'Pending'}).`);
      waLink.href = `https://wa.me/923072820877?text=${msg}`;
    }

    // 5. Ordered Dishes List
    const itemsList = document.getElementById("order-items-list");
    let dishes = order.dishes || order.items || [];
    if (typeof dishes === "string") {
      try { dishes = JSON.parse(dishes); } catch (e) { dishes = []; }
    }

    if (itemsList) {
      if (Array.isArray(dishes) && dishes.length > 0) {
        itemsList.innerHTML = dishes.map(item => `
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div class="flex items-center gap-2.5">
              <span class="w-6 h-6 rounded-lg bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                ${item.quantity}×
              </span>
              <div>
                <div class="font-bold text-white">${item.name}</div>
                <div class="text-[10px] text-slate-400">Rs. ${Number(item.price).toLocaleString()} each</div>
              </div>
            </div>
            <div class="font-mono font-bold text-slate-200">
              Rs. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
            </div>
          </div>
        `).join("");
      } else {
        itemsList.innerHTML = `<div class="text-xs text-slate-500 py-2">Details not available</div>`;
      }
    }

    // 6. Pricing Breakdown
    const totalAmount = Number(order.total_price || order.totalAmount || 0);
    const subtotalEl = document.getElementById("order-subtotal");
    const feeEl = document.getElementById("order-delivery-fee");
    const totalEl = document.getElementById("order-total");

    const deliveryFee = order.deliveryFee !== undefined ? Number(order.deliveryFee) : (totalAmount >= 2000 ? 0 : 150);
    const subtotal = order.subtotal !== undefined ? Number(order.subtotal) : (totalAmount - deliveryFee);

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (feeEl) feeEl.textContent = deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `Rs. ${totalAmount.toLocaleString()}`;

    // Reveal Card
    orderCard.classList.remove("hidden");
  }

  // -------------------------------------------------------------
  // Visual Stepper Update
  // -------------------------------------------------------------
  function updateStatusStepper(status) {
    const badge = document.getElementById("order-status-badge");
    const stepPending = document.getElementById("step-pending");
    const stepPreparing = document.getElementById("step-preparing");
    const stepDelivered = document.getElementById("step-delivered");

    const hintEmoji = document.getElementById("status-hint-emoji");
    const hintTitle = document.getElementById("status-hint-title");
    const hintText = document.getElementById("status-hint-text");

    const normalStep = "p-4 rounded-2xl border border-slate-800 bg-slate-950/40 text-slate-400";
    const activeStep = "p-4 rounded-2xl border-2 border-orange-500 bg-orange-950/20 text-white shadow-lg shadow-orange-500/10 scale-[1.02]";
    const completedStep = "p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300";

    if (status === "Preparing") {
      // BADGE
      if (badge) {
        badge.className = "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-lg shadow-orange-500/10";
        badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span> <span>👨‍🍳 In Preparation (Cooking)</span>`;
      }

      // STEP 1: Completed
      stepPending.className = completedStep;
      stepPending.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-base flex-shrink-0";
      stepPending.querySelector(".step-icon").innerHTML = "✓";

      // STEP 2: Active
      stepPreparing.className = activeStep;
      stepPreparing.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-base flex-shrink-0 animate-bounce";
      stepPreparing.querySelector(".step-icon").innerHTML = "👨‍🍳";

      // STEP 3: Inactive
      stepDelivered.className = normalStep;
      stepDelivered.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-base flex-shrink-0 text-slate-500";
      stepDelivered.querySelector(".step-icon").innerHTML = "🎉";

      // HINT
      if (hintEmoji) hintEmoji.textContent = "🔥";
      if (hintTitle) hintTitle.textContent = "Your food is sizzling in the kitchen!";
      if (hintText) hintText.textContent = "Our master chefs are carefully preparing and garnishing your order. Rider will collect it shortly.";

    } else if (status === "Delivered") {
      // BADGE
      if (badge) {
        badge.className = "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10";
        badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> <span>🎉 Successfully Delivered</span>`;
      }

      // ALL COMPLETED
      [stepPending, stepPreparing, stepDelivered].forEach(step => {
        step.className = completedStep;
        step.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-base flex-shrink-0";
        step.querySelector(".step-icon").innerHTML = "✓";
      });

      // HINT
      if (hintEmoji) hintEmoji.textContent = "🎉";
      if (hintTitle) hintTitle.textContent = "Order Delivered Successfully!";
      if (hintText) hintText.textContent = "Your delicious meal has arrived. Thank you for dining with Zaiqa Lounge & Grill! Call 03072820877 for feedback.";

    } else {
      // DEFAULT: Pending
      if (badge) {
        badge.className = "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10";
        badge.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span> <span>📝 Order Placed & Queued</span>`;
      }

      // STEP 1: Active
      stepPending.className = activeStep;
      stepPending.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base flex-shrink-0 animate-pulse";
      stepPending.querySelector(".step-icon").innerHTML = "📝";

      // STEP 2: Inactive
      stepPreparing.className = normalStep;
      stepPreparing.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-base flex-shrink-0 text-slate-500";
      stepPreparing.querySelector(".step-icon").innerHTML = "👨‍🍳";

      // STEP 3: Inactive
      stepDelivered.className = normalStep;
      stepDelivered.querySelector(".step-icon").className = "step-icon w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-base flex-shrink-0 text-slate-500";
      stepDelivered.querySelector(".step-icon").innerHTML = "🎉";

      // HINT
      if (hintEmoji) hintEmoji.textContent = "📋";
      if (hintTitle) hintTitle.textContent = "Order Confirmed & Queued";
      if (hintText) hintText.textContent = "We have received your order details in Supabase and Gmail. Kitchen prep will begin in a moment.";
    }
  }

  // Global helper for recent order click
  window.Tracker = {
    selectRecent: function (orderId) {
      const input = document.getElementById("track-query");
      if (input) {
        input.value = orderId;
        trackOrder(orderId);
      }
    }
  };

})();

