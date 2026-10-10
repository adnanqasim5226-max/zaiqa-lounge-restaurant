// ==============================================================================
// SUPABASE CLIENT SERVICE
// Handles connecting to Supabase, saving orders, and status updates
// ==============================================================================

(function () {
  let supabaseInstance = null;

  // Retrieve credentials from localStorage (if set by user) or fallback to CONFIG
  function getCredentials() {
    const savedUrl = localStorage.getItem("supabase_url");
    const savedKey = localStorage.getItem("supabase_anon_key");

    const url = savedUrl || (window.CONFIG && window.CONFIG.supabase ? window.CONFIG.supabase.url : "");
    const anonKey = savedKey || (window.CONFIG && window.CONFIG.supabase ? window.CONFIG.supabase.anonKey : "");

    return { url, anonKey };
  }

  // Initialize or re-initialize the Supabase client
  function initClient() {
    const { url, anonKey } = getCredentials();

    if (window.supabase && url && anonKey && anonKey.trim().length > 10) {
      try {
        supabaseInstance = window.supabase.createClient(url.trim(), anonKey.trim());
        console.log("✅ Supabase client initialized successfully with project:", url);
        return true;
      } catch (err) {
        console.error("❌ Failed to initialize Supabase client:", err);
        supabaseInstance = null;
        return false;
      }
    } else {
      supabaseInstance = null;
      return false;
    }
  }

  // Public API
  window.DB = {
    init: initClient,

    isConfigured: function () {
      const { anonKey } = getCredentials();
      return Boolean(supabaseInstance && anonKey && anonKey.trim().length > 10);
    },

    getCredentials: getCredentials,

    saveCredentials: function (url, anonKey) {
      if (url) localStorage.setItem("supabase_url", url.trim());
      if (anonKey) localStorage.setItem("supabase_anon_key", anonKey.trim());
      return initClient();
    },

    // ---------------------------------------------------------
    // 1. SAVE ORDER (Part A Requirement 4)
    // Saves into 'orders' table with status 'Pending'
    // ---------------------------------------------------------
    saveOrder: async function (orderData) {
      const orderPayload = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        special_instructions: orderData.specialInstructions || "",
        dishes: orderData.items, // Array of { name, quantity, price }
        total_price: Number(orderData.totalAmount),
        status: "Pending" // Explicitly "Pending" per hackathon rule
      };

      // Always save to localStorage as local backup/history
      const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      const localRecord = {
        id: "loc-" + Date.now(),
        created_at: new Date().toISOString(),
        ...orderPayload
      };
      localOrders.unshift(localRecord);
      localStorage.setItem("local_orders", JSON.stringify(localOrders));

      // Attempt Supabase insert if configured
      if (this.isConfigured()) {
        try {
          const { data, error } = await supabaseInstance
            .from("orders")
            .insert([orderPayload])
            .select();

          if (error) {
            console.error("⚠️ Supabase insertion error:", error);
            return {
              success: false,
              source: "local-only",
              message: "Saved locally, but Supabase returned error: " + error.message,
              order: localRecord
            };
          }

          console.log("✅ Order saved in Supabase successfully:", data);
          return {
            success: true,
            source: "supabase",
            order: data[0] || localRecord
          };
        } catch (err) {
          console.error("⚠️ Exception inserting into Supabase:", err);
          return {
            success: false,
            source: "local-only",
            message: "Saved locally. Supabase connection error.",
            order: localRecord
          };
        }
      } else {
        console.warn("ℹ️ Supabase Anon Key not set yet. Saved to local backup.");
        return {
          success: true,
          source: "local",
          message: "Order saved locally. Connect Supabase Anon Key to sync directly to cloud.",
          order: localRecord
        };
      }
    },

    // ---------------------------------------------------------
    // 2. FETCH ALL ORDERS (Part B Requirement 5)
    // ---------------------------------------------------------
    getOrders: async function () {
      if (this.isConfigured()) {
        try {
          const { data, error } = await supabaseInstance
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

          if (!error && data) {
            return { success: true, source: "supabase", orders: data };
          }
          console.warn("Supabase fetch returned error:", error);
        } catch (err) {
          console.error("Error fetching from Supabase:", err);
        }
      }

      // Fallback to local storage
      const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      return { success: true, source: "local", orders: localOrders };
    },

    // ---------------------------------------------------------
    // 3. UPDATE ORDER STATUS (Part B Requirement 6)
    // Pending -> Preparing -> Delivered
    // ---------------------------------------------------------
    updateStatus: async function (orderId, newStatus) {
      let supabaseUpdated = false;

      // 1. Try Supabase update
      if (this.isConfigured() && !orderId.toString().startsWith("loc-")) {
        try {
          const { error } = await supabaseInstance
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

          if (!error) {
            supabaseUpdated = true;
            console.log(`✅ Status updated in Supabase to: ${newStatus}`);
          } else {
            console.error("Failed to update status in Supabase:", error);
          }
        } catch (err) {
          console.error("Exception updating Supabase status:", err);
        }
      }

      // 2. Always update local storage cache too
      const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      const index = localOrders.findIndex((o) => o.id === orderId);
      if (index !== -1) {
        localOrders[index].status = newStatus;
        localStorage.setItem("local_orders", JSON.stringify(localOrders));
      }

      return {
        success: true,
        source: supabaseUpdated ? "supabase" : "local",
        status: newStatus
      };
    }
  };

  // Auto-init on page load if Supabase SDK is ready
  document.addEventListener("DOMContentLoaded", () => {
    initClient();
  });
})();
