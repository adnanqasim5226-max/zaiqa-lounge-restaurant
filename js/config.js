// ==========================================
// RESTAURANT APP CONFIGURATION
// SMIT Hackathon - Part A & Part B
// ==========================================

const CONFIG = {
  // Restaurant Details
  restaurant: {
    name: "Zaiqa Lounge & Grill",
    tagline: "Authentic Taste, Royal Experience",
    phone: "03072820877",
    address: "Gulistan-e-johar, Phelwan Goth, Block-9, Karachi",
    openingHours: "Mon - Sun: 11:00 AM - 01:00 AM",
    deliveryFee: 150, // in PKR
    freeDeliveryThreshold: 2000, // in PKR
    currency: "Rs."
  },

  // Target Gmail specified by user for Part A (Order comes to Gmail)
  targetGmail: "adnanqasim5226@gmail.com",

  // Supabase Configuration
  // Project URL and Anon Public Key configured
  supabase: {
    url: "https://emlafsbmvwcsiklpxgel.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGFmc2Jtdndjc2lrbHB4Z2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MDExODksImV4cCI6MjEwNzE3NzE4OX0.6VkO2nyHkKlhqHMc997l1I1lPrM0rT5chsCEYZbsV6s"
  },

  // Admin Credentials for Part B
  admin: {
    email: "admin@zaiqa.com",
    password: "admin123"
  },

  // Buffer API Social Media Automation (Part B Requirement 7)
  buffer: {
    apiKey: "iZiikjxlhIzEzzUr3wvSy_FYaBBz3bvkuZzcLFOnCtr",
    organizationId: "6acb1196bbd36cccd5c8f28e",
    channels: {
      instagram: {
        id: "6acb15d4778b240e2fd2d137",
        name: "adnan31272026",
        service: "instagram"
      },
      tiktok: {
        id: "6acb17e7778b240e2fd2dfe2",
        name: "adnan__5226",
        service: "tiktok"
      }
    }
  },

  // Menu Items (At least 6 required by Part A; we provide 8 mouth-watering dishes)
  dishes: [
    {
      id: "dish-1",
      name: "Royal Dum Biryani",
      category: "Mains",
      price: 650,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      description: "Fragrant basmati rice slow-cooked with tender spiced chicken, saffron, potatoes, and caramelized onions. Served with fresh raita.",
      badge: "Chef's Special",
      spicyLevel: "Medium",
      rating: 4.9
    },
    {
      id: "dish-2",
      name: "Shinwari Mutton Karahi",
      category: "Karahi & Handi",
      price: 1850,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
      description: "Fresh mutton cooked in traditional iron wok with fresh tomatoes, ginger, green chilies, and black pepper. Traditional Peshawar recipe.",
      badge: "Bestseller",
      spicyLevel: "Spicy",
      rating: 4.8
    },
    {
      id: "dish-3",
      name: "Reshmi Malai Boti",
      category: "BBQ & Grill",
      price: 850,
      image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
      description: "Melt-in-mouth boneless chicken cubes marinated in heavy cream, green coriander, cheese, and subtle aromatic spices.",
      badge: "Popular",
      spicyLevel: "Mild",
      rating: 4.9
    },
    {
      id: "dish-4",
      name: "Grilled Seekh Kababs",
      category: "BBQ & Grill",
      price: 750,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      description: "Juicy minced beef skewers flame-grilled over burning charcoal with fresh herbs, cumin, and roasted spices. (4 Pieces)",
      badge: "Hot & Spicy",
      spicyLevel: "Spicy",
      rating: 4.7
    },
    {
      id: "dish-5",
      name: "Cheesy Gourmet Smash Burger",
      category: "Fast Food",
      price: 890,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      description: "Double smashed prime beef patties topped with melted cheddar, caramelized onions, secret smoky sauce on toasted brioche bun.",
      badge: "Trending",
      spicyLevel: "Mild",
      rating: 4.8
    },
    {
      id: "dish-6",
      name: "Creamy Chicken Alfredo Pasta",
      category: "Continental",
      price: 990,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
      description: "Fettuccine pasta tossed in rich parmesan garlic cream sauce, topped with grilled herb chicken and fresh parsley.",
      badge: "Must Try",
      spicyLevel: "Mild",
      rating: 4.7
    },
    {
      id: "dish-7",
      name: "Royal Gulab Jamun Sundae",
      category: "Desserts",
      price: 450,
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
      description: "Warm golden gulab jamun served over rich vanilla ice cream, garnished with crushed pistachios, almonds, and silver vark.",
      badge: "Sweet Tooth",
      spicyLevel: "Sweet",
      rating: 5.0
    },
    {
      id: "dish-8",
      name: "Fresh Mint Lemonade Cooler",
      category: "Beverages",
      price: 320,
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      description: "Refreshing crushed garden mint blended with fresh lemon juice, rock salt, and sparkling soda over crushed ice.",
      badge: "Chilled",
      spicyLevel: "Refreshing",
      rating: 4.9
    }
  ],

  // 7-Day Weekly Fixed Dishes Menu (ایک ہفتے کا مخصوص مینو)
  weeklyMenu: [
    {
      dayIndex: 1,
      dayName: "Monday",
      dayUrdu: "پیر",
      dishId: "dish-1",
      dishName: "Royal Dum Biryani",
      tagline: "Fragrant Saffron & Spiced Tender Chicken on Charcoal Dum",
      deal: "Includes Fresh Mint Raita & Salad",
      price: 650,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      badge: "Monday Kickoff"
    },
    {
      dayIndex: 2,
      dayName: "Tuesday",
      dayUrdu: "منگل",
      dishId: "dish-5",
      dishName: "Cheesy Gourmet Smash Burger",
      tagline: "Double Prime Beef Patties, Melted Cheddar & Smoky Sauce",
      deal: "Served with Golden Crispy Fries",
      price: 890,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      badge: "Burger Tuesday"
    },
    {
      dayIndex: 3,
      dayName: "Wednesday",
      dayUrdu: "بدھ",
      dishId: "dish-6",
      dishName: "Creamy Chicken Alfredo Pasta",
      tagline: "Velvety Garlic Parmesan Sauce & Herb-Grilled Chicken",
      deal: "Includes Toasted Garlic Bread",
      price: 990,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
      badge: "Midweek Continental"
    },
    {
      dayIndex: 4,
      dayName: "Thursday",
      dayUrdu: "جمعرات",
      dishId: "dish-4",
      dishName: "Grilled Seekh Kababs",
      tagline: "Flame-Grilled Juicy Minced Beef Skewers with Fresh Herbs",
      deal: "4 Jumbo Skewers with Mint Chutney & Puri Paratha",
      price: 750,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      badge: "BBQ Sizzler Night"
    },
    {
      dayIndex: 5,
      dayName: "Friday",
      dayUrdu: "جمعہ",
      dishId: "dish-2",
      dishName: "Shinwari Mutton Karahi",
      tagline: "Peshawari Iron Wok Mutton in Makhan & Fresh Tomatoes",
      deal: "Special Friday Dawaat with Hot Roghani Naan",
      price: 1850,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
      badge: "Juma Mubarak Special"
    },
    {
      dayIndex: 6,
      dayName: "Saturday",
      dayUrdu: "ہفتہ",
      dishId: "dish-3",
      dishName: "Reshmi Malai Boti Platter",
      tagline: "Melt-in-Mouth Heavy Cream Marinated Charcoal Chicken Boti",
      deal: "Served with Imli Sauce, Raita & Salad",
      price: 850,
      image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
      badge: "Weekend Charcoal Feast"
    },
    {
      dayIndex: 0,
      dayName: "Sunday",
      dayUrdu: "اتوار",
      dishId: "dish-1",
      dishName: "Sunday Royal Dum Biryani Deg",
      tagline: "Karachi's Favorite Slow-Cooked Royal Biryani with Dessert",
      deal: "Free Gulab Jamun Sundae with Family Orders",
      price: 650,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      badge: "Sunday Family Dawaat"
    }
  ]
};

// Export configuration globally for browser scripts and Node.js
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
