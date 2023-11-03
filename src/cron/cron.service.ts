import { ICronService } from './cron.interface';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import cron from 'node-cron';

export class CronService implements ICronService {
  constructor(
    // private readonly databaseService: IDatabase,
    private readonly bot: Telegraf<IBotContext>
  ) {}

  async init() {
    cron.schedule('*/5 * * * * *', async () => {

    });
  }
}
