import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("RohitsPortfolioPassword09222002", 10);
  await prisma.user.create({
    data: {
      email: "rohitshroff02@gmail.com",
      password: hashedPassword,
      name: "Rohit",
    },
  });
  console.log("✅ Admin user created!");
}

createAdmin()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
