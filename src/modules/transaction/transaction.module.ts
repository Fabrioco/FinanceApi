import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entity/transaction.entity';
import { UserEntity } from '../auth/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity, UserEntity])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [],
})
export class TransactionModule {}
