import db from './src/config/db.js';

async function inspect() {
  try {
    const result = await db.raw("SHOW CREATE TABLE user_monthly_interview_stats");
    console.log(JSON.stringify(result[0], null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await db.destroy();
  }
}

inspect();
