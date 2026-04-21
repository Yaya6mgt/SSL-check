import 'module-alias/register';
import { initScheduler } from '@/engine/scheduler';
import { connectDB } from './config/db';

async function startApp() {
  console.log("Moniteur SSL démarré");
  await connectDB();
  initScheduler();
}

startApp();