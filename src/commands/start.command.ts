import { Telegraf } from 'telegraf';

import { IBotContext } from '../context/context.interface';
import { Account } from '../modules/account/domain/entities/account.entity';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { CommandBase } from './base/command.base';
import { initDashboardCommand } from './dashboard.command';

const accountRepo = new AccountRepositoryImpl();

class StartCommand extends CommandBase {
  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }

  handle() {
    this.bot.start(async ctx => {
      const { id, username, first_name, last_name, is_bot } = ctx.message.from;
      console.log(id);

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
            ...isAlreadyHasAccount.Connections.map(
              ({ Id, User, Database, Host, Port, Active }) => [
                {
                  text: `${User}:${Database} | ${Host}:${Port} ${
                    Active ? '| Watched' : ''
                  }`,
                  callback_data: Id,
                },
              ]
            ),
          ],
        },
      });

      for (let connection of isAlreadyHasAccount.Connections) {
        this.bot.action(connection.Id, ctx => {
          initDashboardCommand(connection, ctx)(this.bot).handle();
        });
      }
    });
  }
}

export const initStartCommand = () => (bot: Telegraf<IBotContext>) =>
  new StartCommand(bot);

