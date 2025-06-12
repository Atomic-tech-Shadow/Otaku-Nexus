import { db } from "./db";
import { quizzes } from "../shared/schema";
import { modernQuizzes } from "./modern-quiz-data";

async function populateModernQuizzes() {
  try {
    console.log("🎯 Suppression des anciens quiz...");
    await db.delete(quizzes);

    console.log("🔥 Ajout des nouveaux quiz modernes...");
    
    for (const quiz of modernQuizzes) {
      await db.insert(quizzes).values({
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty as "easy" | "medium" | "hard",
        xpReward: quiz.xpReward,
        questions: quiz.questions,
        imageUrl: quiz.imageUrl,
        isActive: true,
        isFeatured: Math.random() > 0.7 // 30% de chance d'être featured
      });
    }

    console.log(`✅ ${modernQuizzes.length} quiz modernes ajoutés avec succès!`);
    
    const quizCount = await db.select().from(quizzes);
    console.log(`📊 Total des quiz dans la base: ${quizCount.length}`);
    
  } catch (error) {
    console.error("❌ Erreur lors de la population des quiz:", error);
    throw error;
  }
}

// Exécuter si appelé directement
populateModernQuizzes()
  .then(() => {
    console.log("🎉 Population terminée!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Erreur fatale:", error);
    process.exit(1);
  });

export { populateModernQuizzes };