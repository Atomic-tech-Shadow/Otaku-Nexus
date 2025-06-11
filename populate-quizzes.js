const frenchAnimeQuizzes = [
  // Niveau Débutant - Animes populaires
  {
    title: "Animes Populaires pour Débutants",
    description: "Testez vos connaissances sur les animes les plus connus et accessibles",
    difficulty: "easy",
    xpReward: 15,
    questions: [
      {
        question: "Quel est le nom du personnage principal de Naruto ?",
        options: ["Naruto Uzumaki", "Sasuke Uchiha", "Sakura Haruno", "Kakashi Hatake"],
        correctAnswer: 0,
        explanation: "Naruto Uzumaki est le protagoniste principal de la série Naruto, un ninja déterminé à devenir Hokage."
      },
      {
        question: "Dans Dragon Ball, comment s'appelle le héros principal ?",
        options: ["Vegeta", "Piccolo", "Goku", "Gohan"],
        correctAnswer: 2,
        explanation: "Son Goku, de son vrai nom Kakarot, est le personnage principal de la série Dragon Ball."
      },
      {
        question: "Quel est le rêve de Monkey D. Luffy dans One Piece ?",
        options: ["Devenir Marine", "Trouver le trésor One Piece", "Devenir cuisinier", "Sauver le monde"],
        correctAnswer: 1,
        explanation: "Luffy rêve de trouver le légendaire trésor One Piece et de devenir le Roi des Pirates."
      },
      {
        question: "Dans Attack on Titan, comment appelle-t-on les créatures géantes ?",
        options: ["Géants", "Titans", "Monstres", "Colosses"],
        correctAnswer: 1,
        explanation: "Les créatures géantes humanoïdes dans Attack on Titan sont appelées Titans."
      },
      {
        question: "Quel pouvoir spécial possède Saitama dans One Punch Man ?",
        options: ["Super vitesse", "Lecture des pensées", "Force incroyable", "Manipulation du temps"],
        correctAnswer: 2,
        explanation: "Saitama possède une force si incroyable qu'il peut vaincre n'importe quel ennemi d'un seul coup de poing."
      }
    ]
  },
  // Niveau Facile - Shonen classiques
  {
    title: "Shonen Classiques",
    description: "Les grands classiques du manga shonen que tout otaku devrait connaître",
    difficulty: "easy",
    xpReward: 20,
    questions: [
      {
        question: "Dans Demon Slayer, quel est le nom de l'épée de Tanjiro ?",
        options: ["Épée de Nichirin", "Épée de Démon", "Épée Solaire", "Épée Spirituelle"],
        correctAnswer: 0,
        explanation: "Tanjiro utilise une épée de Nichirin, forgée spécialement pour tuer les démons."
      },
      {
        question: "Combien de Dragon Balls faut-il réunir pour invoquer Shenron ?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 2,
        explanation: "Il faut réunir les 7 Dragon Balls pour pouvoir invoquer le dragon Shenron et formuler un vœu."
      },
      {
        question: "Quel est le nom du village ninja de Naruto ?",
        options: ["Village de la Feuille", "Village du Sable", "Village de la Brume", "Village du Rocher"],
        correctAnswer: 0,
        explanation: "Naruto vient de Konohagakure, aussi appelé le Village Caché de la Feuille."
      },
      {
        question: "Dans My Hero Academia, comment appelle-t-on les super-pouvoirs ?",
        options: ["Quirks", "Powers", "Abilities", "Talents"],
        correctAnswer: 0,
        explanation: "Dans My Hero Academia, les super-pouvoirs sont appelés 'Quirks' ou 'Alters' en français."
      },
      {
        question: "Quel est le nom de l'académie dans Assassination Classroom ?",
        options: ["Classe 3-A", "Classe 3-E", "Classe 2-B", "Classe 1-A"],
        correctAnswer: 1,
        explanation: "L'histoire se déroule dans la classe 3-E du collège Kunugigaoka, une classe pour les élèves en difficulté."
      }
    ]
  },
  // Niveau Moyen - Seinen et connaissances approfondies
  {
    title: "Seinen et Animes Matures",
    description: "Pour les connaisseurs d'animes plus complexes et matures",
    difficulty: "medium",
    xpReward: 30,
    questions: [
      {
        question: "Dans Death Note, quel est le vrai nom de L ?",
        options: ["Lawliet", "L Lawliet", "Elle Lawliet", "Ryuzaki"],
        correctAnswer: 1,
        explanation: "Le vrai nom complet de L est L Lawliet, révélé plus tard dans la série."
      },
      {
        question: "Dans Steins;Gate, comment s'appelle le laboratoire de Okabe ?",
        options: ["Future Gadget Laboratory", "Time Machine Lab", "Scientific Laboratory", "Physics Research Lab"],
        correctAnswer: 0,
        explanation: "Okabe et ses amis dirigent le 'Future Gadget Laboratory', un petit laboratoire d'inventions."
      },
      {
        question: "Dans Monster, quel est le nom du protagoniste chirurgien ?",
        options: ["Kenzo Tenma", "Johan Liebert", "Heinrich Lunge", "Wolfgang Grimmer"],
        correctAnswer: 0,
        explanation: "Le Dr. Kenzo Tenma est le protagoniste principal, un neurochirurgien japonais travaillant en Allemagne."
      },
      {
        question: "Dans Psycho-Pass, comment s'appelle le système de surveillance ?",
        options: ["Sibyl System", "Justice System", "Psycho System", "Dominator System"],
        correctAnswer: 0,
        explanation: "Le Système Sibyl analyse et juge la santé mentale et les tendances criminelles des citoyens."
      },
      {
        question: "Dans Ghost in the Shell SAC, quel est le nom de la section spéciale ?",
        options: ["Section 7", "Section 8", "Section 9", "Section 10"],
        correctAnswer: 2,
        explanation: "La Section 9 est l'unité d'élite de sécurité publique dirigée par le Major Kusanagi."
      },
      {
        question: "Dans Berserk, quel est le nom de l'épée de Guts ?",
        options: ["Dragon Slayer", "Demon Slayer", "God Slayer", "Beast Slayer"],
        correctAnswer: 0,
        explanation: "L'épée de Guts s'appelle 'Dragon Slayer', une énorme épée forgée pour tuer un dragon."
      }
    ]
  },
  // Niveau Moyen - Animes des années 90-2000
  {
    title: "Classiques des Années 90-2000",
    description: "Les animes qui ont marqué une génération d'otakus",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Dans Neon Genesis Evangelion, comment s'appelle l'organisation de Shinji ?",
        options: ["SEELE", "NERV", "GEHIRN", "WILLE"],
        correctAnswer: 1,
        explanation: "NERV est l'organisation militaire secrète qui pilote les Evangelions contre les Anges."
      },
      {
        question: "Dans Cowboy Bebop, quel est le nom du vaisseau de l'équipage ?",
        options: ["Swordfish", "Bebop", "Red Tail", "Hammerhead"],
        correctAnswer: 1,
        explanation: "Le Bebop est le vaisseau principal où vit l'équipage de chasseurs de primes."
      },
      {
        question: "Dans Trigun, quel est le surnom de Vash ?",
        options: ["The Stampede", "The Humanoid Typhoon", "The Desert Gunman", "The Legendary Gunslinger"],
        correctAnswer: 1,
        explanation: "Vash est surnommé 'The Humanoid Typhoon' à cause des destructions qui suivent son passage."
      },
      {
        question: "Dans Rurouni Kenshin, quelle est la technique signature de Kenshin ?",
        options: ["Hiten Mitsurugi-ryu", "Kamiya Kasshin-ryu", "Nikaido Heiho", "Muteki-ryu"],
        correctAnswer: 0,
        explanation: "Kenshin pratique le Hiten Mitsurugi-ryu, un style d'épée extrêmement rapide et puissant."
      },
      {
        question: "Dans Serial Experiments Lain, quel est le nom du réseau informatique ?",
        options: ["The Net", "The Wired", "The Web", "The Matrix"],
        correctAnswer: 1,
        explanation: "The Wired est le réseau de communication globale central à l'intrigue de Lain."
      }
    ]
  },
  // Niveau Difficile - Connaissances d'expert
  {
    title: "Expert Otaku Challenge",
    description: "Réservé aux vrais connaisseurs avec une culture anime approfondie",
    difficulty: "hard",
    xpReward: 50,
    questions: [
      {
        question: "Dans Legend of the Galactic Heroes, qui est l'auteur du roman original ?",
        options: ["Yoshiki Tanaka", "Hiroshi Yamamoto", "Tow Ubukata", "Gen Urobuchi"],
        correctAnswer: 0,
        explanation: "Yoshiki Tanaka est l'auteur de la série de romans 'Legend of the Galactic Heroes'."
      },
      {
        question: "Dans Lain, quel est le nom complet du protocole de communication ?",
        options: ["IPv7", "Protocol 7", "Copland OS", "IPv6"],
        correctAnswer: 2,
        explanation: "Copland OS est mentionné comme le système d'exploitation dans Serial Experiments Lain."
      },
      {
        question: "Dans Texhnolyze, dans quelle ville souterraine se déroule l'action ?",
        options: ["Lux", "Gabe", "Shibuya", "Underground City"],
        correctAnswer: 0,
        explanation: "Lux est la ville souterraine où se déroule l'intrigue sombre de Texhnolyze."
      },
      {
        question: "Quel studio d'animation a produit 'Perfect Blue' ?",
        options: ["Studio Ghibli", "Madhouse", "Production I.G", "Mappa"],
        correctAnswer: 1,
        explanation: "Perfect Blue, le chef-d'œuvre de Satoshi Kon, a été produit par le studio Madhouse."
      },
      {
        question: "Dans Haibane Renmei, que signifie 'Sin-bound' ?",
        options: ["Lié par le péché", "Condamné", "Souillé", "Toutes ces réponses"],
        correctAnswer: 3,
        explanation: "Sin-bound désigne les Haibane qui portent le poids d'un péché de leur vie passée."
      },
      {
        question: "Qui a composé la musique de Ghost in the Shell (1995) ?",
        options: ["Yoko Kanno", "Kenji Kawai", "Hiroyuki Sawano", "Toru Takemitsu"],
        correctAnswer: 1,
        explanation: "Kenji Kawai a composé la magnifique bande sonore du film Ghost in the Shell de 1995."
      }
    ]
  },
  // Niveau Facile - Studio Ghibli
  {
    title: "Magie du Studio Ghibli",
    description: "L'univers enchanteur des films du Studio Ghibli",
    difficulty: "easy",
    xpReward: 20,
    questions: [
      {
        question: "Qui est le cofondateur et réalisateur principal du Studio Ghibli ?",
        options: ["Hayao Miyazaki", "Isao Takahata", "Toshio Suzuki", "Mamoru Hosoda"],
        correctAnswer: 0,
        explanation: "Hayao Miyazaki est le cofondateur et réalisateur emblématique du Studio Ghibli."
      },
      {
        question: "Dans Mon Voisin Totoro, comment s'appellent les deux sœurs ?",
        options: ["Satsuki et Mei", "Kiki et Ursula", "San et Moro", "Chihiro et Lin"],
        correctAnswer: 0,
        explanation: "Les deux sœurs principales sont Satsuki (l'aînée) et Mei (la cadette)."
      },
      {
        question: "Dans Le Voyage de Chihiro, quel est le vrai nom de Haku ?",
        options: ["Spirited Away", "Nigihayami Kohaku Nushi", "Dragon des Eaux", "Maître des Rivières"],
        correctAnswer: 1,
        explanation: "Le vrai nom de Haku est Nigihayami Kohaku Nushi, l'esprit de la rivière Kohaku."
      },
      {
        question: "Dans Princesse Mononoké, comment s'appelle le village de San ?",
        options: ["Village des Loups", "Forêt Sacrée", "Elle vit avec les loups", "Mont Shishigami"],
        correctAnswer: 2,
        explanation: "San, la Princesse Mononoké, a été élevée par les loups dans la forêt."
      },
      {
        question: "Dans Kiki la Petite Sorcière, quel est le nom du chat de Kiki ?",
        options: ["Totoro", "Jiji", "Catbus", "Calcifer"],
        correctAnswer: 1,
        explanation: "Jiji est le chat noir parlant qui accompagne Kiki dans ses aventures."
      }
    ]
  },
  // Niveau Moyen - Animes récents (2010s-2020s)
  {
    title: "Nouvelle Génération (2010-2020)",
    description: "Les animes qui définissent la nouvelle décennie",
    difficulty: "medium",
    xpReward: 35,
    questions: [
      {
        question: "Dans Jujutsu Kaisen, quel est le nom de la technique de Gojo ?",
        options: ["Domain Expansion", "Limitless", "Six Eyes", "Infinity"],
        correctAnswer: 1,
        explanation: "La technique héréditaire de Gojo s'appelle 'Limitless' (Muryokusho)."
      },
      {
        question: "Dans Attack on Titan, quel est le nom du père d'Eren ?",
        options: ["Grisha Yeager", "Keith Shadis", "Rod Reiss", "Zeke Yeager"],
        correctAnswer: 0,
        explanation: "Grisha Yeager est le père d'Eren et détient des secrets cruciaux sur les Titans."
      },
      {
        question: "Dans Violet Evergarden, pour quelle organisation travaille Violet ?",
        options: ["CH Postal Company", "Auto Memory Doll Service", "Leidenschaftlich Army", "Evergarden Company"],
        correctAnswer: 0,
        explanation: "Violet travaille pour la CH Postal Company comme Auto Memory Doll."
      },
      {
        question: "Dans Your Name, comment s'appelle la ville de Mitsuha ?",
        options: ["Itomori", "Miyamizu", "Hida", "Gifu"],
        correctAnswer: 0,
        explanation: "Mitsuha vit dans la petite ville fictive d'Itomori dans la préfecture de Gifu."
      },
      {
        question: "Dans Mob Psycho 100, quel est le pourcentage maximal de Mob ?",
        options: ["100%", "1000%", "???%", "∞%"],
        correctAnswer: 2,
        explanation: "Le niveau maximal de Mob est représenté par '???%', un état incontrôlable."
      },
      {
        question: "Dans Dr. Stone, quelle est la formule que répète constamment Senku ?",
        options: ["E=mc²", "H₂SO₄", "10 milliards %", "Science Rules"],
        correctAnswer: 2,
        explanation: "Senku dit souvent 'Juu-oku percent' (10 milliards %) pour exprimer sa certitude scientifique."
      }
    ]
  },
  // Niveau Difficile - Animes d'auteur et expérimentaux
  {
    title: "Animes d'Auteur et Expérimentaux",
    description: "Pour les amateurs d'œuvres artistiques et avant-gardistes",
    difficulty: "hard",
    xpReward: 45,
    questions: [
      {
        question: "Dans Angel's Egg, qui est le réalisateur ?",
        options: ["Mamoru Oshii", "Satoshi Kon", "Hideaki Anno", "Masaaki Yuasa"],
        correctAnswer: 0,
        explanation: "Angel's Egg (1985) est un film expérimental réalisé par Mamoru Oshii."
      },
      {
        question: "Dans Mind Game, quel studio a produit ce film d'animation unique ?",
        options: ["Studio 4°C", "Madhouse", "Production I.G", "Shaft"],
        correctAnswer: 0,
        explanation: "Mind Game (2004) a été produit par Studio 4°C, connu pour ses œuvres expérimentales."
      },
      {
        question: "Dans Paranoia Agent, quel est le nom du mystérieux agresseur ?",
        options: ["Lil' Slugger", "Shounen Bat", "Golden Bat", "Night Stalker"],
        correctAnswer: 1,
        explanation: "L'agresseur mystérieux est appelé 'Shounen Bat' (Lil' Slugger en anglais)."
      },
      {
        question: "Quel réalisateur a créé la trilogie Rebuild of Evangelion ?",
        options: ["Hideaki Anno", "Kazuya Tsurumaki", "Masayuki", "Shinji Higuchi"],
        correctAnswer: 0,
        explanation: "Hideaki Anno a dirigé les films Rebuild of Evangelion, une réinterprétation de sa série originale."
      },
      {
        question: "Dans Kaiba, dans quel type d'univers évolue le protagoniste ?",
        options: ["Cyberpunk", "Transfert de mémoire", "Post-apocalyptique", "Steampunk"],
        correctAnswer: 1,
        explanation: "Kaiba se déroule dans un univers où les mémoires peuvent être transférées entre les corps."
      }
    ]
  },
  // Niveau Facile - Animes Romance et Slice of Life
  {
    title: "Romance et Tranches de Vie",
    description: "Les histoires touchantes du quotidien et de l'amour",
    difficulty: "easy",
    xpReward: 18,
    questions: [
      {
        question: "Dans Your Lie in April, quel instrument joue Kousei ?",
        options: ["Violon", "Piano", "Guitare", "Flûte"],
        correctAnswer: 1,
        explanation: "Kousei Arima est un prodige du piano qui a perdu sa capacité à entendre sa propre musique."
      },
      {
        question: "Dans Toradora!, comment surnomme-t-on Taiga ?",
        options: ["Palmtop Tiger", "Little Dragon", "Tiny Tornado", "Small Storm"],
        correctAnswer: 0,
        explanation: "Taiga Aisaka est surnommée 'Palmtop Tiger' à cause de sa petite taille et son caractère féroce."
      },
      {
        question: "Dans A Silent Voice, de quel handicap souffre Shouko ?",
        options: ["Cécité", "Surdité", "Mutité", "Paralysie"],
        correctAnswer: 1,
        explanation: "Shouko Nishimiya est malentendante, ce qui est central au thème de l'histoire."
      },
      {
        question: "Dans K-On!, quel instrument joue Yui ?",
        options: ["Basse", "Batterie", "Guitare", "Clavier"],
        correctAnswer: 2,
        explanation: "Yui Hirasawa apprend à jouer de la guitare électrique dans le club de musique."
      },
      {
        question: "Dans Clannad, comment s'appelle la ville où se déroule l'histoire ?",
        options: ["Hikarizaka", "Sakuragaoka", "Mizuiro", "Kanon"],
        correctAnswer: 0,
        explanation: "L'histoire de Clannad se déroule dans la ville fictive de Hikarizaka."
      }
    ]
  },
  // Niveau Moyen - Animes de sport
  {
    title: "Champions du Sport Anime",
    description: "L'esprit de compétition et de dépassement de soi",
    difficulty: "medium",
    xpReward: 28,
    questions: [
      {
        question: "Dans Haikyuu!!, quel est le surnom de Hinata ?",
        options: ["Little Giant", "Orange Hurricane", "Jumping Spider", "Sky Walker"],
        correctAnswer: 0,
        explanation: "Hinata aspire à devenir le nouveau 'Little Giant' comme son héros du lycée Karasuno."
      },
      {
        question: "Dans Kuroko no Basket, combien y a-t-il de membres dans la Generation of Miracles ?",
        options: ["4", "5", "6", "7"],
        correctAnswer: 2,
        explanation: "La Generation of Miracles compte 6 membres, dont Kuroko qui est le 'fantôme'."
      },
      {
        question: "Dans Captain Tsubasa, quel est le nom de l'équipe nationale du Japon ?",
        options: ["Samurai Blue", "Japan National Team", "Rising Sun", "Blue Warriors"],
        correctAnswer: 1,
        explanation: "L'équipe nationale japonaise est simplement appelée 'Japan National Team' dans la série."
      },
      {
        question: "Dans Slam Dunk, dans quelle position joue Sakuragi ?",
        options: ["Meneur", "Arrière", "Ailier", "Pivot"],
        correctAnswer: 3,
        explanation: "Sakuragi Hanamichi joue au poste de pivot (center) malgré son manque d'expérience initial."
      },
      {
        question: "Dans Free!, quel style de nage préfère Haruka ?",
        options: ["Brasse", "Dos crawlé", "Nage libre", "Papillon"],
        correctAnswer: 2,
        explanation: "Haruka Nanase excelle particulièrement en nage libre (freestyle)."
      },
      {
        question: "Dans Yuri!!! on ICE, de quel pays vient Victor ?",
        options: ["États-Unis", "Canada", "Russie", "Finlande"],
        correctAnswer: 2,
        explanation: "Victor Nikiforov est un patineur artistique russe et champion du monde."
      }
    ]
  }
];

