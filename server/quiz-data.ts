// Collection complète de quiz manga/anime
export const mangaQuizzes = [
  {
    title: "Naruto - Les Bases",
    description: "Testez vos connaissances sur l'univers de Naruto",
    difficulty: "easy",
    xpReward: 15,
    questions: [
      {
        question: "Quel est le nom complet du héros principal ?",
        options: ["Naruto Uzumaki", "Naruto Namikaze", "Naruto Uchiha", "Naruto Hyuga"],
        correctAnswer: 0,
        explanation: "Naruto Uzumaki est le nom complet du protagoniste principal."
      },
      {
        question: "Qui est le sensei de l'équipe 7 ?",
        options: ["Iruka", "Kakashi", "Asuma", "Kurenai"],
        correctAnswer: 1,
        explanation: "Kakashi Hatake est le sensei de l'équipe 7 composée de Naruto, Sasuke et Sakura."
      },
      {
        question: "Quel démon à queue est scellé en Naruto ?",
        options: ["Huit-Queues", "Neuf-Queues", "Sept-Queues", "Six-Queues"],
        correctAnswer: 1,
        explanation: "Kurama, le démon renard à neuf queues, est scellé dans Naruto depuis sa naissance."
      },
      {
        question: "Comment s'appelle le village de Naruto ?",
        options: ["Village de la Brume", "Village du Sable", "Village de la Feuille", "Village du Rocher"],
        correctAnswer: 2,
        explanation: "Konoha, le Village Caché de la Feuille, est le village natal de Naruto."
      }
    ]
  },
  {
    title: "One Piece - L'Équipage du Chapeau de Paille",
    description: "Connaissez-vous bien l'équipage de Luffy ?",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel est le rêve de Roronoa Zoro ?",
        options: ["Devenir le Roi des Pirates", "Trouver All Blue", "Devenir le meilleur épéiste", "Dessiner une carte du monde"],
        correctAnswer: 2,
        explanation: "Zoro rêve de devenir le meilleur épéiste du monde pour honorer la promesse faite à son amie Kuina."
      },
      {
        question: "Combien de Berries était la première prime de Luffy ?",
        options: ["30 millions", "100 millions", "50 millions", "80 millions"],
        correctAnswer: 0,
        explanation: "La première prime de Luffy était de 30 millions de Berries après les événements d'Arlong Park."
      },
      {
        question: "Quel fruit du démon a mangé Luffy ?",
        options: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Hana Hana no Mi", "Yomi Yomi no Mi"],
        correctAnswer: 0,
        explanation: "Luffy a mangé le Gomu Gomu no Mi qui lui donne les propriétés du caoutchouc."
      },
      {
        question: "Qui était le cuisinier du restaurant Baratie ?",
        options: ["Zeff", "Sanji", "Patty", "Carne"],
        correctAnswer: 1,
        explanation: "Sanji travaillait comme cuisinier au Baratie avant de rejoindre l'équipage de Luffy."
      },
      {
        question: "Quel est le nom du navire de l'équipage ?",
        options: ["Merry Go", "Thousand Sunny", "Going Merry", "Red Force"],
        correctAnswer: 2,
        explanation: "Le Going Merry était le premier navire de l'équipage, remplacé plus tard par le Thousand Sunny."
      }
    ]
  },
  {
    title: "Attack on Titan - Les Titans",
    description: "Quiz sur l'univers sombre d'Attack on Titan",
    difficulty: "hard",
    xpReward: 35,
    questions: [
      {
        question: "Quel est le vrai nom du Titan Colossal ?",
        options: ["Bertholdt Hoover", "Reiner Braun", "Annie Leonhart", "Marcel Galliard"],
        correctAnswer: 0,
        explanation: "Bertholdt Hoover est l'identité du Titan Colossal qui a détruit le mur Maria."
      },
      {
        question: "Dans quel district Eren habite-t-il ?",
        options: ["District de Trost", "District de Shiganshina", "District de Karanes", "District de Stohess"],
        correctAnswer: 1,
        explanation: "Eren Yeager grandit dans le district de Shiganshina avant l'attaque du Titan Colossal."
      },
      {
        question: "Qui est le commandant du Bataillon d'Exploration ?",
        options: ["Levi Ackerman", "Hange Zoë", "Erwin Smith", "Mike Zacharias"],
        correctAnswer: 2,
        explanation: "Erwin Smith était le 13ème commandant du Bataillon d'Exploration."
      },
      {
        question: "Quel est le nom de l'équipement de manœuvre tridimensionnelle ?",
        options: ["ODM Gear", "3DMG", "Vertical Maneuvering Equipment", "Toutes les réponses"],
        correctAnswer: 3,
        explanation: "L'équipement est connu sous plusieurs noms : ODM Gear, 3DMG et Vertical Maneuvering Equipment."
      }
    ]
  },
  {
    title: "Dragon Ball Z - Les Saiyans",
    description: "Testez vos connaissances sur la race des guerriers Saiyans",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel est le nom de naissance de Goku ?",
        options: ["Kakarot", "Bardock", "Turles", "Raditz"],
        correctAnswer: 0,
        explanation: "Kakarot est le nom saiyan de Goku, donné à sa naissance sur la planète Vegeta."
      },
      {
        question: "Qui est le prince des Saiyans ?",
        options: ["Goku", "Vegeta", "Nappa", "Raditz"],
        correctAnswer: 1,
        explanation: "Vegeta est le prince de la race des Saiyans et l'un des derniers survivants."
      },
      {
        question: "Comment s'appelle la planète natale des Saiyans ?",
        options: ["Namek", "Vegeta", "Freezer", "Saiyan"],
        correctAnswer: 1,
        explanation: "La planète Vegeta était le monde natal des Saiyans avant sa destruction par Freezer."
      },
      {
        question: "Quel est le premier niveau de Super Saiyan atteint par Goku ?",
        options: ["Super Saiyan 2", "Super Saiyan", "Super Saiyan 3", "Super Saiyan God"],
        correctAnswer: 1,
        explanation: "Goku atteint pour la première fois le niveau Super Saiyan lors de son combat contre Freezer."
      }
    ]
  },
  {
    title: "Death Note - Le Carnet de la Mort",
    description: "Plongez dans l'univers psychologique de Death Note",
    difficulty: "hard",
    xpReward: 35,
    questions: [
      {
        question: "Quel est le vrai nom de L ?",
        options: ["L Lawliet", "Lawliet L", "Light Yagami", "Ryuk"],
        correctAnswer: 0,
        explanation: "Le vrai nom de L est L Lawliet, révélé plus tard dans la série."
      },
      {
        question: "Quel Shinigami laisse tomber son Death Note ?",
        options: ["Rem", "Ryuk", "Sidoh", "Jealous"],
        correctAnswer: 1,
        explanation: "Ryuk laisse volontairement tomber son Death Note dans le monde humain par ennui."
      },
      {
        question: "Combien de temps une personne vit-elle après avoir écrit son nom ?",
        options: ["40 secondes", "23 secondes", "1 minute", "30 secondes"],
        correctAnswer: 0,
        explanation: "Selon les règles du Death Note, la personne meurt dans les 40 secondes si aucune cause n'est spécifiée."
      },
      {
        question: "Quel pseudonyme Light utilise-t-il ?",
        options: ["L", "Kira", "N", "M"],
        correctAnswer: 1,
        explanation: "Light Yagami est connu sous le nom de Kira par le public et la police."
      }
    ]
  },
  {
    title: "My Hero Academia - Les Quirks",
    description: "Quiz sur les super-pouvoirs de My Hero Academia",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel est le Quirk de Izuku Midoriya ?",
        options: ["One For All", "All For One", "Explosion", "Half-Cold Half-Hot"],
        correctAnswer: 0,
        explanation: "Izuku hérite d'One For All d'All Might, un Quirk qui accumule le pouvoir."
      },
      {
        question: "Comment s'appelle l'école des héros ?",
        options: ["U.A. High School", "Hero Academy", "Plus Ultra School", "Yuei Academy"],
        correctAnswer: 0,
        explanation: "U.A. High School (Yuei) est la prestigieuse école de formation des héros."
      },
      {
        question: "Quel est le Quirk de Katsuki Bakugo ?",
        options: ["Explosion", "Fire", "Nitroglycerin", "Blast"],
        correctAnswer: 0,
        explanation: "Le Quirk 'Explosion' de Bakugo lui permet de créer des explosions avec sa sueur."
      },
      {
        question: "Qui est le Symbol of Peace ?",
        options: ["Endeavor", "All Might", "Best Jeanist", "Hawks"],
        correctAnswer: 1,
        explanation: "All Might était connu comme le Symbol of Peace avant de transmettre son pouvoir."
      }
    ]
  },
  {
    title: "Demon Slayer - Les Pourfendeurs",
    description: "Connaissances sur l'univers de Demon Slayer",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel style de respiration utilise Tanjiro ?",
        options: ["Respiration de l'Eau", "Respiration du Feu", "Respiration du Soleil", "Respiration du Vent"],
        correctAnswer: 0,
        explanation: "Tanjiro maîtrise d'abord la Respiration de l'Eau enseignée par Urokodaki."
      },
      {
        question: "Comment s'appelle la sœur de Tanjiro ?",
        options: ["Nezuko", "Kanao", "Shinobu", "Mitsuri"],
        correctAnswer: 0,
        explanation: "Nezuko Kamado est la sœur de Tanjiro transformée en démon."
      },
      {
        question: "Qui est le leader des Douze Lunes Démoniaques ?",
        options: ["Akaza", "Kokushibo", "Muzan Kibutsuji", "Doma"],
        correctAnswer: 2,
        explanation: "Muzan Kibutsuji est le roi des démons et leader des Douze Lunes Démoniaques."
      },
      {
        question: "Quel est le rang le plus élevé chez les Pourfendeurs ?",
        options: ["Pilier", "Kinoe", "Kinoto", "Maître"],
        correctAnswer: 0,
        explanation: "Les Piliers (Hashira) sont les neuf épéistes les plus puissants de l'organisation."
      }
    ]
  },
  {
    title: "Jujutsu Kaisen - Les Fléaux",
    description: "Testez vos connaissances sur les Fléaux et les sorciers",
    difficulty: "medium",
    xpReward: 30,
    questions: [
      {
        question: "Quel objet Yuji avale-t-il ?",
        options: ["Un doigt de Sukuna", "Un talisman maudit", "Une relique", "Un sceau"],
        correctAnswer: 0,
        explanation: "Yuji avale un doigt de Ryomen Sukuna, le Roi des Fléaux."
      },
      {
        question: "Où étudie Yuji ?",
        options: ["Tokyo Jujutsu High", "Kyoto Jujutsu High", "Tokyo Prefectural", "Sugisawa High"],
        correctAnswer: 0,
        explanation: "Yuji rejoint le Tokyo Jujutsu High après avoir avalé le doigt de Sukuna."
      },
      {
        question: "Quelle est la technique de Megumi ?",
        options: ["Ten Shadows", "Divine Dogs", "Shadow Technique", "Shikigami"],
        correctAnswer: 0,
        explanation: "Megumi utilise la technique Ten Shadows qui invoque des shikigami d'ombre."
      },
      {
        question: "Combien de doigts de Sukuna existent ?",
        options: ["10", "15", "20", "25"],
        correctAnswer: 2,
        explanation: "Il existe 20 doigts de Sukuna dispersés dans le monde, chacun contenant son pouvoir."
      }
    ]
  },
  {
    title: "Hunter x Hunter - Les Chasseurs",
    description: "Quiz avancé sur l'univers complexe de Hunter x Hunter",
    difficulty: "hard",
    xpReward: 40,
    questions: [
      {
        question: "Quel est le type de Nen de Gon ?",
        options: ["Renforcement", "Émission", "Manipulation", "Transformation"],
        correctAnswer: 0,
        explanation: "Gon est un utilisateur de Nen de type Renforcement, comme la plupart des combattants directs."
      },
      {
        question: "Quelle famille d'assassins appartient Killua ?",
        options: ["Zoldyck", "Kurta", "Nostrade", "Phantom"],
        correctAnswer: 0,
        explanation: "Killua Zoldyck appartient à la célèbre famille d'assassins Zoldyck."
      },
      {
        question: "Quel est le nom de l'examen pour devenir Chasseur ?",
        options: ["Hunter Exam", "Licence Hunter", "Test de Chasseur", "Épreuve Hunter"],
        correctAnswer: 0,
        explanation: "L'Hunter Exam est l'examen annuel pour obtenir une licence de Chasseur."
      },
      {
        question: "Qui dirige la Brigade Fantôme ?",
        options: ["Hisoka", "Chrollo Lucilfer", "Feitan", "Nobunaga"],
        correctAnswer: 1,
        explanation: "Chrollo Lucilfer est le leader et fondateur de la Brigade Fantôme."
      }
    ]
  },
  {
    title: "Tokyo Ghoul - Les Goules",
    description: "Explorez l'univers sombre de Tokyo Ghoul",
    difficulty: "hard",
    xpReward: 35,
    questions: [
      {
        question: "Comment s'appelle l'organisation anti-goules ?",
        options: ["CCG", "Aogiri Tree", "V", "Anteiku"],
        correctAnswer: 0,
        explanation: "La Commission of Counter Ghoul (CCG) est l'organisation gouvernementale anti-goules."
      },
      {
        question: "Quel est le kagune de Ken Kaneki ?",
        options: ["Rinkaku", "Ukaku", "Koukaku", "Bikaku"],
        correctAnswer: 0,
        explanation: "Kaneki possède un kagune de type Rinkaku, hérité de Rize."
      },
      {
        question: "Comment s'appelle le café où travaille Kaneki ?",
        options: ["Anteiku", "Re:", "Helter Skelter", "Ghoul Restaurant"],
        correctAnswer: 0,
        explanation: "Anteiku est le café qui sert de refuge aux goules pacifiques."
      },
      {
        question: "Qui est surnommé 'The One-Eyed Owl' ?",
        options: ["Eto", "Kaneki", "Arima", "Yoshimura"],
        correctAnswer: 0,
        explanation: "Eto Yoshimura est la véritable identité du One-Eyed Owl."
      }
    ]
  },
  {
    title: "Mob Psycho 100 - Les Pouvoirs ESP",
    description: "Quiz sur l'univers de Mob Psycho 100",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Quel est le vrai nom de Mob ?",
        options: ["Shigeo Kageyama", "Ritsu Kageyama", "Teruki Hanazawa", "Arataka Reigen"],
        correctAnswer: 0,
        explanation: "Shigeo Kageyama est le vrai nom de Mob, le protagoniste principal."
      },
      {
        question: "Que se passe-t-il quand Mob atteint 100% ?",
        options: ["Il s'évanouit", "Ses pouvoirs explosent", "Il devient normal", "Il téléporte"],
        correctAnswer: 1,
        explanation: "Quand les émotions de Mob atteignent 100%, ses pouvoirs psychiques explosent."
      },
      {
        question: "Qui est le mentor de Mob ?",
        options: ["Dimple", "Reigen", "Ritsu", "Teruki"],
        correctAnswer: 1,
        explanation: "Arataka Reigen est le mentor autoproclamé de Mob, propriétaire de Spirits and Such."
      },
      {
        question: "Comment s'appelle l'organisation de psychiques antagoniste ?",
        options: ["Claw", "ESP Union", "Psychic Society", "Mind Force"],
        correctAnswer: 0,
        explanation: "Claw est l'organisation de psychiques malveillants dirigée par Suzuki Toichiro."
      }
    ]
  },
  {
    title: "Fullmetal Alchemist - L'Alchimie",
    description: "Quiz sur les lois de l'alchimie et l'univers FMA",
    difficulty: "hard",
    xpReward: 35,
    questions: [
      {
        question: "Quelle est la première loi de l'alchimie ?",
        options: ["L'échange équivalent", "La conservation", "La transformation", "L'équilibre"],
        correctAnswer: 0,
        explanation: "La loi de l'échange équivalent stipule qu'on ne peut rien obtenir sans rien donner en retour."
      },
      {
        question: "Quel est le vrai nom du père des frères Elric ?",
        options: ["Van Hohenheim", "Hohenhiem Elric", "Von Hohenheim", "Slave Number 23"],
        correctAnswer: 0,
        explanation: "Van Hohenheim est le père d'Edward et Alphonse, ancien esclave devenu alchimiste."
      },
      {
        question: "Que cherchent Edward et Alphonse ?",
        options: ["La Pierre Philosophale", "Leur père", "La Vérité", "L'Homonculus"],
        correctAnswer: 0,
        explanation: "Les frères cherchent la Pierre Philosophale pour récupérer leurs corps perdus."
      },
      {
        question: "Combien y a-t-il d'Homonculus ?",
        options: ["5", "7", "9", "6"],
        correctAnswer: 1,
        explanation: "Il y a sept Homonculus, chacun représentant un péché capital."
      }
    ]
  },
  {
    title: "Code Geass - La Rébellion",
    description: "Quiz sur l'univers stratégique de Code Geass",
    difficulty: "hard",
    xpReward: 35,
    questions: [
      {
        question: "Quel est le vrai nom de Zero ?",
        options: ["Lelouch vi Britannia", "Suzaku Kururugi", "C.C.", "Kallen Kozuki"],
        correctAnswer: 0,
        explanation: "Lelouch vi Britannia est l'identité secrète de Zero, leader de la Rébellion."
      },
      {
        question: "Quel pouvoir possède Lelouch ?",
        options: ["Geass", "Code", "Sakuradite", "Knightmare"],
        correctAnswer: 0,
        explanation: "Le Geass de Lelouch lui permet de donner des ordres absolus à n'importe qui."
      },
      {
        question: "Comment s'appellent les robots de combat ?",
        options: ["Mecha", "Gundam", "Knightmare Frame", "Eva"],
        correctAnswer: 2,
        explanation: "Les Knightmare Frames sont les robots de combat utilisés dans Code Geass."
      },
      {
        question: "Qui donne son Geass à Lelouch ?",
        options: ["V.V.", "C.C.", "Marianne", "Charles"],
        correctAnswer: 1,
        explanation: "C.C. est la mystérieuse fille aux cheveux verts qui donne son Geass à Lelouch."
      }
    ]
  },
  {
    title: "Bleach - Les Shinigami",
    description: "Quiz sur l'univers spirituel de Bleach",
    difficulty: "medium",
    xpReward: 25,
    questions: [
      {
        question: "Comment s'appelle l'épée spirituelle d'Ichigo ?",
        options: ["Zangetsu", "Senbonzakura", "Hyorinmaru", "Benihime"],
        correctAnswer: 0,
        explanation: "Zangetsu est le nom du Zanpakuto d'Ichigo Kurosaki."
      },
      {
        question: "Quelle est la société des âmes ?",
        options: ["Soul Society", "Hueco Mundo", "World of the Living", "Dangai"],
        correctAnswer: 0,
        explanation: "La Soul Society est le monde des morts où vivent les Shinigami."
      },
      {
        question: "Qui est le capitaine de la 11ème division ?",
        options: ["Byakuya Kuchiki", "Kenpachi Zaraki", "Toshiro Hitsugaya", "Shunsui Kyoraku"],
        correctAnswer: 1,
        explanation: "Kenpachi Zaraki est le capitaine de la 11ème division, spécialisée dans le combat."
      },
      {
        question: "Comment s'appellent les monstres spirituels ?",
        options: ["Hollows", "Arrancar", "Espada", "Menos"],
        correctAnswer: 0,
        explanation: "Les Hollows sont les créatures spirituelles maléfiques que combattent les Shinigami."
      }
    ]
  }
];