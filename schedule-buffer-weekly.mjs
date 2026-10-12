// Script to schedule all 7 days of the weekly dishes menu on Buffer
import { readFileSync } from "fs";

const BUFFER_TOKEN = "iZiikjxlhIzEzzUr3wvSy_FYaBBz3bvkuZzcLFOnCtr";
const ORG_ID = "6acb1196bbd36cccd5c8f28e";

async function bufferRequest(query, variables = {}) {
  const res = await fetch("https://api.buffer.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BUFFER_TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });
  return await res.json();
}

async function main() {
  console.log("=== Buffer 7-Day Weekly Menu Scheduler ===");

  // 1. Fetch Channels
  const accountQuery = `
    query GetAccount {
      account {
        id
        email
      }
      channels(input: { organizationId: "${ORG_ID}" }) {
        id
        name
        service
      }
    }
  `;

  const accData = await bufferRequest(accountQuery);
  console.log("Account info:", accData.data?.account);
  const channels = accData.data?.channels || [];
  console.log("Channels found:", channels);

  if (channels.length === 0) {
    console.error("No channels found for organization!");
    return;
  }

  const igChannel = channels.find(c => c.service === "instagram") || channels[0];
  const tiktokChannel = channels.find(c => c.service === "tiktok");

  console.log(`Using Instagram Channel: ${igChannel.name} (${igChannel.id})`);
  if (tiktokChannel) {
    console.log(`Using TikTok Channel: ${tiktokChannel.name} (${tiktokChannel.id})`);
  }

  // 2. The 7 Days Menu
  const weeklyMenu = [
    {
      day: "Monday",
      urdu: "پیر",
      dish: "Royal Dum Biryani",
      price: 650,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      deal: "Includes Fresh Mint Raita & Salad",
      caption: "✨ Monday Kickoff with Karachi's Most Fragrant Royal Dum Biryani! Slow-cooked for 6 hours on charcoal dum with pure saffron and caramelized onions. Served with fresh raita!\n\n📍 Zaiqa Lounge & Grill, Gulistan-e-Johar, Karachi\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 Fast Delivery: 03072820877\n\n#ZaiqaLounge #BiryaniLovers #KarachiFood #MondaySpecials"
    },
    {
      day: "Tuesday",
      urdu: "منگل",
      dish: "Cheesy Gourmet Smash Burger",
      price: 890,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      deal: "Served with Golden Crispy Fries",
      caption: "🍔 Burger Tuesday! Double smashed prime beef patties, bubbling melted cheddar & our signature smoky burger sauce on toasted brioche with crispy golden fries!\n\n📍 Zaiqa Lounge & Grill\n🛵 Order in 2 Mins: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#BurgerTuesday #KarachiEats #SmashBurger #ZaiqaLounge"
    },
    {
      day: "Wednesday",
      urdu: "بدھ",
      dish: "Creamy Chicken Alfredo Pasta",
      price: 990,
      image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
      deal: "Includes Toasted Garlic Bread",
      caption: "🍝 Midweek Comfort: Velvety Chicken Alfredo Fettuccine! Tossed in rich garlic parmesan cream sauce and crowned with herb-grilled chicken breast slices.\n\n📍 Zaiqa Lounge & Grill, Karachi\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#PastaLovers #ChickenAlfredo #ContinentalFood #ZaiqaLounge"
    },
    {
      day: "Thursday",
      urdu: "جمعرات",
      dish: "Grilled Seekh Kababs (Sizzler)",
      price: 750,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      deal: "4 Jumbo Skewers with Mint Chutney & Puri Paratha",
      caption: "🍢 Thursday BBQ Night: Flame-Kissed Juicy Seekh Kababs! Jumbo minced beef skewers infused with green herbs and roasted cumin, sizzling right off burning coals.\n\n📍 Zaiqa Lounge & Grill, Karachi\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#BBQLovers #SeekhKabab #KarachiBBQ #ZaiqaLounge"
    },
    {
      day: "Friday",
      urdu: "جمعہ",
      dish: "Shinwari Mutton Karahi (Juma Special)",
      price: 1850,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
      deal: "Special Friday Makhan & Tomatoes with Hot Roghani Naan",
      caption: "🔥 Juma Mubarak! Treat your family to our legendary Shinwari Mutton Karahi cooked in traditional iron woks with pure makhan, ripe tomatoes, and fresh ginger juliennes.\n\n📍 Zaiqa Lounge & Grill, Gulistan-e-Johar\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#JumaMubarak #ShinwariKarahi #MuttonKarahi #ZaiqaLounge"
    },
    {
      day: "Saturday",
      urdu: "ہفتہ",
      dish: "Reshmi Malai Boti Platter",
      price: 850,
      image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80",
      deal: "Melt-in-Mouth Cream Marinated Chicken with Imli Sauce",
      caption: "✨ Saturday Night Feast: Melt-in-Mouth Reshmi Malai Boti! Boneless chicken marinated in pure heavy cream, cheese, and subtle aromatic spices charred over glowing coals.\n\n📍 Zaiqa Lounge & Grill\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#MalaiBoti #SaturdayFeast #KarachiFood #ZaiqaLounge"
    },
    {
      day: "Sunday",
      urdu: "اتوار",
      dish: "Sunday Royal Dum Biryani Deg",
      price: 650,
      image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      deal: "Free Shahi Gulab Jamun Sundae on Family Orders",
      caption: "👑 Sunday Family Dawaat! End the week on a royal note with our signature Royal Dum Biryani Deg and Complimentary Gulab Jamun Ice Cream Sundae!\n\n📍 Zaiqa Lounge & Grill, Karachi\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#SundayDawaat #BiryaniDeg #SundaySpecials #ZaiqaLounge"
    }
  ];

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

  console.log(`\nScheduling all 7 days (${weeklyMenu.length} posts) to Buffer Queue...`);

  const results = [];
  for (const item of weeklyMenu) {
    console.log(`\n--> Scheduling ${item.day} (${item.dish})...`);

    const input = {
      channelId: igChannel.id,
      text: item.caption,
      mode: "addToQueue",
      schedulingType: "automatic",
      needsApproval: false,
      metadata: {
        instagram: {
          type: "post",
          shouldShareToFeed: true
        }
      },
      assets: [
        {
          image: {
            url: item.image
          }
        }
      ]
    };

    try {
      const res = await bufferRequest(mutation, { input });
      if (res.errors) {
        console.error(`❌ Error scheduling ${item.day}:`, res.errors[0]?.message);
        results.push({ day: item.day, dish: item.dish, success: false, error: res.errors[0]?.message });
      } else {
        const action = res.data?.createPost;
        if (action?.message) {
          console.error(`❌ Mutation error ${item.day}:`, action.message);
          results.push({ day: item.day, dish: item.dish, success: false, error: action.message });
        } else if (action?.post) {
          console.log(`✅ ${item.day} Scheduled successfully! Buffer Post ID: ${action.post.id}, Status: ${action.post.status}`);
          results.push({ day: item.day, dish: item.dish, success: true, postId: action.post.id, dueAt: action.post.dueAt });
        }
      }
    } catch (err) {
      console.error(`❌ Exception scheduling ${item.day}:`, err.message);
      results.push({ day: item.day, dish: item.dish, success: false, error: err.message });
    }

    // Small delay between requests to be gentle to API
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log("\n=== SCHEDULING SUMMARY ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
