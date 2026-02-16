import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  password: string;
  nickname: string;
  role: 'admin' | 'family' | 'guest';
  status: 'active' | 'pending' | 'rejected';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  hashPassword(password: string): Promise<string>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, '用户名是必填项'],
      unique: true,
      trim: true,
      minlength: [2, '用户名至少2个字符'],
      maxlength: [20, '用户名最多20个字符'],
    },
    password: {
      type: String,
      required: [true, '密码是必填项'],
      minlength: [6, '密码至少6个字符'],
      select: false,
    },
    nickname: {
      type: String,
      required: [true, '昵称是必填项'],
      trim: true,
      maxlength: [20, '昵称最多20个字符'],
    },
    role: {
      type: String,
      enum: ['admin', 'family', 'guest'],
      default: 'guest',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'pending',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// 静态方法：加密密码
UserSchema.statics.hashPassword = async function (password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 实例方法：比较密码
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// 保存前加密密码 - 使用函数表达式避免类型问题
UserSchema.pre('save', async function () {
  const user = this as IUserDocument;
  if (!user.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
