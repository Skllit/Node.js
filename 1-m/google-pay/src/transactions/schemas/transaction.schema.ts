// src/transactions/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  SENT = 'sent',
  RECEIVED = 'received',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
