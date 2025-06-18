import { db } from "./db";
import { animes, quizzes } from "@shared/schema";
import { mangaQuizzes } from "./quiz-data.js";

async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  // Sample anime data
  const sampleAnimes = [
    {
      malId: 16498,
      title: "Attack on Titan",
      synopsis: "Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
      score: "9.0",
      year: 2013,
      status: "Finished Airing",
      episodes: 25
    },
    {
      malId: 11061,
      title: "Hunter x Hunter (2011)",
      synopsis: "A young boy named Gon Freecss discovers that his father, who left him at a young age, is actually a world-renowned Hunter.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg",
      score: "9.1",
      year: 2011,
      status: "Finished Airing",
      episodes: 148
    },
    {
      malId: 9253,
      title: "Steins;Gate",
      synopsis: "A group of friends have customized their microwave into a device that can send text messages to the past.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
      score: "9.0",
      year: 2011,
      status: "Finished Airing",
      episodes: 24
    },
    {
      malId: 20,
      title: "Naruto",
      synopsis: "Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/13/17405.jpg",
      score: "8.4",
      year: 2002,
      status: "Finished Airing",
      episodes: 220
    },
    {
      malId: 21,
      title: "One Piece",
      synopsis: "Monkey D. Luffy sets off on an adventure with his pirate crew in hopes of finding the greatest treasure ever.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
      score: "9.2",
      year: 1999,
      status: "Currently Airing",
      episodes: 1000
    },
    {
      malId: 30276,
      title: "One Punch Man",
      synopsis: "The story of Saitama, a hero that only became a hero for fun. After three years of special training, he's become so strong that he's practically invincible.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/12/76049.jpg",
      score: "8.8",
      year: 2015,
      status: "Finished Airing",
      episodes: 12
    },
    {
      malId: 38000,
      title: "Demon Slayer",
      synopsis: "A family is attacked by demons and only two members survive - Tanjiro and his sister Nezuko, who is turning into a demon slowly.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
      score: "8.7",
      year: 2019,
      status: "Finished Airing",
      episodes: 26
    },
    {
      malId: 40748,
      title: "Jujutsu Kaisen",
      synopsis: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.",
      imageUrl: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
      score: "8.6",
      year: 2020,
      status: "Finished Airing",
      episodes: 24
    }
  ];

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
    // Insert anime data
    console.log("📺 Adding sample anime data...");
    await db.insert(animes).values(sampleAnimes);

    // Insert quiz data
    console.log("🧠 Adding sample quiz data...");
    await db.insert(quizzes).values(sampleQuizzes);

    console.log("✅ Database seeded successfully!");
    console.log(`   - ${sampleAnimes.length} anime entries`);
    console.log(`   - ${sampleQuizzes.length} quiz entries`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().catch(console.error);