import { UserEntity } from 'src/modules/auth/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['originId'])
@Index(['parentId'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // =====================
  // BASE
  // =====================

  @Column()
  title: string;

  @Column('decimal', { precision: 12, scale: 2 })
  value: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  category: string;

  /**
   * Data de referência da transação
   * (mês/ocorrência)
   */
  @Column({ type: 'date' })
  date: Date;

  // =====================
  // FLAGS
  // =====================

  @Column({ default: false })
  isFixed: boolean;

  @Column({ default: false })
  isInstallment: boolean;

  /**
   * Marca registros que não devem
   * aparecer diretamente no app
   * (ex: pai do parcelamento)
   */
  @Column({ default: false })
  isHidden: boolean;

  // =====================
  // FIXA
  // =====================

  /**
   * ID da transação fixa origem
   * null → é a própria origem
   */
  @Column({ nullable: true })
  originId?: number;

  @ManyToOne(() => TransactionEntity, { nullable: true })
  @JoinColumn({ name: 'originId' })
  origin?: TransactionEntity;

  // =====================
  // PARCELAMENTO
  // =====================

  /**
   * ID da transação pai
   */
  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => TransactionEntity, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: TransactionEntity;

  @Column({ nullable: true })
  installmentIndex?: number;

  @Column({ nullable: true })
  installmentTotal?: number;

  // =====================
  // USER
  // =====================

  @ManyToOne(() => UserEntity, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: number;
}
