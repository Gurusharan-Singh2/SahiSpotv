/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const exists = await knex.schema.hasTable("user_monthly_interview_stats");
  if (!exists) return;

  await knex.schema.alterTable('user_monthly_interview_stats', (table) => {
    table.dropUnique(['user_id', 'year', 'month'], 'uniq_user_month');
    table.dropUnique(['user_id', 'subscription_instance_id'], 'uniq_usage');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const exists = await knex.schema.hasTable("user_monthly_interview_stats");
  if (!exists) return;

  await knex.schema.alterTable('user_monthly_interview_stats', (table) => {
    table.unique(['user_id', 'year', 'month'], 'uniq_user_month');
    table.unique(['user_id', 'subscription_instance_id'], 'uniq_usage');
  });
}
