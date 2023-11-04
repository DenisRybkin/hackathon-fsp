import { Telegraf } from 'telegraf';

import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { IBotContext } from '../context/context.interface';
import { DbClientService } from '../database/db-client.service';
import { Account } from '../modules/account/domain/entities/account.entity';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { CommandBase } from './base/command.base';
import { CommandConstants } from './constants/commands.constants';
import { Connection } from '../modules/account/domain/entities/connection.entity';
import { initGetDashboardCommand } from './get-dashboard.command';

const accountRepo = new AccountRepositoryImpl();

class StartCommand extends CommandBase {
  constructor(bot: Telegraf<IBotContext>) {
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

      const isAlreadyHasAccount = await accountRepo.findById(account.Id);
      if (!isAlreadyHasAccount) await accountRepo.save(account);

      if (!isAlreadyHasAccount?.Connections.length)
        return ctx.reply(
          'You not have db connections yet\nAdd new connection /add_connection'
        );

      ctx.reply('Connections', {
        reply_markup: {
          inline_keyboard: [
            ...isAlreadyHasAccount.Connections.map(({ Id, User, Database }) => [
              {
                text: `${User}:${Database}`,
                callback_data: Id,
              },
            ]),
          ],
        },
      });

      for (let connection of isAlreadyHasAccount.Connections) {
        this.bot.action(connection.Id, ctx => {
          initGetDashboardCommand(connection, ctx)(this.bot).handle();
        });
      }
    });
  }
}

export const initStartCommand = () => (bot: Telegraf<IBotContext>) =>
  new StartCommand(bot);

