import { CommandBase } from './base/command.base';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { CryptomusService } from '../cryptomus/cryptomus.service';
import { DatabaseService } from '../database/database.service';
import { ICryptomusService } from '../cryptomus/cryptomus.interface';
import { IDatabase } from '../database/database.interface';

class StartCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    private readonly cryptomusService: ICryptomusService,
    private readonly databaseService: IDatabase
  ) {
    super(bot);
  }
  handle() {
    this.bot.start(async ctx => {
      const res = await this.cryptomusService.createPayment(1, '10');
      console.log(res);
      if (!res) return ctx.reply('Error!');
      await this.databaseService.paymentRepository.createPayment(
        res.result,
        ctx.from.id
      );
      ctx.reply(res.result.url);
    });
  }
}

export const initStartCommand =
  (cryptomusService: CryptomusService, databaseService: DatabaseService) =>
  (bot: Telegraf<IBotContext>) =>
    new StartCommand(bot, cryptomusService, databaseService);
