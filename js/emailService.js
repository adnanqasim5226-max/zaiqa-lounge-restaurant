// ==============================================================================
// EMAIL DISPATCH SERVICE
// Part A Requirement 3: Full order sent to Gmail (adnanqasim5226@gmail.com)
// Easy-to-read table format containing dishes, quantity, total, name, phone, address
// ==============================================================================

(function () {
  const EMAIL_TARGET = (window.CONFIG && window.CONFIG.targetGmail) || "adnanqasim5226@gmail.com";

  // Build clean text representation of dishes
  function formatDishesList(items) {
    if (!items || !items.length) return "No dishes selected";
    return items
      .map((item, index) => `${index + 1}. ${item.name} × ${item.quantity} (Rs. ${item.price * item.quantity})`)
      .join("\n");
  }

  // Build HTML formatted receipt for display or email
  function buildOrderSummaryText(order) {
    const dishesText = formatDishesList(order.items);
    return `==========================================
🍽️ NEW ORDER - ZAIQA LOUNGE & GRILL
==========================================
Order ID: ${order.id || "ORD-" + Math.floor(100000 + Math.random() * 900000)}
Order Time: ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}
Status: Pending

CUSTOMER DETAILS:
------------------------------------------
Name:    ${order.customerName}
Phone:   ${order.customerPhone}
Address: ${order.customerAddress}
Notes:   ${order.specialInstructions || "None"}

ORDERED DISHES & QUANTITIES:
------------------------------------------
${dishesText}

PAYMENT SUMMARY:
------------------------------------------
Subtotal:     Rs. ${order.subtotal || order.totalAmount}
Delivery Fee: Rs. ${order.deliveryFee || 0}
GRAND TOTAL:  Rs. ${order.totalAmount}
==========================================`;
  }

  // Main email sender function
  async function sendOrderToGmail(order) {
    const formattedDishes = (order.items || [])
      .map((item) => `${item.name} (Qty: ${item.quantity}) - Rs. ${item.price * item.quantity}`)
      .join(", ");

    const orderId = order.id || "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const orderTime = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Payload for FormSubmit (Sends direct formatted table email to adnanqasim5226@gmail.com)
    const payload = {
      _subject: `🍔 New Restaurant Order #${orderId} - Rs. ${order.totalAmount}`,
      _template: "table",
      _captcha: "false",
      "Order ID": orderId,
      "Order Time (PKT)": orderTime,
      "Customer Name": order.customerName,
      "Customer Phone": order.customerPhone,
      "Delivery Address": order.customerAddress,
      "Special Instructions": order.specialInstructions || "None",
      "Dishes & Quantity": formattedDishes,
      "Subtotal": `Rs. ${order.subtotal || order.totalAmount}`,
      "Delivery Fee": `Rs. ${order.deliveryFee || 0}`,
      "Grand Total": `Rs. ${order.totalAmount}`,
      "Status": "Pending"
    };

    console.log("📨 Dispatching order to Gmail:", EMAIL_TARGET, payload);

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(EMAIL_TARGET)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("📨 FormSubmit response:", data);

      if (data.success === "true" || data.success === true) {
        return {
          success: true,
          method: "formsubmit",
          message: `Order sent directly to ${EMAIL_TARGET}!`
        };
      } else if (data.message && data.message.includes("Activation")) {
        // FormSubmit first-time activation needed
        return {
          success: true,
          method: "activation-pending",
          message: `Activation link sent to ${EMAIL_TARGET}. Click 'Activate Form' in your Gmail inbox once to receive all orders!`
        };
      } else {
        return {
          success: false,
          method: "formsubmit-error",
          message: data.message || "Email service returned notice."
        };
      }
    } catch (error) {
      console.warn("⚠️ Network issue sending via FormSubmit:", error);
      return {
        success: false,
        method: "network-error",
        message: "Failed to dispatch email via FormSubmit network. Mailto backup available."
      };
    }
  }

  // Create a mailto URL as instant direct backup
  function createMailtoUrl(order) {
    const subject = encodeURIComponent(`New Food Order #${order.id || "ORD"} - Rs. ${order.totalAmount}`);
    const body = encodeURIComponent(buildOrderSummaryText(order));
    return `mailto:${EMAIL_TARGET}?subject=${subject}&body=${body}`;
  }

  window.EmailService = {
    targetGmail: EMAIL_TARGET,
    sendOrderToGmail: sendOrderToGmail,
    buildOrderSummaryText: buildOrderSummaryText,
    createMailtoUrl: createMailtoUrl
  };
})();
