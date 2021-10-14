import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from '../enums';
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

  get skipped() {
    return this.status === TaskStatus.SKIPPED;
  }

  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
    eager: true,
  })
  sources: Source[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
