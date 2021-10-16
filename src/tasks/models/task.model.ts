import { Column, Entity, OneToMany } from 'typeorm';
import { TaskStatus } from '../enums';
import { Source } from './source.model';
import { BaseModel } from './base.model';

@Entity('tasks')
export class Task extends BaseModel {
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

  @OneToMany(() => Source, (source) => source.task, {
    cascade: true,
    eager: true,
  })
  sources: Source[];
}
