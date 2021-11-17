import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsUUID } from 'class-validator';
import { Template } from './template.model';

@Entity('template_settings')
export class TemplateSettings {
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

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
  readonly archiveParamAliases: string[] | null;

  @Column({ nullable: true })
  readonly deadUrlParam: string | null;

  @Column({ type: 'varchar', array: true, nullable: true })
  readonly deadParamAliases: string[] | null;

  @CreateDateColumn()
  readonly createdAt: Date;

  @UpdateDateColumn()
  readonly updatedAt: Date;

  @OneToOne(() => Template, (template) => template.settings, {
    onDelete: 'CASCADE',
  })
  readonly template: Template;
}
