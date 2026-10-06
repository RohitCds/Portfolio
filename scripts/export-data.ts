import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';



async function exportData() {
  console.log('📦 Exporting data from local database...');

  try {
    const users = await prisma.user.findMany();
    const skills = await prisma.skill.findMany({ orderBy: { order: 'asc' } });
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    const aboutMe = await prisma.aboutMe.findMany();

    const exportData = {
      users,
      skills,
      projects,
      aboutMe,
      exportedAt: new Date().toISOString(),
    };

    fs.writeFileSync('data-export.json', JSON.stringify(exportData, null, 2));

    console.log('✅ Data exported successfully!');
    console.log(`   Users: ${users.length}`);
    console.log(`   Skills: ${skills.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   About Me: ${aboutMe.length}`);
    console.log('\n📄 Data saved to: data-export.json');

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
