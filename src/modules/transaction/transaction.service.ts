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
    // =========================
    // SANIDADE BÁSICA
    // =========================
    if (dto.isFixed && dto.isInstallment) {
      throw new BadRequestException(
        'A transaction cannot be both fixed and installment',
      );
    }

    // =========================
    // PARCELAMENTO (CRIAÇÃO)
    // =========================
    if (dto.isInstallment && !dto.parentId) {
      if (!dto.installmentTotal || dto.installmentTotal < 2) {
        throw new BadRequestException('Installment total must be at least 2');
      }

      // 1️⃣ cria o PAI (não aparece no app)
      const parent = await this.repo.save(
        this.repo.create({
          title: dto.title,
          value: dto.value,
          type: dto.type,
          category: dto.category,
          date: dto.date,
          userId,
          isInstallment: false,
        }),
      );

      // 2️⃣ cria as parcelas
      const installmentValue = Number(
        (dto.value / dto.installmentTotal).toFixed(2),
      );

      const installments: TransactionEntity[] = [];

      for (let i = 1; i <= dto.installmentTotal; i++) {
        const installment = this.repo.create({
          title: `${dto.title} (${i}/${dto.installmentTotal})`,
          value: installmentValue,
          type: dto.type,
          category: dto.category,
          date: this.addMonths(dto.date, i - 1),
          isInstallment: true,
          installmentIndex: i,
          installmentTotal: dto.installmentTotal,
          parentId: parent.id,
          userId,
        });

        installments.push(installment);
      }

      await this.repo.save(installments);

      return {
        parent,
        installments,
      };
    }

    // =========================
    // PARCELA INDIVIDUAL
    // =========================
    if (dto.isInstallment && dto.parentId) {
      const parent = await this.repo.findOne({
        where: { id: dto.parentId, userId },
      });

      if (!parent) {
        throw new BadRequestException('Invalid parent transaction');
      }

      if (
        !dto.installmentIndex ||
        !dto.installmentTotal ||
        dto.installmentIndex < 1 ||
        dto.installmentIndex > dto.installmentTotal
      ) {
        throw new BadRequestException('Invalid installment data');
      }

      const installment = this.repo.create({
        ...dto,
        userId,
      });

      return await this.repo.save(installment);
    }

    // =========================
    // FIXA (ORIGEM)
    // =========================
    if (dto.isFixed) {
      if (dto.originId) {
        throw new BadRequestException(
          'Fixed origin transaction cannot have originId',
        );
      }
      const fixed = this.repo.create({
        ...dto,
        userId,
      });

      return await this.repo.save(fixed);
    }

    // =========================
    // SIMPLES
    // =========================
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

    const transaction = this.repo.create({
      ...dto,
      userId,
    });

    return await this.repo.save(transaction);
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

  async getMonthlyProjection(userId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1️⃣ Transações já no mês
    const monthTransactions = await this.repo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });

    // 2️⃣ Transações fixas (independente do mês)
    const fixedTransactions = await this.repo.find({
      where: {
        userId,
        isFixed: true,
      },
    });

    // 3️⃣ Unifica sem duplicar
    const all = [
      ...monthTransactions,
      ...fixedTransactions.filter(
        (f) => !monthTransactions.some((m) => m.id === f.id),
      ),
    ];

    // 4️⃣ Soma
    let income = 0;
    let expense = 0;

    for (const t of all) {
      const value = Number(t.value);

      if (t.type === TransactionType.INCOME) {
        income += value;
      } else {
        expense += value;
      }
    }

    return {
      incomeProjected: income,
      expenseProjected: expense,
      balanceProjected: income - expense,
    };
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
    console.log(startDate, endDate);

    const transactions = await this.repo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
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

  async getCategoryMostExpensive(userId: number) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const transactions = await this.repo.find({
      where: {
        userId,
        type: TransactionType.EXPENSE, // 👈 importante
      },
    });

    if (!transactions.length) {
      return null;
    }

    const totalsByCategory = transactions.reduce(
      (acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.value);
        return acc;
      },
      {},
    );

    const [category, total] = Object.entries(totalsByCategory).reduce(
      (max, current) => (current[1] > max[1] ? current : max),
    );

    return {
      category,
      total,
    };
  }

  private addMonths(date: string, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}
