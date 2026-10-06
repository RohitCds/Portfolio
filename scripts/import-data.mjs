import { PrismaClient } from '../src/generated/prisma/index.js';
import fs from 'fs';

const prisma = new PrismaClient();

async function importData() {
  console.log('📥 Importing data to Vercel database...');

  try {
    const fileContent = fs.readFileSync('data-export.json', 'utf-8');
    const data = JSON.parse(fileContent);

    console.log('📊 Data found:');
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Skills: ${data.skills.length}`);
    console.log(`   Projects: ${data.projects.length}`);
    console.log(`   About Me: ${data.aboutMe.length}`);
    console.log('\n�� Starting import...\n');

    // Import Users
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          name: user.name,
        },
      });
      console.log(`✅ Imported user: ${user.email}`);
    }

    // Import Skills
    for (const skill of data.skills) {
      await prisma.skill.create({
        data: {
          category: skill.category,
          name: skill.name,
          order: skill.order,
        },
      });
    }
    console.log(`✅ Imported ${data.skills.length} skills`);

    // Import Projects
    for (const project of data.projects) {
      await prisma.project.create({
        data: {
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          link: project.link,
          createdAt: new Date(project.createdAt),
        },
      });
    }
    console.log(`✅ Imported ${data.projects.length} projects`);

    // Import About Me
    for (const about of data.aboutMe) {
      await prisma.aboutMe.create({
        data: {
          content: about.content,
          updatedAt: new Date(about.updatedAt),
        },
      });
    }
    console.log(`✅ Imported ${data.aboutMe.length} about me entries`);

    console.log('\n🎉 Import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
