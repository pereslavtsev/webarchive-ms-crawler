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

@Entity('tasks')
export class Task {
  static Status = core.v1.Task_Status;

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  pageTitle!: string;

  @Column({ type: 'numeric', nullable: true })
  pageId!: number;

  @Column({ type: 'numeric', nullable: true })
  revisionId!: number;

  @Column({ type: 'numeric', nullable: true })
  newRevisionId!: number;

  @Column({
    enum: Task.Status,
    enumName: 'task_status',
    default: Task.Status.PENDING,
  })
  status!: core.v1.Task_Status;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
  })
  sources: Source[];
}
