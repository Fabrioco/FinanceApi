import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { JwtAuthGuard } from 'src/commons/guard/auth.guard';
import { CurrentUser } from 'src/commons/decorator/current-user.decorator';
import type { JwtPayload } from '../auth/strategy/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
@ApiTags('Transactions')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly service: TransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description: 'Creates a new transaction with the provided data',
  })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    console.log(user);
    return this.service.createTransaction(dto, user.sub);
  }

  @Get('projection-monthly/:year/:month')
  @ApiOperation({
    summary: 'Get projection monthly',
    description: 'Retrieves the projection monthly',
  })
  @ApiOkResponse({
    description: 'Projection monthly',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getProjectionMonthly(
    @CurrentUser() user: JwtPayload,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.service.getMonthlyProjection(user.sub, month, year);
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
    @CurrentUser()
    user: JwtPayload,
  ) {
    if (page || limit) {
      return this.service.getAllTransactionsFiltered(user.sub, page, limit);
    }
    return this.service.getAllTransactions(user.sub);
  }

  @Get('category-most-expensive')
  @ApiOperation({
    summary: 'Get category with highest total expensive',
    description:
      'Retrieves the category with the highest total of expensive transactions',
  })
  @ApiOkResponse({
    description: 'Category with highest total of expensive transactions',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async getCategoryMostExpensive(@CurrentUser() user: JwtPayload) {
    return this.service.getCategoryMostExpensive(user.sub);
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
  async getTransactionById(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getTransactionById(Number(id), user.sub);
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
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateTransaction(Number(id), dto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a transaction',
    description: 'Deletes the transaction with the specified ID',
  })
  @ApiOkResponse({ description: 'Transaction deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async deleteTransaction(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.deleteTransaction(Number(id), user.sub);
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
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.getTransactionsDashboard(user.sub, month, year);
  }
}
