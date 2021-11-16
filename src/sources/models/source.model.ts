import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.model';
import { SourceStatus } from '../enums';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  readonly url: string;

  @Column({ type: 'boolean', default: false })
  dead!: boolean;

  @Column({ nullable: true })
  title!: string | null;

  @Column()
  templateName!: string;

  @Column()
  templateWikitext!: string;

  @Column({ nullable: true })
  archiveUrl: string | null;

  @Column({ nullable: true })
  archiveDate: Date | null;

  @Column({ nullable: true })
  revisionDate: Date | null;

  @Column({ nullable: true })
  revisionId: number | null;

  @Column({
    enum: SourceStatus,
    enumName: 'source_status',
    default: SourceStatus.PENDING,
  })
  status!: SourceStatus;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @ManyToOne(() => Task, (task) => task.sources, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  task: Task;
}
