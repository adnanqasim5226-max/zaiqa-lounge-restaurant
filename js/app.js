// ==============================================================================
// RESTAURANT MAIN APPLICATION SCRIPT
// Implements Part A: Home & Menu, Order Form, Gmail Dispatch, Supabase Persistence
// ==============================================================================

(function () {
  // Application State with localStorage persistence across pages
  const state = {
    cart: JSON.parse(localStorage.getItem("restaurant_cart") || "[]"),
    activeCategory: "All",
    isSubmitting: false
  };

  // DOM Elements Cache
  const elements = {};

  function initElements() {
    elements.menuGrid = document.getElementById("menu-grid");
    elements.categoryFilters = document.getElementById("category-filters");
    elements.cartItemsContainer = document.getElementById("cart-items");
    elements.cartCountBadges = document.querySelectorAll(".cart-count-badge");
    elements.cartSubtotal = document.getElementById("cart-subtotal");
    elements.cartDeliveryFee = document.getElementById("cart-delivery-fee");
    elements.cartTotal = document.getElementById("cart-total");
    elements.orderForm = document.getElementById("order-form");
    elements.customerName = document.getElementById("customer-name");
    elements.customerPhone = document.getElementById("customer-phone");
    elements.customerAddress = document.getElementById("customer-address");
    elements.specialInstructions = document.getElementById("special-instructions");
    elements.placeOrderBtn = document.getElementById("place-order-btn");
    elements.cartEmptyNotice = document.getElementById("cart-empty-notice");
    elements.cartFilledContainer = document.getElementById("cart-filled-container");
    elements.orderSuccessModal = document.getElementById("order-success-modal");
    elements.supabaseStatusBadge = document.getElementById("supabase-status-badge");
    elements.supabaseConfigModal = document.getElementById("supabase-config-modal");
    elements.weeklyMenuGrid = document.getElementById("weekly-menu-grid");
    elements.currentDayName = document.getElementById("current-day-name");
  }

  // -------------------------------------------------------------
  // 1. RENDER MENU (Part A Requirement 1)
  // Shows restaurant dishes with picture, name, price, description
  // -------------------------------------------------------------
  function renderMenu() {
    if (!elements.menuGrid) return;

    const dishes = window.CONFIG.dishes || [];
    const filtered = state.activeCategory === "All"
      ? dishes
      : dishes.filter(d => d.category.toLowerCase().includes(state.activeCategory.toLowerCase()));

    elements.menuGrid.innerHTML = filtered.map(dish => {
      const cartItem = state.cart.find(item => item.id === dish.id);
      const qtyInCart = cartItem ? cartItem.quantity : 0;

      return `
        <div class="dish-card glass-panel rounded-2xl overflow-hidden flex flex-col group relative" data-id="${dish.id}">
          <div class="relative h-56 overflow-hidden">
            <img 
              src="${dish.image}" 
              alt="${dish.name}" 
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            
            <div class="absolute top-3 left-3 flex gap-2">
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-orange-600/90 text-white shadow-md backdrop-blur-sm">
                ${dish.category}
              </span>
              ${dish.badge ? `
                <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/90 text-slate-950 shadow-md">
                  ★ ${dish.badge}
                </span>` : ''}
            </div>

            <div class="absolute bottom-3 left-3 text-sm text-amber-300 font-medium flex items-center gap-1">
              <span>⭐ ${dish.rating.toFixed(1)}</span>
              <span class="text-xs text-slate-300 font-normal">(${dish.spicyLevel})</span>
            </div>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="text-xl font-bold text-white group-hover:text-orange-400 transition-colors font-serif">
                  ${dish.name}
                </h3>
              </div>
              <p class="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                ${dish.description}
              </p>
            </div>

            <div class="pt-4 border-t border-slate-700/60 flex items-center justify-between mt-auto">
              <div>
                <span class="text-xs text-slate-400 block uppercase font-medium">Price</span>
                <span class="text-2xl font-extrabold text-white">
                  Rs. ${dish.price.toLocaleString()}
                </span>
              </div>

              ${qtyInCart > 0 ? `
                <div class="flex items-center gap-2 bg-slate-800 border border-orange-500/50 rounded-xl p-1">
                  <button 
                    onclick="window.App.decrementItem('${dish.id}')" 
                    class="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-base transition-colors"
                    aria-label="Decrease quantity"
                  >−</button>
                  <span class="w-6 text-center font-bold text-orange-400">${qtyInCart}</span>
                  <button 
                    onclick="window.App.incrementItem('${dish.id}')" 
                    class="w-8 h-8 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center font-bold text-base transition-colors"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              ` : `
                <button 
                  onclick="window.App.addToCart('${dish.id}')" 
                  class="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span>Add to Order</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Render category pill filters
  function renderCategories() {
    if (!elements.categoryFilters) return;

    const dishes = window.CONFIG.dishes || [];
    const categories = ["All", ...new Set(dishes.map(d => d.category))];

    elements.categoryFilters.innerHTML = categories.map(cat => `
      <button 
        onclick="window.App.setCategory('${cat}')"
        class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
          state.activeCategory === cat
            ? "bg-orange-600 text-white shadow-lg shadow-orange-600/40 ring-2 ring-orange-500/50"
            : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
        }"
      >
        ${cat}
      </button>
    `).join("");
  }

  // -------------------------------------------------------------
  // RENDER 7-DAY WEEKLY MENU (ایک ہفتے کا مخصوص مینو)
  // -------------------------------------------------------------
  function renderWeeklyMenu() {
    if (!elements.weeklyMenuGrid) return;

    const weekly = (window.CONFIG && window.CONFIG.weeklyMenu) || [];
    if (!weekly.length) return;

    const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[todayIndex];

    if (elements.currentDayName) {
      elements.currentDayName.textContent = todayName;
    }

    elements.weeklyMenuGrid.innerHTML = weekly.map(item => {
      const isToday = item.dayIndex === todayIndex;
      const cartItem = state.cart.find(i => i.id === item.dishId);
      const inCart = cartItem ? cartItem.quantity : 0;

      return `
        <div class="glass-panel rounded-2xl p-5 flex flex-col justify-between border transition-all duration-300 relative group ${
          isToday 
            ? 'border-orange-500/80 bg-orange-950/20 shadow-xl shadow-orange-600/15 ring-2 ring-orange-500/30' 
            : 'border-slate-800 hover:border-slate-700'
        }">
          
          ${isToday ? `
            <div class="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
              <span>🌟</span>
              <span>Today's Special</span>
            </div>
          ` : ''}

          <div>
            <!-- Day Strip -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isToday ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-800 text-slate-300'
                }">
                  ${item.dayName}
                </span>
                <span class="text-xs text-amber-400 font-semibold font-serif">
                  (${item.dayUrdu})
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-mono">
                ${item.badge}
              </span>
            </div>

            <!-- Dish Image -->
            <div class="relative h-40 rounded-xl overflow-hidden mb-3.5 group-hover:scale-[1.02] transition-transform">
              <img 
                src="${item.image}" 
                alt="${item.dishName}" 
                loading="lazy" 
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                <span class="font-bold text-white drop-shadow-md truncate mr-2">${item.dishName}</span>
                <span class="font-extrabold text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded-md whitespace-nowrap">Rs. ${item.price.toLocaleString()}</span>
              </div>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-2 font-serif">
              ${item.tagline}
            </p>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-400 font-medium mb-4 flex items-center gap-1.5">
              <span>🎁</span>
              <span>${item.deal}</span>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
            <span class="text-xs text-slate-400">Featured Day Special</span>
            ${inCart > 0 ? `
              <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>✓ Added (${inCart})</span>
              </span>
            ` : `
              <button 
                onclick="window.App.addToCart('${item.dishId}')" 
                class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                  isToday 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-orange-600/30' 
                    : 'bg-slate-800 hover:bg-orange-600 text-slate-200 hover:text-white'
                }"
              >
                <span>Order ${item.dayName}</span>
                <span>+</span>
              </button>
            `}
          </div>

        </div>
      `;
    }).join("");
  }

  // -------------------------------------------------------------
  // 2. CART MANAGEMENT & TOTAL CALCULATIONS
  // -------------------------------------------------------------
  function addToCart(dishId) {
    const dish = window.CONFIG.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = state.cart.find(item => item.id === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        quantity: 1
      });
    }

    updateCartUI();
    renderMenu();
    showToast(`Added "${dish.name}" to your order!`, "info");
  }

  function incrementItem(dishId) {
    const item = state.cart.find(i => i.id === dishId);
    if (item) {
      item.quantity += 1;
      updateCartUI();
      renderMenu();
    }
  }

  function decrementItem(dishId) {
    const index = state.cart.findIndex(i => i.id === dishId);
    if (index !== -1) {
      if (state.cart[index].quantity > 1) {
        state.cart[index].quantity -= 1;
      } else {
        state.cart.splice(index, 1);
      }
      updateCartUI();
      renderMenu();
    }
  }

  function removeItem(dishId) {
    state.cart = state.cart.filter(i => i.id !== dishId);
    updateCartUI();
    renderMenu();
  }

  function calculateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const threshold = window.CONFIG.restaurant.freeDeliveryThreshold || 2000;
    const baseFee = window.CONFIG.restaurant.deliveryFee || 150;
    
    // Free delivery if subtotal exceeds threshold, else standard fee (or 0 if cart is empty)
    const deliveryFee = subtotal === 0 ? 0 : (subtotal >= threshold ? 0 : baseFee);
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total };
  }

  function updateCartUI() {
    // Persist to localStorage across all pages
    localStorage.setItem("restaurant_cart", JSON.stringify(state.cart));

    const totalItems = state.cart.reduce((sum, i) => sum + i.quantity, 0);
    const { subtotal, deliveryFee, total } = calculateTotals();

    // Update Badges
    elements.cartCountBadges.forEach(badge => {
      badge.textContent = totalItems;
      if (totalItems > 0) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    });

    // Update Price Summary
    if (elements.cartSubtotal) elements.cartSubtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (elements.cartDeliveryFee) {
      elements.cartDeliveryFee.textContent = deliveryFee === 0 && subtotal > 0
        ? "FREE"
        : `Rs. ${deliveryFee.toLocaleString()}`;
    }
    if (elements.cartTotal) elements.cartTotal.textContent = `Rs. ${total.toLocaleString()}`;

    // Toggle Empty vs Filled Cart containers
    if (state.cart.length === 0) {
      if (elements.cartEmptyNotice) elements.cartEmptyNotice.classList.remove("hidden");
      if (elements.cartFilledContainer) elements.cartFilledContainer.classList.add("hidden");
      if (elements.placeOrderBtn) elements.placeOrderBtn.disabled = true;
    } else {
      if (elements.cartEmptyNotice) elements.cartEmptyNotice.classList.add("hidden");
      if (elements.cartFilledContainer) elements.cartFilledContainer.classList.remove("hidden");
      if (elements.placeOrderBtn) elements.placeOrderBtn.disabled = false;
    }

    // Render Cart Items List
    if (elements.cartItemsContainer) {
      elements.cartItemsContainer.innerHTML = state.cart.map(item => `
        <div class="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
          <img src="${item.image}" alt="${item.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h4 class="text-white font-semibold text-sm truncate">${item.name}</h4>
            <div class="text-orange-400 text-xs font-medium">Rs. ${item.price.toLocaleString()} each</div>
            <div class="text-slate-300 font-bold text-xs mt-0.5">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
          </div>
          <div class="flex items-center gap-1.5 bg-slate-800 rounded-lg p-1">
            <button 
              onclick="window.App.decrementItem('${item.id}')" 
              class="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold text-xs"
            >−</button>
            <span class="w-5 text-center text-xs font-bold text-white">${item.quantity}</span>
            <button 
              onclick="window.App.incrementItem('${item.id}')" 
              class="w-6 h-6 rounded bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center font-bold text-xs"
            >+</button>
          </div>
          <button 
            onclick="window.App.removeItem('${item.id}')" 
            class="text-slate-500 hover:text-red-400 p-1"
            title="Remove item"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      `).join("");
    }

    // Refresh weekly menu items state if on menu page
    renderWeeklyMenu();
  }

  // -------------------------------------------------------------
  // 3. ORDER SUBMISSION (Part A: Form, Gmail, Supabase)
  // -------------------------------------------------------------
  async function handleOrderSubmit(e) {
    if (e) e.preventDefault();

    if (state.isSubmitting) return;

    // Check cart has items
    if (state.cart.length === 0) {
      showToast("Please add at least one dish to your order!", "warning");
      document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Validate Required Fields (Part A Requirement 2: All fields must be filled)
    const name = elements.customerName ? elements.customerName.value.trim() : "";
    const phone = elements.customerPhone ? elements.customerPhone.value.trim() : "";
    const address = elements.customerAddress ? elements.customerAddress.value.trim() : "";
    const instructions = elements.specialInstructions ? elements.specialInstructions.value.trim() : "";

    if (!name) {
      showToast("Customer Name is required!", "error");
      elements.customerName.focus();
      return;
    }
    if (!phone) {
      showToast("Phone Number is required!", "error");
      elements.customerPhone.focus();
      return;
    }
    if (!address) {
      showToast("Delivery Address is required!", "error");
      elements.customerAddress.focus();
      return;
    }

    // Build Order Object
    const { subtotal, deliveryFee, total } = calculateTotals();
    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      specialInstructions: instructions,
      items: state.cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      totalAmount: total,
      timestamp: new Date().toISOString()
    };

    // UI Loading State
    state.isSubmitting = true;
    const originalBtnText = elements.placeOrderBtn.innerHTML;
    elements.placeOrderBtn.disabled = true;
    elements.placeOrderBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing & Sending Order...
    `;

    try {
      // Step A: Save Order in Supabase table 'orders' with status 'Pending' (Part A Requirement 4)
      console.log("💾 Step 1: Saving order to Supabase...");
      const supabaseResult = await window.DB.saveOrder(orderData);
      orderData.id = supabaseResult.order ? supabaseResult.order.id : "ORD-" + Date.now();

      // Step B: Send full order to Gmail (adnanqasim5226@gmail.com) (Part A Requirement 3)
      console.log("📧 Step 2: Sending full order to Gmail: adnanqasim5226@gmail.com...");
      const emailResult = await window.EmailService.sendOrderToGmail(orderData);

      // Show Order Success Modal
      showOrderSuccessModal(orderData, emailResult, supabaseResult);

      // Reset Form & Cart
      state.cart = [];
      localStorage.removeItem("restaurant_cart");
      updateCartUI();
      renderMenu();
      if (elements.orderForm) elements.orderForm.reset();

      showToast("Order placed successfully!", "success");
    } catch (err) {
      console.error("Order processing error:", err);
      showToast("An error occurred while placing order: " + err.message, "error");
    } finally {
      state.isSubmitting = false;
      elements.placeOrderBtn.disabled = false;
      elements.placeOrderBtn.innerHTML = originalBtnText;
    }
  }

  // -------------------------------------------------------------
  // 4. ORDER CONFIRMATION MODAL
  // Displays full receipt, Supabase status, and Gmail status
  // -------------------------------------------------------------
  function showOrderSuccessModal(order, emailResult, supabaseResult) {
    if (!elements.orderSuccessModal) return;

    const modalReceipt = document.getElementById("modal-receipt-content");
    const emailStatusBadge = document.getElementById("modal-email-status");
    const supabaseStatusBadge = document.getElementById("modal-supabase-status");
    const mailtoBtn = document.getElementById("modal-mailto-btn");

    if (emailStatusBadge) {
      if (emailResult.method === "activation-pending") {
        emailStatusBadge.className = "p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3";
        emailStatusBadge.innerHTML = `
          <span class="text-xl flex-shrink-0">📬</span>
          <div>
            <strong class="text-amber-200">Gmail One-Time Activation Required:</strong>
            <div class="text-[11px] text-amber-300/90 mt-0.5">${emailResult.message}</div>
            <a href="https://mail.google.com" target="_blank" class="inline-block mt-1 text-[11px] text-amber-400 font-bold underline hover:text-white">Open Gmail Inbox to Activate →</a>
          </div>
        `;
      } else if (emailResult.success) {
        emailStatusBadge.className = "p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2";
        emailStatusBadge.innerHTML = `
          <span class="text-base">✅</span>
          <div>
            <strong>Dispatched to Gmail:</strong> ${window.CONFIG.targetGmail}
            <div class="text-[11px] text-emerald-400/80">${emailResult.message}</div>
          </div>
        `;
      } else {
        emailStatusBadge.className = "p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2";
        emailStatusBadge.innerHTML = `
          <span class="text-base">⚠️</span>
          <div>
            <strong>Gmail Notice:</strong> ${emailResult.message}
            <div class="text-[11px] text-amber-400/80">Use the button below to open directly in Gmail app.</div>
          </div>
        `;
      }
    }

    if (supabaseStatusBadge) {
      if (supabaseResult.source === "supabase") {
        supabaseStatusBadge.className = "p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2";
        supabaseStatusBadge.innerHTML = `
          <span class="text-base">✅</span>
          <div>
            <strong>Saved in Supabase:</strong> Table <code>orders</code>
            <div class="text-[11px] text-blue-400/80">Order Status: <span class="font-bold text-amber-400">Pending</span></div>
          </div>
        `;
      } else {
        supabaseStatusBadge.className = "p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs flex items-center gap-2";
        supabaseStatusBadge.innerHTML = `
          <span class="text-base">💾</span>
          <div>
            <strong>Saved in Local Storage:</strong> (Ready for Supabase sync)
            <div class="text-[11px] text-slate-400">${supabaseResult.message || "Status: Pending"}</div>
          </div>
        `;
      }
    }

    const trackOrderBtn = document.getElementById("modal-track-order-btn");
    if (trackOrderBtn && order && order.id) {
      trackOrderBtn.href = `track.html?id=${encodeURIComponent(order.id)}`;
    }

    if (mailtoBtn) {
      mailtoBtn.href = window.EmailService.createMailtoUrl(order);
    }

    if (modalReceipt) {
      modalReceipt.innerHTML = `
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-mono space-y-3">
          <div class="flex justify-between border-b border-slate-800 pb-2">
            <span class="text-slate-400">Order ID:</span>
            <span class="text-orange-400 font-bold">${order.id}</span>
          </div>
          <div class="flex justify-between border-b border-slate-800 pb-2">
            <span class="text-slate-400">Customer:</span>
            <span class="text-white font-semibold">${order.customerName} (${order.customerPhone})</span>
          </div>
          <div class="border-b border-slate-800 pb-2">
            <span class="text-slate-400 block text-xs">Delivery Address:</span>
            <span class="text-slate-200 text-xs">${order.customerAddress}</span>
          </div>
          <div class="space-y-1.5 py-1">
            <span class="text-slate-400 text-xs block font-sans font-bold uppercase tracking-wider">Ordered Dishes:</span>
            ${order.items.map(i => `
              <div class="flex justify-between text-xs text-slate-300">
                <span>${i.name} × ${i.quantity}</span>
                <span class="font-bold">Rs. ${(i.price * i.quantity).toLocaleString()}</span>
              </div>
            `).join("")}
          </div>
          <div class="border-t border-slate-800 pt-2 space-y-1">
            <div class="flex justify-between text-xs text-slate-400">
              <span>Subtotal:</span>
              <span>Rs. ${order.subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Delivery Fee:</span>
              <span>Rs. ${order.deliveryFee.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-white pt-1 border-t border-slate-800/80">
              <span class="text-orange-400">Total:</span>
              <span class="text-orange-400">Rs. ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      `;
    }

    elements.orderSuccessModal.classList.remove("hidden");
    elements.orderSuccessModal.classList.add("flex");
  }

  function closeOrderModal() {
    if (elements.orderSuccessModal) {
      elements.orderSuccessModal.classList.add("hidden");
      elements.orderSuccessModal.classList.remove("flex");
    }
  }

  // -------------------------------------------------------------
  // 5. SUPABASE CONNECTION STATUS & CONFIG MODAL
  // -------------------------------------------------------------
  function checkSupabaseStatus() {
    if (!elements.supabaseStatusBadge) return;
    const isReady = window.DB && window.DB.isConfigured();

    if (isReady) {
      elements.supabaseStatusBadge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-emerald-400 text-xs font-semibold">Supabase Connected</span>
      `;
      elements.supabaseStatusBadge.title = "Connected to Supabase project!";
    } else {
      elements.supabaseStatusBadge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
        <span class="text-amber-300 text-xs font-semibold">Connect Supabase Key</span>
      `;
      elements.supabaseStatusBadge.title = "Click to set your Supabase Anon Key";
    }
  }

  function openSupabaseModal() {
    if (!elements.supabaseConfigModal) return;
    const { url, anonKey } = window.DB.getCredentials();
    const urlInput = document.getElementById("cfg-supabase-url");
    const keyInput = document.getElementById("cfg-supabase-key");

    if (urlInput) urlInput.value = url || window.CONFIG.supabase.url;
    if (keyInput) keyInput.value = anonKey || "";

    elements.supabaseConfigModal.classList.remove("hidden");
    elements.supabaseConfigModal.classList.add("flex");
  }

  function closeSupabaseModal() {
    if (elements.supabaseConfigModal) {
      elements.supabaseConfigModal.classList.add("hidden");
      elements.supabaseConfigModal.classList.remove("flex");
    }
  }

  function saveSupabaseConfig(e) {
    if (e) e.preventDefault();
    const urlInput = document.getElementById("cfg-supabase-url");
    const keyInput = document.getElementById("cfg-supabase-key");

    const url = urlInput ? urlInput.value.trim() : "";
    const key = keyInput ? keyInput.value.trim() : "";

    if (!key) {
      showToast("Please enter your Supabase Anon public key!", "warning");
      return;
    }

    const success = window.DB.saveCredentials(url, key);
    checkSupabaseStatus();
    closeSupabaseModal();

    if (success) {
      showToast("Supabase connected successfully!", "success");
    } else {
      showToast("Credentials saved. Verifying connection...", "info");
    }
  }

  // -------------------------------------------------------------
  // 6. TOAST NOTIFICATIONS
  // -------------------------------------------------------------
  function showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-emerald-600 text-white border-emerald-500",
      error: "bg-red-600 text-white border-red-500",
      warning: "bg-amber-600 text-white border-amber-500",
      info: "bg-slate-800 text-slate-100 border-slate-700"
    };

    toast.className = `p-4 rounded-xl border shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-[-10px] opacity-0 pointer-events-auto ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `
      <span class="text-base font-bold">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="text-xs font-medium leading-snug flex-1">${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-[-10px]", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    });

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-[-10px]");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initElements();
    renderCategories();
    renderMenu();
    renderWeeklyMenu();
    updateCartUI();
    checkSupabaseStatus();

    // Event Listeners
    if (elements.orderForm) {
      elements.orderForm.addEventListener("submit", handleOrderSubmit);
    }
    if (elements.placeOrderBtn) {
      elements.placeOrderBtn.addEventListener("click", handleOrderSubmit);
    }

    // Modal close bindings
    const closeOrderBtn = document.getElementById("close-order-modal");
    if (closeOrderBtn) closeOrderBtn.addEventListener("click", closeOrderModal);

    const closeCfgBtn = document.getElementById("close-cfg-modal");
    if (closeCfgBtn) closeCfgBtn.addEventListener("click", closeSupabaseModal);

    const saveCfgBtn = document.getElementById("save-cfg-btn");
    if (saveCfgBtn) saveCfgBtn.addEventListener("click", saveSupabaseConfig);

    if (elements.supabaseStatusBadge) {
      elements.supabaseStatusBadge.addEventListener("click", openSupabaseModal);
    }

    // Copy order summary text to clipboard
    const copyReceiptBtn = document.getElementById("copy-receipt-btn");
    if (copyReceiptBtn) {
      copyReceiptBtn.addEventListener("click", () => {
        const text = document.getElementById("modal-receipt-content").innerText;
        navigator.clipboard.writeText(text).then(() => {
          showToast("Order receipt copied to clipboard!", "success");
        });
      });
    }
  });

  // Export App methods to global scope
  window.App = {
    setCategory: function (cat) {
      state.activeCategory = cat;
      renderCategories();
      renderMenu();
    },
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
    handleOrderSubmit,
    closeOrderModal,
    openSupabaseModal,
    closeSupabaseModal,
    saveSupabaseConfig,
    showToast
  };
})();
