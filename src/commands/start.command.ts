import { Telegraf } from 'telegraf';

import { IBotContext } from '../context/context.interface';
import { DbClientService } from '../database/db-client.service';
import { CommandBase } from './base/command.base';
import { CommandConstants } from './constants/commands.constants';
import { Account } from '../modules/account/domain/entities/account.entity';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository';

const accountRepo = new AccountRepositoryImpl();
const connectionRepo = new ConnectionRepositoryImpl();

class StartCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    private readonly dbClient: DbClientService
  ) {
    super(bot);
  }

  handle() {
    this.bot.start(async ctx => {
      const { id, username, first_name, last_name, is_bot } = ctx.message.from;

      if (is_bot) return ctx.reply('Sorry, we dont work with bots');

      const account = new Account(
        BigInt(id),
        username ?? null,
        first_name ?? null,
        last_name ?? null,
        []
      );

      const a = await connectionRepo.find();
      console.log(a);

      const isAlreadyHasAccount = await accountRepo.findById(account.Id);
      if (!isAlreadyHasAccount) await accountRepo.save(account);

      ctx.reply('How can I help?', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Stats activity',
                callback_data: CommandConstants.GetStats,
              },
            ],
          ],
        },
      });
    });
  }
}

export const initStartCommand =
  (dbClient: DbClientService) => (bot: Telegraf<IBotContext>) =>
    new StartCommand(bot, dbClient);

