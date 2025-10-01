import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cleanSessions = () => {
  // Run cron job at 8 AM every Monday
  cron.schedule("0 8 * * 1", async () => {
      console.log("[SessionCleaner] Running cleanup task...");

      try {
        const result = await prisma.session.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        });
        console.log(`Deleted ${result.count} expired sessions`)
      } catch (err) {
        console.error("Error cleaning sessions:", err);
      }
      
  });

  // Disconnect Prisma client when app shuts down
  process.on('SIGINT', async () => {
    console.log('[SessionCleaner] SIGINT received. Disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    console.log('[SessionCleaner] SIGTERM received. Disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
  });
}