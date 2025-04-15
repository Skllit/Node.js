// src/transactions/transactions.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument, TransactionType } from './schemas/transaction.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  // Create a transaction record and update balances accordingly.
  async createTransaction(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    type: TransactionType;
  }): Promise<Transaction> {
    // For SENT type, subtract from sender; for RECEIVED, add to receiver.
    if (data.type === TransactionType.SENT) {
      await this.usersService.updateBalance(data.senderId, -data.amount);
    } else if (data.type === TransactionType.RECEIVED) {
      await this.usersService.updateBalance(data.receiverId, data.amount);
    }

    const transaction = new this.transactionModel({
      senderId: data.senderId,
      receiverId: data.receiverId,
      amount: data.amount,
      type: data.type,
    });
    const txn = await transaction.save();

    // After a successful transaction, send notification emails.
    this.emailService.sendTransactionEmail({
      senderId: data.senderId,
      receiverId: data.receiverId,
      amount: data.amount,
      type: data.type,
    });

    return txn;
  }

  // Retrieve filtered transactions for a user.
  async getTransactions({
    userId,
    type,
    startDate,
    endDate,
  }: {
    userId: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const filter: any = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    return this.transactionModel.find(filter).sort({ createdAt: -1 }).exec();
  }
}
