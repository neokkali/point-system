const SECRET_KEY = "MY_SUPER_SECRET_TOKEN"; // نفس الكود الموجود في الـ API
const API_URL =
  "https://ka3.vercel.app/api/room/ea0fd208-0679-4707-862e-a895fa942fc2/bot"; // استبدل YOUR_ROOM_ID بالـ ID الحقيقي للغرفة

const eventPlayers = [
  { username: "حديتني للوجد", points: 108 },
  { username: "C r u z", points: 120 },
  { username: "ironside", points: 120 },
  { username: "مُؤرَّقة ..", points: 101 },
  { username: "أراك", points: 42 },
  { username: "Soriano .", points: 34 },
  { username: "وصال", points: 31 },
  { username: "شديد..عبدالقوي", points: 21 },
  { username: "اوكية", points: 22 },
  { username: "قلاف .", points: 22 },
  { username: "1.", points: 20 },
  { username: "جوجو", points: 14 },
  { username: "kiraaaa", points: 8 },
  { username: "Anas.", points: 8 },
  { username: "استفهام", points: 7 },
  { username: "Q ; راحلين", points: 5 },
  { username: "فرير", points: 3 },
  { username: "كربوش", points: 6 },
  { username: "سيمفونية", points: 1 },
  { username: "Fing", points: 1 },
];

async function seedData() {
  console.log("🚀 جاري بدء عملية إرسال البيانات...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bot-secret": SECRET_KEY,
      },
      body: JSON.stringify({
        adminUserId: "f58012fd-7d4c-4fc1-a6b4-78d1d70d6e7f", // ضع هنا الـ ID الخاص بك (Faisal)
        players: eventPlayers,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ نجاح:", result.message);
    } else {
      console.error("❌ فشل:", result.error || result.message);
    }
  } catch (error) {
    console.error("🌐 خطأ في الاتصال بالـ API:", error);
  }
}

seedData();
