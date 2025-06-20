import { db } from "./db";
import { quizzes, users, chatRooms } from "@shared/schema";
import { mangaQuizzes } from "./quiz-data.js";

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  // Check if data already exists
  const existingQuizzes = await db.select().from(quizzes).limit(1);
  if (existingQuizzes.length > 0) {
    console.log("✅ Database already seeded, skipping...");
    return;
  }

  // Sample quiz data
  const sampleQuizzes = [
    {
      title: "Shonen Legends",
      description: "Test your knowledge about the greatest shonen anime series!",
      difficulty: "easy",
      xpReward: 15,
      questions: [
        {
          question: "Who is the main character of Naruto?",
          options: ["Sasuke Uchiha", "Naruto Uzumaki", "Sakura Haruno", "Kakashi Hatake"],
          correctAnswer: 1,
          explanation: "Naruto Uzumaki is the main protagonist of the Naruto series."
        },
        {
          question: "What is Luffy's dream in One Piece?",
          options: ["To become a Marine", "To find the One Piece treasure", "To defeat all pirates", "To become a chef"],
          correctAnswer: 1,
          explanation: "Monkey D. Luffy dreams of finding the legendary treasure One Piece and becoming the Pirate King."
        },
        {
          question: "What power does Saitama have in One Punch Man?",
          options: ["Super speed", "Mind reading", "Incredible strength", "Time manipulation"],
          correctAnswer: 2,
          explanation: "Saitama has incredible strength that allows him to defeat any enemy with just one punch."
        },
        {
          question: "What are the giant creatures called in Attack on Titan?",
          options: ["Giants", "Titans", "Monsters", "Colossal Beings"],
          correctAnswer: 1,
          explanation: "The giant humanoid creatures in Attack on Titan are called Titans."
        },
        {
          question: "What is Tanjiro's goal in Demon Slayer?",
          options: ["To become the strongest demon slayer", "To cure his sister Nezuko", "To avenge his family", "To master all breathing techniques"],
          correctAnswer: 1,
          explanation: "Tanjiro's main goal is to find a way to turn his sister Nezuko back into a human."
        }
      ]
    },
    {
      title: "Anime Protagonists",
      description: "How well do you know your favorite anime heroes?",
      difficulty: "medium",
      xpReward: 25,
      questions: [
        {
          question: "Who is known as the 'Copy Ninja'?",
          options: ["Itachi Uchiha", "Kakashi Hatake", "Jiraiya", "Minato Namikaze"],
          correctAnswer: 1,
          explanation: "Kakashi Hatake is known as the Copy Ninja due to his Sharingan ability to copy techniques."
        },
        {
          question: "What is the name of Gon's father in Hunter x Hunter?",
          options: ["Ging Freecss", "Leorio Paradinight", "Kurapika", "Killua Zoldyck"],
          correctAnswer: 0,
          explanation: "Ging Freecss is Gon's father and a legendary Hunter."
        },
        {
          question: "What is the name of the time machine in Steins;Gate?",
          options: ["Phone Microwave", "Time Leap Machine", "D-Mail Device", "SERN Machine"],
          correctAnswer: 0,
          explanation: "The Phone Microwave (name subject to change) is the time machine created by the lab members."
        },
        {
          question: "Who is the strongest Hashira in Demon Slayer?",
          options: ["Giyu Tomioka", "Kyojuro Rengoku", "Gyomei Himejima", "Sanemi Shinazugawa"],
          correctAnswer: 2,
          explanation: "Gyomei Himejima, the Stone Hashira, is considered the strongest among the Hashira."
        }
      ]
    },
    {
      title: "Otaku Supreme Challenge",
      description: "Only true anime masters can complete this ultimate test!",
      difficulty: "hard",
      xpReward: 50,
      questions: [
        {
          question: "What is the real name of the main character in Death Note?",
          options: ["Light Turner", "Light Yagami", "Kira Yamato", "Yagami Light"],
          correctAnswer: 1,
          explanation: "Light Yagami is the real name of the protagonist who becomes known as Kira."
        },
        {
          question: "In Fullmetal Alchemist, what is the first law of Equivalent Exchange?",
          options: ["Energy cannot be created or destroyed", "To obtain something, something of equal value must be lost", "Mass equals energy", "Nothing is impossible"],
          correctAnswer: 1,
          explanation: "The first law of Equivalent Exchange states that to obtain something, something of equal value must be lost."
        },
        {
          question: "Who composed the music for most Studio Ghibli films?",
          options: ["Yoko Kanno", "Joe Hisaishi", "Hiroyuki Sawano", "Taku Iwasaki"],
          correctAnswer: 1,
          explanation: "Joe Hisaishi is the renowned composer behind most Studio Ghibli film soundtracks."
        }
      ]
    },
  ];



  try {
    // Insert quiz data
    console.log("🧠 Adding sample quiz data...");
    await db.insert(quizzes).values(sampleQuizzes);

    // Create admin user first
    console.log("👤 Creating admin user...");
    const adminUser = await db.insert(users).values({
      id: "admin",
      email: "admin@otakunexus.com",
      password: "$2a$10$dummy.hash.for.admin.user.account",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      isAdmin: true,
      level: 100,
      xp: 99999
    }).returning();

    // Create default chat room
    console.log("💬 Creating default chat room...");
    await db.insert(chatRooms).values({
      name: "General Discussion",
      description: "Welcome to the general chat! Discuss anime, manga, and more!",
      isPublic: true,
      createdBy: adminUser[0].id
    });

    console.log("✅ Database seeded successfully!");
    console.log(`   - ${sampleQuizzes.length} quiz entries`);
    console.log(`   - 1 default chat room`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().catch(console.error);