// src/transactions/transactions.controller.ts
import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    BadRequestException,
  } from '@nestjs/common';
  import { TransactionsService } from './transactions.service';
  import { Transaction, TransactionType } from './schemas/transaction.schema';
  import { UsersService } from '../users/users.service';
  import { UserDocument } from '../users/schemas/user.schema';
  
  @Controller('transactions')
  export class TransactionsController {
    constructor(
      private readonly transactionsService: TransactionsService,
      private readonly usersService: UsersService,
    ) {}
  
    @Post()
    async createTransaction(
      @Body() body: { senderId: string; receiverId: string; amount: number },
    ): Promise<Transaction> {
      return this.transactionsService.createTransaction({
        senderId: body.senderId,
        receiverId: body.receiverId,
        amount: body.amount,
        type: TransactionType.SENT,
      });
    }
  
    // P2P payment via QR UUID
    @Post('qr')
    async createP2PTransaction(
      @Body()
      body: { senderId: string; recipientUuid: string; amount: number },
    ): Promise<{ senderTransaction: Transaction; receiverTransaction: Transaction }> {
      const { senderId, recipientUuid, amount } = body;
  
      await this.usersService.findUserById(senderId);
  
      const recipient = await this.usersService.findUserByUuid(recipientUuid);
      if (!recipient) {
        throw new BadRequestException('Recipient not found using provided QR data');
      }
  
      // Explicitly casting to "any" to resolve _id type issue.
      const recipientId = (recipient as any)._id.toString();
  
      const senderTransaction = await this.transactionsService.createTransaction({
        senderId,
        receiverId: recipientId,
        amount,
        type: TransactionType.SENT,
      });
  
      const receiverTransaction = await this.transactionsService.createTransaction({
        senderId,
        receiverId: recipientId,
        amount,
        type: TransactionType.RECEIVED,
      });
  
      return { senderTransaction, receiverTransaction };
    }
  
    // P2P payment via phone number
    @Post('phone')
    async createTransactionViaPhone(
      @Body()
      body: { senderId: string; recipientPhone: string; amount: number },
    ): Promise<{ senderTransaction: Transaction; receiverTransaction: Transaction }> {
      const { senderId, recipientPhone, amount } = body;
  
      await this.usersService.findUserById(senderId);
  
      const recipient = await this.usersService.findUserByPhone(recipientPhone);
      if (!recipient) {
        throw new BadRequestException('Recipient not found using provided phone number');
      }
  
      const recipientId = (recipient as any)._id.toString();
  
      const senderTransaction = await this.transactionsService.createTransaction({
        senderId,
        receiverId: recipientId,
        amount,
        type: TransactionType.SENT,
      });
      const receiverTransaction = await this.transactionsService.createTransaction({
        senderId,
        receiverId: recipientId,
        amount,
        type: TransactionType.RECEIVED,
      });
  
      return { senderTransaction, receiverTransaction };
    }
  
    // Get all transactions for user with optional filters
    @Get()
    async getTransactions(
      @Query('userId') userId: string,
      @Query('type') type?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
    ): Promise<Transaction[]> {
      return this.transactionsService.getTransactions({ userId, type, startDate, endDate });
    }
  }
  