/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO compliance_frameworks (name, version, region, industry, controls) VALUES
    (
      'CIS Controls v8',
      'v8.0',
      'Global',
      'All',
      '[]'::jsonb
    ),
    (
      'PIPEDA',
      '2019',
      'Canada',
      'All',
      '[]'::jsonb
    ),
    (
      'Quebec Law 25',
      '2023',
      'Quebec, Canada',
      'All',
      '[]'::jsonb
    ),
    (
      'Microsoft Zero Trust',
      '2023',
      'Global',
      'All',
      '[]'::jsonb
    ),
    (
      'FSI',
      '2024',
      'Canada',
      'Financial Services',
      '[]'::jsonb
    ),
    (
      'MISA',
      '2024',
      'Global',
      'Security',
      '[]'::jsonb
    )
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM compliance_frameworks WHERE name IN (
      'CIS Controls v8',
      'PIPEDA',
      'Quebec Law 25',
      'Microsoft Zero Trust',
      'FSI',
      'MISA'
    )
  `);
};
