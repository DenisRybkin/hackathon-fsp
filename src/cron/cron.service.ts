import { ICronService } from './cron.interface';
import { IDatabase } from '../database/database.interface';
import { ICryptomusService } from '../cryptomus/cryptomus.interface';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import cron from 'node-cron';

export class CronService implements ICronService {
  constructor(
    private readonly databaseService: IDatabase,
    private readonly cryptomusService: ICryptomusService,
    private readonly bot: Telegraf<IBotContext>
  ) {}

  async init() {
    cron.schedule('*/5 * * * * *', async () => {
      const payments =
        await this.databaseService.paymentRepository.getAllNotFinal();
      for (const payment of payments) {
        const res = await this.cryptomusService.checkPayment(payment.uuid);
        if (!res) continue;
        if (res.result.is_final)
          this.bot.telegram.sendMessage(payment.chatId, res.result.status);
        await this.databaseService.paymentRepository.update(
          payment.uuid,
          payment.chatId,
          res.result
        );
      }
    });
  }
}
