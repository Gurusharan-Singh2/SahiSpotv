/**
 * Add `users.img` column for storing the user profile image URL.
 *
 * Note: this repo assumes `users(id)` already exists.
 * This migration only adds the missing column if the table/column exist.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const usersExists = await knex.schema.hasTable("users");
  if (!usersExists) return;

  const imgExists = await knex.schema.hasColumn("users", "img");
  if (imgExists) return;

  await knex.schema.alterTable("users", (table) => {
    table.string("img", 2048).nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const usersExists = await knex.schema.hasTable("users");
  if (!usersExists) return;

  const imgExists = await knex.schema.hasColumn("users", "img");
  if (!imgExists) return;

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("img");
  });
}

