import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const templatesTable = new Table({
  name: 'templates',
  columns: [
    {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
    },
    {
      name: 'page_id',
      type: 'numeric',
    },
    {
      name: 'title',
      type: 'varchar',
    },
    {
      name: 'aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'title_param',
      type: 'varchar',
    },
    {
      name: 'title_param_aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'default_url_param',
      type: 'varchar',
    },
    {
      name: 'url_param_aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'archive_url_param',
      type: 'varchar',
      isNullable: true,
    },
    {
      name: 'archive_url_param_aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'archive_date_param',
      type: 'varchar',
      isNullable: true,
    },
    {
      name: 'archive_date_param_aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'dead_url_param',
      type: 'varchar',
      isNullable: true,
    },
    {
      name: 'dead_url_param_aliases',
      type: 'varchar',
      isArray: true,
      isNullable: true,
    },
    {
      name: 'created_at',
      type: 'timestamp',
      default: 'now()',
    },
    {
      name: 'updated_at',
      type: 'timestamp',
      default: 'now()',
    },
  ],
});

export class TemplatesTable1638044542864 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(templatesTable);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([queryRunner.dropTable(templatesTable)]);
  }
}
