import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { tasks } from '@pereslavtsev/webarchiver-protoc';

const tasksTable = new Table({
  name: 'tasks',
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
      name: 'revision_id',
      type: 'numeric',
      isNullable: true,
    },
    {
      name: 'new_revision_id',
      type: 'numeric',
      isNullable: true,
    },
    {
      name: 'status',
      type: 'numeric',
      enum: [...Object.values(tasks.Task_Status).values()].map((value) =>
        String(value),
      ),
      enumName: 'snapshot_status',
      default: String(tasks.Task_Status.PENDING),
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

export class TasksTable1638044585553 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(tasksTable);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([queryRunner.dropTable(tasksTable)]);
  }
}
