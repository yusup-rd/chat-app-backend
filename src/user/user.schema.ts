import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop() name?: string;

  @Prop() gender?: string;

  @Prop() dob?: Date;

  @Prop() height?: number;

  @Prop() weight?: number;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop()
  avatar?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
