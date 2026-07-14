// Shared table bootstrap for the Stories & Reviews CMS feature.
// Auto-creates the table on first use so it works on prod TiDB with no manual migration.
export async function ensureStoriesTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`stories\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`author\` VARCHAR(255) DEFAULT NULL,
      \`location\` VARCHAR(255) DEFAULT NULL,
      \`rating\` TINYINT DEFAULT NULL,
      \`content\` TEXT NOT NULL,
      \`image\` VARCHAR(500) DEFAULT NULL,
      \`is_published\` TINYINT(1) DEFAULT 1,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}
