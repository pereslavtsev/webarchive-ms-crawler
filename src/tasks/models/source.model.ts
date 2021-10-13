import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.model';
import { SourceStatus } from '../enums/source-status.enum';

@Entity('sources')
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  title!: string | null;

  @Column()
  templateName!: string;

  @Column()
  templateWikitext!: string;

  @Column({ nullable: true })
  archiveUrl: string | null;

  @Column({ nullable: true })
  archiveDate: string | null;

  @Column({
    enum: SourceStatus,
    enumName: 'source_status',
    default: SourceStatus.PENDING,
  })
  status!: SourceStatus;

  @ManyToOne(() => Task, (task) => task.sources, { onDelete: 'CASCADE' })
  task: Task;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
