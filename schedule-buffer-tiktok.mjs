// Script to schedule TikTok posts on Buffer for Zaiqa Lounge
const BUFFER_TOKEN = "iZiikjxlhIzEzzUr3wvSy_FYaBBz3bvkuZzcLFOnCtr";
const ORG_ID = "6acb1196bbd36cccd5c8f28e";
const TIKTOK_CHANNEL_ID = "6acb17e7778b240e2fd2dfe2"; // adnan__5226

const VIDEO_URL = "https://adnan-social-media.pages.dev/localhost/short-story-20261011-173501.mp4";

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
  console.log("=== Buffer TikTok Post Scheduler ===");

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

  const tiktokPosts = [
    {
      title: "Zaiqa Lounge - Royal Flavors of Karachi",
      caption: "🔥 Experience Karachi's finest Charcoal BBQ & Royal Dum Biryani at Zaiqa Lounge & Grill! 🍽️ Slow-cooked over charcoal for 6 hours.\n\n📍 Gulistan-e-Johar, Karachi\n🛵 Order Now: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#ZaiqaLounge #KarachiFood #FoodTikTok #BiryaniLovers #BBQ",
      videoUrl: VIDEO_URL
    },
    {
      title: "Shinwari Mutton Karahi & Sizzlers",
      caption: "🤤 Hear that sizzle! Watch master chef cook sizzling Shinwari Mutton Karahi with pure makhan & fresh green chilies.\n\n📍 Zaiqa Lounge & Grill, Karachi\n🛵 Order Online: https://zaiqa-lounge-restaurant.vercel.app\n📞 03072820877\n\n#ShinwariKarahi #KarachiFoodie #TikTokFood #KarahiLovers",
      videoUrl: VIDEO_URL
    }
  ];

  for (const item of tiktokPosts) {
    console.log(`\n--> Scheduling TikTok post: "${item.title}"...`);

    const input = {
      channelId: TIKTOK_CHANNEL_ID,
      text: item.caption,
      mode: "addToQueue",
      schedulingType: "automatic",
      needsApproval: false,
      metadata: {
        tiktok: {
          title: item.title.slice(0, 95)
        }
      },
      assets: [
        {
          video: {
            url: item.videoUrl
          }
        }
      ]
    };

    const res = await bufferRequest(mutation, { input });
    if (res.errors) {
      console.error(`❌ Error scheduling TikTok:`, res.errors[0]?.message);
    } else {
      const action = res.data?.createPost;
      if (action?.message) {
        console.error(`❌ Mutation error:`, action.message);
      } else if (action?.post) {
        console.log(`✅ TikTok Post Scheduled successfully!`);
        console.log(`   Buffer Post ID: ${action.post.id}`);
        console.log(`   Status: ${action.post.status}`);
        console.log(`   Due At: ${action.post.dueAt}`);
      }
    }

    await new Promise(r => setTimeout(r, 1500));
  }
}

main().catch(console.error);
