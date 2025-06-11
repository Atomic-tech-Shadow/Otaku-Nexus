import { storage } from './storage.js';
import { frenchAnimeQuizzes } from './french-quiz-data.js';

async function populateFrenchQuizzes() {
  console.log('Starting to populate French anime quizzes...');
  
  try {
    // Clear existing quizzes first
    await storage.deleteAllQuizzes();
    console.log('Cleared existing quizzes');
    
    // Add each French quiz
    for (const quizData of frenchAnimeQuizzes) {
      const quiz = await storage.createQuiz({
        title: quizData.title,
        description: quizData.description,
        difficulty: quizData.difficulty,
        questions: quizData.questions,
        xpReward: quizData.xpReward
      });
      console.log(`Created quiz: ${quiz.title} (ID: ${quiz.id})`);
    }
    
    console.log(`Successfully created ${frenchAnimeQuizzes.length} French anime quizzes!`);
    
    // Verify by getting all quizzes
    const allQuizzes = await storage.getQuizzes();
    console.log(`Total quizzes in database: ${allQuizzes.length}`);
    
    // Display quiz summary
    allQuizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title} (${quiz.difficulty}) - ${quiz.xpReward} XP`);
    });
    
  } catch (error) {
    console.error('Error populating quizzes:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateFrenchQuizzes()
    .then(() => {
      console.log('Quiz population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to populate quizzes:', error);
      process.exit(1);
    });
}

export { populateFrenchQuizzes };