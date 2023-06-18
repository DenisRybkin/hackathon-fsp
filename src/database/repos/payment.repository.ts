import { DatabaseService } from '../database.service';
import { Result } from '../../cryptomus/cryptomus.interface';
import { PrismaClient } from '@prisma/client';

export class PaymentRepository {
  private client: PrismaClient;

  constructor(client: DatabaseService) {
    this.client = client;
  }

  public async createPayment(payload: Result, chatId: number) {
    return this.client.payment.create({
      data: {
        uuid: payload.uuid,
        orderId: payload.order_id,
        status: payload.status,
        amount: payload.amount,
        paymentAmount: payload.payment_amount,
        isFinal: payload.is_final,
        url: payload.url,
        chatId: chatId,
      },
    });
  }

  public async getAllNotFinal() {
    return this.client.payment.findMany({ where: { isFinal: false } });
  }

  public async update(id: string, chatId: number, payload: Result) {
    return this.client.payment.update({
      where: { uuid: id },
      data: {
        uuid: payload.uuid,
        orderId: payload.order_id,
        status: payload.status,
        amount: payload.amount,
        paymentAmount: payload.payment_amount,
        isFinal: payload.is_final,
        url: payload.url,
        chatId: chatId,
      },
    });
  }
}