// Function to populate quizzes via API
async function populateQuizzes() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Starting quiz population...');
  
  try {
    // First, delete all existing quizzes via admin endpoint
    console.log('Clearing existing quizzes...');
    const deleteResponse = await fetch(`${baseUrl}/api/quizzes/all`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (deleteResponse.ok) {
      console.log('Successfully cleared existing quizzes');
    } else {
      console.log('No existing quizzes to clear or insufficient permissions');
    }
    
    // Then add all French quizzes
    let successCount = 0;
    for (const quiz of frenchAnimeQuizzes) {
      try {
        const response = await fetch(`${baseUrl}/api/quizzes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(quiz)
        });
        
        if (response.ok) {
          const createdQuiz = await response.json();
          console.log(`✓ Created: ${createdQuiz.title} (${quiz.difficulty}, ${quiz.xpReward} XP)`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`✗ Failed to create "${quiz.title}": ${error}`);
        }
      } catch (error) {
        console.log(`✗ Error creating "${quiz.title}": ${error.message}`);
      }
    }
    
    console.log(`\nPopulation complete! Successfully created ${successCount}/${frenchAnimeQuizzes.length} quizzes.`);
    
    // Verify by fetching all quizzes
    const verifyResponse = await fetch(`${baseUrl}/api/quizzes`, {
      credentials: 'include'
    });
    
    if (verifyResponse.ok) {
      const allQuizzes = await verifyResponse.json();
      console.log(`\nTotal quizzes in database: ${allQuizzes.length}`);
      
      const byDifficulty = allQuizzes.reduce((acc, quiz) => {
        acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Breakdown by difficulty:', byDifficulty);
    }
    
  } catch (error) {
    console.error('Population failed:', error);
  }
}

// Run the population
populateQuizzes();