import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
} from './entity/transaction.entity';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  // =========================
  // CREATE
  // =========================
  async createTransaction(dto: CreateTransactionDto, userId: number) {
    // ❌ Nunca pode ser fixa e parcelada
    if (dto.isFixed && dto.isInstallment) {
      throw new BadRequestException(
        'A transaction cannot be both fixed and installment',
      );
    }

    // =========================
    // FIXA
    // =========================
    if (dto.isFixed) {
      if (dto.parentId || dto.installmentIndex || dto.installmentTotal) {
        throw new BadRequestException(
          'Fixed transactions cannot have installment fields',
        );
      }

      // originId é OPCIONAL:
      // - null → transação origem
      // - preenchido → transação gerada
      if (dto.originId) {
        const origin = await this.repo.findOne({
          where: { id: dto.originId, userId },
        });

        if (!origin) {
          throw new BadRequestException('Invalid origin transaction');
        }
      }
    }

    // =========================
    // PARCELADA
    // =========================
    if (dto.isInstallment) {
      if (!dto.installmentTotal || dto.installmentTotal < 2) {
        throw new BadRequestException('Installment total must be at least 2');
      }

      if (
        !dto.installmentIndex ||
        dto.installmentIndex < 1 ||
        dto.installmentIndex > dto.installmentTotal
      ) {
        throw new BadRequestException('Invalid installment index');
      }

      if (dto.originId) {
        throw new BadRequestException(
          'Installment transactions cannot have originId',
        );
      }

      // parentId obrigatório nas parcelas
      if (!dto.parentId) {
        throw new BadRequestException(
          'Installment transactions must have a parentId',
        );
      }

      const parent = await this.repo.findOne({
        where: { id: dto.parentId, userId },
      });

      if (!parent) {
        throw new BadRequestException('Invalid parent transaction');
      }
    }

    // =========================
    // SIMPLES
    // =========================
    if (!dto.isFixed && !dto.isInstallment) {
      if (
        dto.originId ||
        dto.parentId ||
        dto.installmentIndex ||
        dto.installmentTotal
      ) {
        throw new BadRequestException(
          'Simple transactions cannot have fixed or installment fields',
        );
      }
    }

    const transaction = this.repo.create({
      ...dto,
      userId,
    });

    await this.repo.save(transaction);
    return transaction;
  }

  // =========================
  // GET ALL (PAGINADO)
  // =========================
  async getAllTransactionsFiltered(userId: number, page = 1, limit = 10) {
    const safeLimit = Math.min(limit, 50);

    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { date: 'DESC' },
      skip: (page - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      page,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
      data,
    };
  }

  // =========================
  // GET ALL (SEM PAGINAÇÃO)
  // =========================
  async getAllTransactions(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  // =========================
  // GET BY ID
  // =========================
  async getTransactionById(id: number, userId: number) {
    const transaction = await this.repo.findOne({
      where: { id, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // =========================
  // UPDATE
  // =========================
  async updateTransaction(
    id: number,
    dto: UpdateTransactionDto,
    userId: number,
  ) {
    const transaction = await this.getTransactionById(id, userId);

    return this.repo.save({
      ...transaction,
      ...dto,
    });
  }

  // =========================
  // DELETE
  // =========================
  async deleteTransaction(id: number, userId: number) {
    const transaction = await this.getTransactionById(id, userId);
    await this.repo.remove(transaction);
  }

  async getTransactionsDashboard(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const transactions = await this.repo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
        isFixed: false,
      },
      order: { date: 'DESC' },
    });

    const summary = transactions.reduce(
      (acc, t) => {
        const value = Number(t.value);

        if (t.type === TransactionType.INCOME) {
          acc.totalIncome += value;
        } else if (t.type === TransactionType.EXPENSE) {
          acc.totalExpense += value;
        }

        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
      },
    );

    return {
      ...summary,
      totalBalance: summary.totalIncome - summary.totalExpense,
    };
  }
}
