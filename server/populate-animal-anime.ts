import { db } from "./db";
import { animes } from "@shared/schema";
import { animalAnimeData } from "./animal-anime-data";

async function populateAnimalAnimes() {
  console.log("🐾 Adding animal anime data to database...");
  
  try {
    for (const animeData of animalAnimeData) {
      try {
        await db.insert(animes).values(animeData);
        console.log(`✅ Added: ${animeData.title}`);
      } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️ Already exists: ${animeData.title}`);
        } else {
          console.error(`❌ Error adding ${animeData.title}:`, error);
        }
      }
    }
    console.log("🎉 Animal anime data population completed!");
  } catch (error) {
    console.error("❌ Error populating animal anime data:", error);
  }
}

// Run if this file is executed directly
populateAnimalAnimes().then(() => process.exit(0));

export { populateAnimalAnimes };