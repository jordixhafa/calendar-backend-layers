// Event model
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from './User';

export type Recurrence = 'none' | 'daily' | 'weekly';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('datetime')
  start!: Date;

  @Column('datetime')
  end!: Date;

  @Column()
  label!: string;

  @Column({ default: 0 })
  reminderMinutesBefore!: number;

  @Column({ type: 'varchar', default: 'none' })
  recurrence!: Recurrence;

  @ManyToOne(() => User, u => u.events, { onDelete: 'CASCADE' })
  owner!: User;

  @Column('simple-array', { default: '' })
  invitees!: string[];

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
