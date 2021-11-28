import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '@core/tasks';
import { Template } from '@core/templates';
import { sources } from '@pereslavtsev/webarchiver-protoc';
import { TransformDate } from '@core/shared';

const { Source_Status } = sources;

@Entity('sources')
export class Source implements sources.Source {
  static Status = Source_Status;

  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly url: string;

  @Column()
  readonly title: string;

  @Column()
  readonly wikitext: string;

  @Column({ nullable: true })
  readonly archiveUrl: string | null;

  @Column({ nullable: true })
  @TransformDate()
  readonly archiveDate: Date | null;

  @Column({ nullable: true })
  @TransformDate()
  readonly revisionDate: Date | null;

  @Column({ nullable: true })
  readonly revisionId: number | null;

  @Column({
    enum: Source.Status,
    enumName: 'source_status',
    default: Source.Status.PENDING,
  })
  readonly status!: sources.Source_Status;

  @CreateDateColumn()
  @TransformDate()
  readonly createdAt: Date;

  @UpdateDateColumn()
  @TransformDate()
  readonly updatedAt: Date;

  @Column('uuid')
  readonly taskId: Task['id'];

  @ManyToOne(() => Task, (task) => task.sources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'task_id' })
  readonly task: Task;

  @ManyToOne(() => Template, (template) => template.sources, {
    onDelete: 'SET NULL',
    eager: true,
  })
  readonly template: Template;
}
