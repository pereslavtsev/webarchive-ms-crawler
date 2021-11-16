import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import type { ApiPage } from 'mwn';
import { TemplateSettings } from './template-settings.model';

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
  })
  @JoinColumn()
  settings: TemplateSettings;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;
}
