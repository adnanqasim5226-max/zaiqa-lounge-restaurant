// ==============================================================================
// BUFFER SOCIAL MEDIA SERVICE
// Connects to Buffer GraphQL API for real-time social media scheduling
// Account: adnanqasim5226@gmail.com
// Channels: Instagram (@adnan31272026) & TikTok (@adnan__5226)
// ==============================================================================

(function () {
  const API_ENDPOINT = "/api/buffer";

  // Pre-configured Hackathon Scheduled Posts per Specification
  const HACKATHON_POSTS = [
    {
      id: "post-1",
      day: "Day 1",
      title: "Menu / Grand Opening",
      type: "post",
      scheduledTimePkt: "12:30 PM PKT",
      timeHour: 12,
      timeMinute: 30,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      caption: "✨ Craving something royally delicious for lunch? Zaiqa Lounge & Grill is officially open! Feast on our authentic slow-cooked Chicken Dum Biryani infused with pure saffron and caramelized onions. Served sizzling with fresh raita! Order now via link in bio! 🍽️🔥 #KarachiFood #BiryaniLovers #LunchGoals #ZaiqaLounge",
      rationale: "People look for food before lunch break (12:30 PM)",
      channelService: "instagram"
    },
    {
      id: "post-2",
      day: "Day 1",
      title: "Sizzling Dish Being Made (ASMR Reel)",
      type: "reel",
      scheduledTimePkt: "8:00 PM PKT",
      timeHour: 20,
      timeMinute: 0,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
      caption: "🔥 Hear that sizzle? Watch our master chef prepare signature Shinwari Mutton Karahi on high flame with pure desi ghee and fresh green chilies. Tonight's dinner sorted! 🤤 Drop a ❤️ if you want a plate! #KarachiStreetFood #MuttonKarahi #FoodReels #DinnerVibes",
      rationale: "Dinner time, most people are online & active (8:00 PM)",
      channelService: "instagram"
    },
    {
      id: "post-3",
      day: "Day 2",
      title: "Today's Deal (Lunch Flash Promo)",
      type: "post",
      scheduledTimePkt: "1:00 PM PKT",
      timeHour: 13,
      timeMinute: 0,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      caption: "🍔 TODAY'S LUNCH FLASH DEAL! Buy 1 Gourmet Cheesy Smash Burger & get loaded seasoned fries + chilled Mint Lemonade Cooler at 40% OFF! Valid only between 1:00 PM - 4:00 PM today. Order on our live site now! 🚀 #BurgerDeal #KarachiEats #LunchSpecial",
      rationale: "Office & student lunch break cravings peak (1:00 PM)",
      channelService: "instagram"
    },
    {
      id: "post-4",
      day: "Day 3",
      title: "Customer Favourite (Reshmi Malai Boti)",
      type: "post",
      scheduledTimePkt: "7:30 PM PKT",
      timeHour: 19,
      timeMinute: 30,
      image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
      caption: "👑 Voted Karachi's #1 Favourite! Our Reshmi Malai Boti is melt-in-the-mouth perfection, marinated in rich cream, subtle roasted herbs, and flame-grilled to tender bliss. Perfect for family dinner tonight! Call 03072820877 to reserve. #BBQLovers #MalaiBoti #KarachiBBQ",
      rationale: "Evening time, families decide what to order for dinner (7:30 PM)",
      channelService: "instagram"
    }
  ];

  async function callBufferGraphQL(query, variables = {}) {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
      });
      return await res.json();
    } catch (err) {
      console.error("Buffer API network error:", err);
      throw err;
    }
  }

  window.BufferService = {
    posts: HACKATHON_POSTS,

    // Check account status and get connected channels
    getAccountAndChannels: async function () {
      const query = `
        query GetBufferAccount {
          account {
            id
            email
            organizations {
              id
              name
            }
          }
          channels(input: { organizationId: "6acb1196bbd36cccd5c8f28e" }) {
            id
            name
            service
            avatar
          }
        }
      `;
      const result = await callBufferGraphQL(query);
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      return result.data;
    },

    // Schedule a single post to Buffer
    schedulePost: async function ({ channelId, text, imageUrl, isReel = false, mode = "addToQueue" }) {
      const mutation = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post {
                id
                status
                dueAt
              }
            }
            ... on MutationError {
              message
            }
          }
        }
      `;

      const input = {
        channelId: channelId,
        text: text,
        mode: mode,
        schedulingType: "automatic",
        needsApproval: false,
        metadata: {
          instagram: {
            type: isReel ? "reel" : "post",
            shouldShareToFeed: true
          }
        },
        assets: [
          {
            image: {
              url: imageUrl
            }
          }
        ]
      };

      const result = await callBufferGraphQL(mutation, { input });
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const action = result.data.createPost;
      if (action.message) {
        throw new Error(action.message);
      }

      return action.post;
    },

    // Local Storage helpers for tracking which posts have been published
    getScheduledHistory: function () {
      try {
        return JSON.parse(localStorage.getItem("buffer_scheduled_history") || "{}");
      } catch (e) {
        return {};
      }
    },

    saveScheduledPost: function (postId, bufferData) {
      const history = this.getScheduledHistory();
      history[postId] = {
        ...bufferData,
        scheduledAt: new Date().toISOString()
      };
      localStorage.setItem("buffer_scheduled_history", JSON.stringify(history));
    }
  };
})();

