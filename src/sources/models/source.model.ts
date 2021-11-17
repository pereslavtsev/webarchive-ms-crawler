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
// import { SourceStatus } from '../enums';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly url: string;

  @Column()
  readonly title: string;

  @Column()
  readonly wikitext: string;

  @Column({ nullable: true })
  archiveUrl: string | null;

  @Column({ nullable: true })
  archiveDate: Date | null;

  @Column({ nullable: true })
  revisionDate: Date | null;

  @Column({ nullable: true })
  revisionId: number | null;

  // @Column({
  //   enum: SourceStatus,
  //   enumName: 'source_status',
  //   default: SourceStatus.PENDING,
  // })
  // status!: SourceStatus;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Task, (task) => task.sources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  readonly task: Task;

  @ManyToOne(() => Template, (template) => template.sources, {
    onDelete: 'SET NULL',
  })
  readonly template: Template;
}
