// Event model
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { User } from './User';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('timestamp')
  start!: Date;

  @Column('timestamp')
  end!: Date;

  @Column()
  label!: string;

  @Column({ default: 0 })
  reminderMinutesBefore!: number;

  @Column({ type: 'enum', enum: ['none','daily','weekly','monthly'], default: 'none' })
  recurrence!: Recurrence;

  @ManyToOne(() => User, u => u.events, { onDelete: 'CASCADE' })
  owner!: User;

  @Column('simple-array', { default: '' })
  invitees!: string[];

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
