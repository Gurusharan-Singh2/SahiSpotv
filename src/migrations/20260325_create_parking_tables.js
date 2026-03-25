/**
 * Create parking tables:
 * - parking_locations
 * - parking_images
 *
 * Note: this migration intentionally avoids FK constraints because the repo
 * doesn't include a `users` migration; it assumes `users(id)` already exists.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (!await knex.schema.hasTable("parking_locations")) {
    await knex.schema.createTable("parking_locations", (table) => {
      table.increments("id").primary();
      table.integer("user_id").notNullable().index();

      table.string("name", 255).notNullable();
      table.string("city", 255).notNullable();
      table.decimal("latitude", 10, 7).notNullable();
      table.decimal("longitude", 10, 7).notNullable();

      table.decimal("price_per_hour", 10, 2).notNullable();
      table.integer("total_slots").notNullable();
      table.integer("available_slots").notNullable();

      table.timestamps(true, true);
    });
  }

  if (!await knex.schema.hasTable("parking_images")) {
    await knex.schema.createTable("parking_images", (table) => {
      table.increments("id").primary();
      table.integer("location_id").notNullable().index();
      table.string("image_url", 2048).notNullable();
      table.timestamps(true, true);
    });
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("parking_images");
  await knex.schema.dropTableIfExists("parking_locations");
}

