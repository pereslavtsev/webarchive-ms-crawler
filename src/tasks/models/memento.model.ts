import { BaseModel } from '@app/tasks/models/base.model';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Source } from './source.model';

@Entity('mementos')
export class Memento extends BaseModel {
  @Column()
  archivedDate: Date;

  @Column()
  uri!: string;

  @ManyToOne(() => Source, (source) => source.mementos, { onDelete: 'CASCADE' })
  source!: Source;

  @Column({ type: 'boolean', default: false })
  checked: boolean;
}
