// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Create a new user
  async createUser(createUserDto: { name: string; email: string; phone: string }): Promise<User> {
    const newUser = new this.userModel({
      ...createUserDto,
      uuid: uuidv4(), // assign a unique UUID
    });
    return newUser.save();
  }

  // Find a user by its Mongo _id
  async findUserById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Find a user by UUID (for QR transactions)
  async findUserByUuid(uuid: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ uuid });
    if (!user) throw new NotFoundException('User not found by UUID');
    return user;
  }

  // Find a user by phone number (for phone based transactions)
  async findUserByPhone(phone: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new NotFoundException('User not found by phone number');
    return user;
  }

  // Generate and save QR code for the user’s uuid
  async generateQrCode(userId: string): Promise<string> {
    const user = await this.findUserById(userId);
    // Generate a QR code as Data URI
    const qrCodeDataUri = await QRCode.toDataURL(user.uuid);
    user.qrCodeDataUri = qrCodeDataUri;
    await user.save();
    return qrCodeDataUri;
  }

  // List all users (for testing)
  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  // Update user balance
  async updateBalance(userId: string, amountDelta: number): Promise<UserDocument> {
    const user = await this.findUserById(userId);
    user.balance += amountDelta;
    return user.save();
  }
}
