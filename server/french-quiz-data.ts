export const frenchAnimeQuizzes = [
  // Niveau Débutant - Animes populaires
  {
    title: "Animes Populaires pour Débutants",
    description: "Testez vos connaissances sur les animes les plus connus et accessibles",
    difficulty: "easy" as const,
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

  // Quiz Studio Ghibli
  {
    title: "Univers de Studio Ghibli",
    description: "Explorez l'univers magique des films de Hayao Miyazaki et Studio Ghibli",
    difficulty: "easy" as const,
    xpReward: 20,
    questions: [
      {
        question: "Quel est le nom de l'héroïne principale dans Mon Voisin Totoro ?",
        options: ["Chihiro", "Satsuki", "Kiki", "Nausicaä"],
        correctAnswer: 1,
        explanation: "Satsuki est l'une des deux sœurs principales dans Mon Voisin Totoro, avec sa petite sœur Mei."
      },
      {
        question: "Dans Le Voyage de Chihiro, comment s'appelle le dragon qui aide Chihiro ?",
        options: ["Haku", "Calcifer", "No-Face", "Totoro"],
        correctAnswer: 0,
        explanation: "Haku est un dragon qui aide Chihiro tout au long de son aventure dans le monde des esprits."
      },
      {
        question: "Quel est le métier de Kiki dans Kiki la petite sorcière ?",
        options: ["Boulangère", "Livreuse", "Guérisseuse", "Professeure"],
        correctAnswer: 1,
        explanation: "Kiki utilise ses pouvoirs de vol pour créer un service de livraison express dans sa nouvelle ville."
      },
      {
        question: "Dans Princesse Mononoke, comment s'appelle le héros ?",
        options: ["Ashitaka", "Haku", "Jiro", "Pazu"],
        correctAnswer: 0,
        explanation: "Ashitaka est le prince guerrier qui devient maudit et part en quête de guérison."
      },
      {
        question: "Quel animal mythique rencontre Mei dans Mon Voisin Totoro ?",
        options: ["Un dragon", "Totoro", "Un phénix", "Un kappa"],
        correctAnswer: 1,
        explanation: "Totoro est l'esprit de la forêt, une créature douce et mystérieuse qui devient l'ami des enfants."
      }
    ]
  },

  // Quiz JoJo's Bizarre Adventure
  {
    title: "JoJo's Bizarre Adventure",
    description: "L'univers bizarre et fascinant de la famille Joestar",
    difficulty: "medium" as const,
    xpReward: 25,
    questions: [
      {
        question: "Comment s'appelle le premier JoJo de la série ?",
        options: ["Joseph Joestar", "Jonathan Joestar", "Jotaro Kujo", "Josuke Higashikata"],
        correctAnswer: 1,
        explanation: "Jonathan Joestar est le protagoniste de la première partie, Phantom Blood."
      },
      {
        question: "Quel est le nom du Stand de Jotaro Kujo ?",
        options: ["The World", "Star Platinum", "Crazy Diamond", "Gold Experience"],
        correctAnswer: 1,
        explanation: "Star Platinum est le Stand extrêmement puissant de Jotaro, capable d'arrêter le temps."
      },
      {
        question: "Qui est le vampire principal antagoniste de Jonathan Joestar ?",
        options: ["Kars", "Wamuu", "Dio Brando", "Pucci"],
        correctAnswer: 2,
        explanation: "Dio Brando devient vampire et reste l'ennemi principal de la famille Joestar à travers plusieurs générations."
      },
      {
        question: "Dans quelle ville se déroule principalement Diamond is Unbreakable ?",
        options: ["Tokyo", "Morioh", "Naples", "New York"],
        correctAnswer: 1,
        explanation: "Morioh est la ville fictive du Japon où Josuke vit et où se déroulent les événements de la partie 4."
      },
      {
        question: "Quel est le cri de guerre caractéristique des Joestar ?",
        options: ["WRYYY", "MUDA MUDA", "ORA ORA ORA", "DORARARA"],
        correctAnswer: 2,
        explanation: "ORA ORA ORA est le cri de guerre emblématique utilisé par plusieurs JoJo lors de leurs attaques."
      }
    ]
  },

  // Quiz Openings et Musiques d'anime
  {
    title: "Openings et Musiques d'Anime",
    description: "Testez vos connaissances sur les génériques et musiques les plus emblématiques",
    difficulty: "medium" as const,
    xpReward: 25,
    questions: [
      {
        question: "Qui chante l'opening 'Unravel' de Tokyo Ghoul ?",
        options: ["TK from Ling tosite sigure", "ONE OK ROCK", "FLOW", "Asian Kung-Fu Generation"],
        correctAnswer: 0,
        explanation: "TK from Ling tosite sigure interprète 'Unravel', l'opening iconique de Tokyo Ghoul."
      },
      {
        question: "Quel est le titre du premier opening de Attack on Titan ?",
        options: ["Guren no Yumiya", "Shinzou wo Sasageyo", "Red Swan", "My War"],
        correctAnswer: 0,
        explanation: "'Guren no Yumiya' (Arc Cramoisi) par Linked Horizon est le premier opening d'Attack on Titan."
      },
      {
        question: "Qui compose la musique de la plupart des films Studio Ghibli ?",
        options: ["Yoko Kanno", "Joe Hisaishi", "Hiroyuki Sawano", "Yann Tiersen"],
        correctAnswer: 1,
        explanation: "Joe Hisaishi est le compositeur attitré des films de Miyazaki et Studio Ghibli."
      },
      {
        question: "Quel opening de Naruto est chanté par FLOW ?",
        options: ["GO!!!", "Sign", "Blue Bird", "Silhouette"],
        correctAnswer: 0,
        explanation: "FLOW interprète 'GO!!!' qui est le 4ème opening de Naruto."
      },
      {
        question: "Dans quel anime entend-on l'opening 'Tank!' ?",
        options: ["Samurai Champloo", "Cowboy Bebop", "Space Dandy", "Trigun"],
        correctAnswer: 1,
        explanation: "'Tank!' composé par Yoko Kanno est l'opening jazz emblématique de Cowboy Bebop."
      }
    ]
  },

  // Quiz Culture Otaku Avancée
  {
    title: "Culture Otaku Avancée",
    description: "Pour les vrais connaisseurs de la culture anime et manga",
    difficulty: "hard" as const,
    xpReward: 40,
    questions: [
      {
        question: "Quel studio d'animation a produit Akira en 1988 ?",
        options: ["Studio Pierrot", "Madhouse", "Studio Ghibli", "TMS Entertainment"],
        correctAnswer: 3,
        explanation: "TMS Entertainment a produit Akira, film révolutionnaire d'animation japonaise."
      },
      {
        question: "Dans Serial Experiments Lain, quel est le nom du réseau virtuel ?",
        options: ["The Wired", "The Net", "Cyberia", "The Matrix"],
        correctAnswer: 0,
        explanation: "The Wired est le réseau de communication global dans Serial Experiments Lain."
      },
      {
        question: "Qui est le créateur original du manga Berserk ?",
        options: ["Kentaro Miura", "Naoki Urasawa", "Makoto Yukimura", "Tsutomu Nihei"],
        correctAnswer: 0,
        explanation: "Kentaro Miura était le mangaka légendaire créateur de Berserk, décédé en 2021."
      },
      {
        question: "Dans Neon Genesis Evangelion, que signifie 'AT Field' ?",
        options: ["Absolute Terror Field", "Angel Territory Field", "Absolute Territory Field", "Anti-Terror Field"],
        correctAnswer: 2,
        explanation: "AT Field signifie 'Absolute Territory Field', une barrière psychique dans Evangelion."
      },
      {
        question: "Quel est le nom du mangaka de One Piece ?",
        options: ["Masashi Kishimoto", "Eiichiro Oda", "Akira Toriyama", "Tite Kubo"],
        correctAnswer: 1,
        explanation: "Eiichiro Oda est le créateur et auteur du manga One Piece depuis 1997."
      }
    ]
  },

  // Quiz Films d'Animation
  {
    title: "Films d'Animation Japonais",
    description: "Les chefs-d'œuvre du cinéma d'animation japonais",
    difficulty: "medium" as const,
    xpReward: 30,
    questions: [
      {
        question: "Qui a réalisé 'Your Name' (Kimi no Na wa) ?",
        options: ["Makoto Shinkai", "Mamoru Hosoda", "Satoshi Kon", "Hideaki Anno"],
        correctAnswer: 0,
        explanation: "Makoto Shinkai a réalisé 'Your Name', succès phénoménal du cinéma d'animation."
      },
      {
        question: "Dans quel film apparaît le personnage de Calcifer ?",
        options: ["Princesse Mononoke", "Le Château ambulant", "Nausicaä", "Porco Rosso"],
        correctAnswer: 1,
        explanation: "Calcifer est le démon du feu dans 'Le Château ambulant' de Miyazaki."
      },
      {
        question: "Quel film de Satoshi Kon explore les rêves et la réalité ?",
        options: ["Perfect Blue", "Paprika", "Tokyo Godfathers", "Millennium Actress"],
        correctAnswer: 1,
        explanation: "Paprika de Satoshi Kon explore magistralement les frontières entre rêves et réalité."
      },
      {
        question: "Dans 'Akira', dans quelle ville se déroule l'action ?",
        options: ["Neo-Tokyo", "New Tokyo", "Tokyo-3", "Future Tokyo"],
        correctAnswer: 0,
        explanation: "L'action d'Akira se déroule dans Neo-Tokyo en 2019, ville reconstruite après la Troisième Guerre Mondiale."
      },
      {
        question: "Qui a composé la musique du film 'Ghost in the Shell' (1995) ?",
        options: ["Joe Hisaishi", "Yoko Kanno", "Kenji Kawai", "Hiroyuki Sawano"],
        correctAnswer: 2,
        explanation: "Kenji Kawai a composé la bande sonore mystique et puissante de Ghost in the Shell."
      }
    ]
  }
];