import { PaymentRepository } from './repos/payment.repository';
import { PrismaClient } from '@prisma/client';

export interface IDatabase extends PrismaClient {
  paymentRepository: PaymentRepository;
  init(): Promise<void>;
}
