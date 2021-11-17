import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Source } from '@core/sources';
import { core } from '@webarchiver/protoc';
import type { ApiPage, ApiRevision } from 'mwn';

@Entity('tasks')
export class Task {
  static Status = core.v1.Task_Status;

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'numeric' })
  readonly pageId!: ApiPage['pageid'];

  @Column({ type: 'numeric', nullable: true })
  revisionId!: ApiRevision['revid'];

  @Column({
    enum: Task.Status,
    enumName: 'task_status',
    default: Task.Status.PENDING,
  })
  readonly status!: core.v1.Task_Status;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
  })
  readonly sources: Source[];
}
