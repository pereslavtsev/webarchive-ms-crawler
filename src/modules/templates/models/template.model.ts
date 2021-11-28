import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import type { ApiPage } from 'mwn';
import { Source } from '@core/sources';

@Entity('templates')
export class Template {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column('numeric')
  readonly pageId: ApiPage['pageid'];

  @Column()
  readonly title: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly aliases: [];

  @Column()
  readonly titleParam: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly titleParamAliases: string[] | null;

  @Column()
  readonly defaultUrlParam: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly urlParamAliases: string[] | null;

  @Column()
  readonly archiveUrlParam: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly archiveUrlParamAliases: string[] | null;

  @Column({ nullable: true })
  readonly archiveDateParam: string | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly archiveDateParamAliases: string[] | null;

  @Column({ nullable: true })
  readonly deadUrlParam: string | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly deadUrlParamAliases: string[] | null;

  @OneToMany(() => Source, (source) => source.template)
  readonly sources: Source[];

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
