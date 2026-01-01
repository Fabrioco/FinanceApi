import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  category: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ default: false })
  isFixed: boolean;

  @Column({ default: false })
  isInstallment: boolean;

  // fixa
  @Column({ nullable: true })
  originId?: number;

  // parcelamento
  @Column({ nullable: true })
  installmentIndex?: number;

  @Column({ nullable: true })
  installmentTotal?: number;

  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;

  @Column()
  userId: number;
}
