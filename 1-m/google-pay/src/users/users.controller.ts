// src/users/users.controller.ts
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Create a new user
  @Post()
  async createUser(@Body() createUserDto: { name: string; email: string; phone: string }): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // Generate QR code for a user
  @Get(':id/qr')
  async getQrCode(@Param('id') id: string): Promise<{ qrCodeDataUri: string }> {
    const dataUri = await this.usersService.generateQrCode(id);
    return { qrCodeDataUri: dataUri };
  }

  // List all users (for testing)
  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
