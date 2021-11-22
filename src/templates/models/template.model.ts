import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import type { ApiPage } from 'mwn';
import { TemplateSettings } from './template-settings.model';
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

  @OneToOne(() => TemplateSettings, (settings) => settings.template, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  readonly settings: TemplateSettings;

  @OneToMany(() => Source, (source) => source.template)
  readonly sources: Source[];

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
