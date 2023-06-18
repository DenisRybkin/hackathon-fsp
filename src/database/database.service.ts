import { IDatabase } from './database.interface';
import { PrismaClient } from '@prisma/client';
import { PaymentRepository } from './repos/payment.repository';

export class DatabaseService extends PrismaClient implements IDatabase {
  public readonly paymentRepository: PaymentRepository = new PaymentRepository(
    this
  );

  constructor() {
    super();
  }
  async init() {
    await this.$connect();
  }
}
