import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../enums/task-status.enum';
import { Source } from './source.model';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  pageTitle!: string;

  @Column({ type: 'numeric', nullable: true })
  pageId!: number;

  @Column({ type: 'numeric', nullable: true })
  revisionId!: number;

  @Column({
    enum: TaskStatus,
    enumName: 'task_status',
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @OneToMany(() => Source, (source) => source.task, { cascade: true })
  sources: Source[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
