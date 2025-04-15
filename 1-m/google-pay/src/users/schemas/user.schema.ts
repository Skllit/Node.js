// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true })
  phone: string;

  // Unique identifier for QR code generation
  @Prop({ unique: true })
  uuid: string;

  // Holds a QR code data URI once generated
  @Prop()
  qrCodeDataUri?: string;

  // User's balance (default set to 1000)
  @Prop({ default: 1000 })
  balance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
