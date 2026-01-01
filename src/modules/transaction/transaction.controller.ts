import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { TransactionResponseDto } from './dtos/transaction-response.dto';
import { UpdateTransactionDto } from './dtos/update-transaction.dto';

@Controller('transactions')
@ApiTags('Transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description: 'Creates a new transaction with the provided data',
  })
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return this.service.createTransaction(dto, 1);
  }

  @Get()
  @ApiOperation({
    summary: 'List all transactions',
    description: 'Lists all transactions',
  })
  @ApiParam({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiParam({
    name: 'limit',
    required: false,
    description: 'Number of items per page for pagination',
    example: 10,
  })
  @ApiOkResponse({
    description: 'List of all transactions',
    type: TransactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getAllTransactions(
    @Param() { page, limit }: { page?: number; limit?: number },
  ) {
    if (page || limit) {
      return this.service.getAllTransactionsFiltered(1, page, limit);
    }
    return this.service.getAllTransactions(1);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction by ID',
    description: 'Retrieves a transaction by its ID',
  })
  @ApiOkResponse({
    description: 'Transaction details',
    type: TransactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getTransactionById(@Param('id') id: string) {
    return this.service.getTransactionById(Number(id), 1);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a transaction',
    description: 'Updates the transaction with the provided data',
  })
  @ApiOkResponse({
    description: 'Updated transaction',
    type: TransactionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.updateTransaction(Number(id), dto, 1);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a transaction',
    description: 'Deletes the transaction with the specified ID',
  })
  @ApiOkResponse({ description: 'Transaction deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async deleteTransaction(@Param('id') id: string) {
    return this.service.deleteTransaction(Number(id), 1);
  }

  @Get('summary/:year/:month')
  @ApiOperation({
    summary: 'Get transactions dashboard',
    description:
      'Retrieves a summary of transactions for the specified month and year',
  })
  @ApiOkResponse({
    description: 'Transactions summary',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiParam({
    name: 'year',
    required: true,
    description: 'Year for which to retrieve transactions',
    example: 2025,
  })
  @ApiParam({
    name: 'month',
    required: true,
    description: 'Month for which to retrieve transactions',
    example: 6,
  })
  async getTransactionsDashboard(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.getTransactionsDashboard(1, month, year);
  }
}
