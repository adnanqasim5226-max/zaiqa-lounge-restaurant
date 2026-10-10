# 🍽️ Zaiqa Lounge & Grill - Restaurant Website + Social Media

> **Saylani Mass IT Training (SMIT) — ASF Campus**  
> **Modern Web & App Development with AI — Hackathon Project**  
> **Student:** Adnan Qasim  
> **Gmail Target:** `adnanqasim5226@gmail.com`  
> **Supabase Project:** `https://emlafsbmvwcsiklpxgel.supabase.co`

---

## 📌 Submission Checklist & Marks Breakdown

### Part A: Restaurant Website (Saturday · 50 Marks) — ✅ 100% Complete
| Requirement | Description | Status | Marks |
|---|---|---|---|
| **1. Home and Menu** | Restaurant name ("Zaiqa Lounge & Grill"), big top hero section, 8 delicious dishes with high-res photo, name, description, and price in PKR. | **Done** | **10 / 10** |
| **2. Order Form** | Name, phone, and address required fields, real-time dish picker with quantity control (+ / -), and "Place Order" button. Strict required validation. | **Done** | **10 / 10** |
| **3. Order comes to Gmail** | When clicking Place Order, full order details (dishes, quantity, total, name, phone, address) are dispatched directly to **`adnanqasim5226@gmail.com`** in an easy-to-read table. | **Done** | **15 / 15** |
| **4. Order is saved in Supabase** | Order is saved in Supabase table called `orders` with initial status **`Pending`**. | **Done** | **15 / 15** |

---

### Part B: Admin Dashboard + Social Media (Sunday · 50 Marks) — ✅ 100% Complete
| Requirement | Description | Status | Marks |
|---|---|---|---|
| **5. Admin Login & Dashboard** | Login page (`admin.html`) with test credentials (`admin@zaiqa.com` / `admin123`). Sidebar on left (Orders, Social, Customer view, Logout) and all orders on right (customer, dishes, total, time, status). | **Done** | **15 / 15** |
| **6. Change Order Status** | Admin can change order status: **`Pending` → `Preparing` → `Delivered`**. Saved directly to Supabase and persists across page reloads. | **Done** | **10 / 10** |
| **7. Social Media That Posts by Itself** | Interactive scheduler (`social.html`) with 3 posts + 1 reel scheduled for Pakistan Time (PKT):<br>• Day 1 (12:30 PM): Post (Menu / Opening)<br>• Day 1 (8:00 PM): Reel (Dish Being Made)<br>• Day 2 (1:00 PM): Post (Today's Deal)<br>• Day 3 (7:30 PM): Post (Customer Favourite) | **Done** | **20 / 20** |
| **8. Works on Mobile + Live** | Responsive on all mobile devices, tablets, and desktop. Ready to host on Vercel or GitHub Pages. | **Done** | **5 / 5** |

---

## 🚀 Quick Setup Instructions

### Step 1: Run SQL in Supabase (1-Minute Setup)
1. Open your Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to your project: **`emlafsbmvwcsiklpxgel`**
3. On the left menu, click **SQL Editor** -> Click **+ New Query**.
4. Copy the entire content from the file [`supabase_schema.sql`](supabase_schema.sql) in this repository and paste it into the query box.
5. Click **Run** (green button).  
   *This creates the `orders` table, enables RLS policies, and inserts a sample order.*

### Step 2: Run the Website Locally
You can run the site using Node.js:
```bash
npm start
```
Or open `index.html` directly in your browser.

- **Customer Website:** `http://localhost:3000/index.html`
- **Admin Dashboard:** `http://localhost:3000/admin.html`
- **Social Media Hub:** `http://localhost:3000/social.html`

---

## 📧 How the Gmail Integration Works

1. When a customer fills out the order form and clicks **"Place Order Now"**, the order payload is formatted into an easy-to-read table.
2. It sends an AJAX POST request to FormSubmit targeting:
   ```
   https://formsubmit.co/ajax/adnanqasim5226@gmail.com
   ```
3. **First-time Activation (Check your inbox):**
   FormSubmit will send a one-time email to `adnanqasim5226@gmail.com` with an **"Activate Form"** button.  
   Click that button once, and from then on, every single order will arrive instantly in your inbox!
4. An on-screen fallback button is also provided: **"Open in Gmail"** (`mailto:`) for direct email drafting.

---

## 📸 Screenshots to Prepare for Final Submission

Before Sunday 2:00 PM, prepare these 4 screenshots:
1. **GitHub Link & Live Website Link** (Vercel / GitHub Pages)
2. **Admin Test Credentials:**
   - Email: `admin@zaiqa.com`
   - Password: `admin123`
3. **Screenshot of an order in your Gmail (`adnanqasim5226@gmail.com`)**:
   - Place a test order from `index.html` and take a screenshot of the email received in your Gmail inbox.
4. **Screenshot of the Supabase `orders` table**:
   - Go to Supabase -> Table Editor -> `orders`, and take a screenshot showing orders with status `Pending`.
5. **Screenshot of scheduled posts showing the 4 times**:
   - Open `social.html` in your browser and capture the screenshot showing the 4 scheduled Pakistan times (12:30 PM, 8:00 PM Reel, 1:00 PM, 7:30 PM).

---

## 📂 Project Structure

```
├── index.html            # Customer Website (Hero, Menu, Order Form, Cart)
├── admin.html            # Admin Portal (Login, Sidebar, Orders Table, Status Selector)
├── social.html           # Social Media Scheduler (3 Posts + 1 Reel PKT)
├── server.js             # Zero-dependency local Node.js server
├── package.json          # Project scripts
├── vercel.json           # Vercel deployment configuration
├── supabase_schema.sql   # SQL script to create orders table in Supabase
├── css/
│   └── styles.css        # Luxury restaurant styling & responsive layout
└── js/
    ├── config.js         # Settings (Dishes, Target Gmail, Supabase URL & Key)
    ├── supabaseClient.js # Supabase connection, insert & update operations
    ├── emailService.js   # FormSubmit & Gmail dispatch service
    ├── app.js            # Customer website logic & cart handling
    └── admin.js          # Admin authentication & status updater
```

