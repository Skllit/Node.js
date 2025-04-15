// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/googlepay'),
    UsersModule,
    TransactionsModule,
    EmailModule,
  ],
})
export class AppModule {}
