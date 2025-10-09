import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; 

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("Password", 10);
  await prisma.user.create({
    data: {
      email: "email",
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
