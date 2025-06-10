import { db } from "./db";
import { animes, quizzes, videos } from "@shared/schema";

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
  ],
  // Ajoutez vos nouveaux quiz ici
  {
    title: "Quiz Personnalisé",
    description: "Un quiz créé par vous !",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel anime préférez-vous ?",
        options: ["One Piece", "Naruto", "Dragon Ball", "Attack on Titan"],
        correctAnswer: 0,
        explanation: "Toutes les réponses sont bonnes, c'est une question de goût !"
      },
      {
        question: "Combien d'épisodes a One Piece ?",
        options: ["500+", "800+", "1000+", "1100+"],
        correctAnswer: 3,
        explanation: "One Piece a dépassé les 1100 épisodes !"
      },
    ]
  }
];

  // Sample video data
  const sampleVideos = [
    {
      title: "Attack on Titan - Opening 1 'Guren no Yumiya'",
      description: "Epic opening theme that perfectly captures the intensity of humanity's fight for survival.",
      videoUrl: "https://www.youtube.com/watch?v=8OkpRK2_gVs",
      thumbnailUrl: "https://img.youtube.com/vi/8OkpRK2_gVs/maxresdefault.jpg",
      duration: "1:30",
      views: 52000000,
      category: "opening"
    },
    {
      title: "Demon Slayer AMV - 'Legends Never Die'",
      description: "An incredible AMV showcasing the best moments from Demon Slayer with epic music.",
      videoUrl: "https://www.youtube.com/watch?v=r6zIGXun57U",
      thumbnailUrl: "https://img.youtube.com/vi/r6zIGXun57U/maxresdefault.jpg",
      duration: "3:45",
      views: 8500000,
      category: "amv"
    },
    {
      title: "Naruto vs Sasuke Final Battle AMV",
      description: "The most epic final battle in anime history set to amazing music.",
      videoUrl: "https://www.youtube.com/watch?v=NSX7c6mfM8o",
      thumbnailUrl: "https://img.youtube.com/vi/NSX7c6mfM8o/maxresdefault.jpg",
      duration: "4:12",
      views: 15000000,
      category: "amv"
    },
    {
      title: "One Piece - Opening 1 'We Are!'",
      description: "The classic opening that started the greatest pirate adventure of all time.",
      videoUrl: "https://www.youtube.com/watch?v=BcZKDMDc4_Y",
      thumbnailUrl: "https://img.youtube.com/vi/BcZKDMDc4_Y/maxresdefault.jpg",
      duration: "2:58",
      views: 28000000,
      category: "opening"
    },
    {
      title: "Hunter x Hunter - Gon vs Pitou AMV",
      description: "One of the most emotional and powerful moments in anime history.",
      videoUrl: "https://www.youtube.com/watch?v=HSNH_0ANwF8",
      thumbnailUrl: "https://img.youtube.com/vi/HSNH_0ANwF8/maxresdefault.jpg",
      duration: "3:20",
      views: 6200000,
      category: "amv"
    },
    {
      title: "Jujutsu Kaisen - Opening 1 'Kaikai Kitan'",
      description: "The catchy opening that introduced us to the world of cursed spirits.",
      videoUrl: "https://www.youtube.com/watch?v=ym5tT7Oqm2Y",
      thumbnailUrl: "https://img.youtube.com/vi/ym5tT7Oqm2Y/maxresdefault.jpg",
      duration: "1:29",
      views: 45000000,
      category: "opening"
    }
  ];

  try {
    // Insert anime data
    console.log("📺 Adding sample anime data...");
    await db.insert(animes).values(sampleAnimes);

    // Insert quiz data
    console.log("🧠 Adding sample quiz data...");
    await db.insert(quizzes).values(sampleQuizzes);

    // Insert video data
    console.log("🎬 Adding sample video data...");
    await db.insert(videos).values(sampleVideos);

    console.log("✅ Database seeded successfully!");
    console.log(`   - ${sampleAnimes.length} anime entries`);
    console.log(`   - ${sampleQuizzes.length} quiz entries`);
    console.log(`   - ${sampleVideos.length} video entries`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase().catch(console.error);