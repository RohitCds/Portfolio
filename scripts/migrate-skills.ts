import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function migrateSkills() {
  console.log("Starting skill migration...");

  // Fetch all existing skills
  const skills = await prisma.skill.findMany();
  console.log(`Found ${skills.length} skill records`);

  const newSkills: Array<{ name: string; category: string; order: number }> = [];
  const skillsToDelete: number[] = [];

  let orderCounter = 0;

  for (const skill of skills) {
    // Check if the name contains commas (comma-separated skills)
    if (skill.name.includes(",")) {
      console.log(`Splitting: "${skill.name}" in category "${skill.category}"`);
      
      // Split by comma and trim whitespace
      const individualSkills = skill.name
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Create individual skill records
      for (const skillName of individualSkills) {
        newSkills.push({
          name: skillName,
          category: skill.category,
          order: orderCounter++,
        });
      }

      // Mark original record for deletion
      skillsToDelete.push(skill.id);
    } else {
      // Keep single skills as-is, just update order
      await prisma.skill.update({
        where: { id: skill.id },
        data: { order: orderCounter++ },
      });
    }
  }

  // Create new individual skill records
  if (newSkills.length > 0) {
    console.log(`Creating ${newSkills.length} new skill records...`);
    await prisma.skill.createMany({
      data: newSkills,
    });
  }

  // Delete old comma-separated records
  if (skillsToDelete.length > 0) {
    console.log(`Deleting ${skillsToDelete.length} old comma-separated records...`);
    await prisma.skill.deleteMany({
      where: {
        id: { in: skillsToDelete },
      },
    });
  }

  console.log("Migration complete!");
  
  // Show final count
  const finalCount = await prisma.skill.count();
  console.log(`Total skills after migration: ${finalCount}`);
}

migrateSkills()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });