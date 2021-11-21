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
import { IsInt } from 'class-validator';
import { TransformDate } from '@core/shared';

const { Task_Status } = core.v1;

@Entity({ name: 'tasks' })
export class Task {
  static Status = Task_Status;

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column({ type: 'numeric' })
  @IsInt()
  readonly pageId!: ApiPage['pageid'];

  @Column({ type: 'numeric', nullable: true })
  readonly revisionId!: ApiRevision['revid'];

  @Column({ type: 'numeric', nullable: true })
  readonly newRevisionId!: ApiRevision['revid'];

  @Column({
    enum: Task.Status,
    enumName: 'task_status',
    default: Task.Status.PENDING,
  })
  readonly status!: core.v1.Task_Status;

  @CreateDateColumn()
  @TransformDate()
  readonly createdAt: Date;

  @UpdateDateColumn()
  @TransformDate()
  readonly updatedAt: Date;

  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
    eager: true,
  })
  readonly sources: Source[];
}
