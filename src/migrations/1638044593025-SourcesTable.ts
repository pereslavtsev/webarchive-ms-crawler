import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { sources } from '@pereslavtsev/webarchiver-protoc';

const sourcesTable = new Table({
  name: 'sources',
  columns: [
    {
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
    },
    {
      name: 'url',
      type: 'varchar',
    },
    {
      name: 'title',
      type: 'varchar',
    },
    {
      name: 'wikitext',
      type: 'varchar',
    },
    {
      name: 'archive_url',
      type: 'varchar',
      isNullable: true,
    },
    {
      name: 'archive_date',
      type: 'timestamp',
      isNullable: true,
    },
    {
      name: 'revision_date',
      type: 'timestamp',
      isNullable: true,
    },
    {
      name: 'revision_id',
      type: 'numeric',
      isNullable: true,
    },
    {
      name: 'status',
      type: 'numeric',
      enum: [...Object.values(sources.Source_Status).values()].map((value) =>
        String(value),
      ),
      enumName: 'snapshot_status',
      default: String(sources.Source_Status.PENDING),
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
    // add task relation
    { type: 'uuid', name: 'task_id' },
    // add template relation
    { type: 'uuid', name: 'template_id' },
  ],
});

const taskFK = new TableForeignKey({
  columnNames: ['task_id'],
  referencedTableName: 'tasks',
  referencedColumnNames: ['id'],
  onDelete: 'CASCADE',
});

const templateFK = new TableForeignKey({
  columnNames: ['template_id'],
  referencedTableName: 'templates',
  referencedColumnNames: ['id'],
  onDelete: 'SET NULL',
});

export class SourcesTable1638044593025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(sourcesTable);
    await queryRunner.createForeignKeys(sourcesTable, [taskFK, templateFK]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([queryRunner.dropTable(sourcesTable)]);
  }
}
