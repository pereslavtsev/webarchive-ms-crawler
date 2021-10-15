import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Task } from './task.model';
import { SourceStatus } from '../enums';
import { BaseModel } from './base.model';
import { Memento } from './memento.model';

@Entity('sources')
export class Source extends BaseModel {
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

  @ManyToOne(() => Task, (task) => task.sources, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  task: Task;

  @OneToMany(() => Memento, (memento) => memento.source, {
    cascade: true,
    eager: true,
  })
  mementos: Memento[];
}
