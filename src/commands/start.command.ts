import { Telegraf } from 'telegraf'

import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { Account } from '../modules/account/domain/entities/account.entity'
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'

const accountRepo = new AccountRepositoryImpl();

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

      const isAlreadyHasAccount = await accountRepo.findById(account.Id);
      if (!isAlreadyHasAccount) await accountRepo.save(account);

      const inlineKeyboard: InlineKeyboardButton[][] = []
      if(isAlreadyHasAccount) {
        inlineKeyboard.push([{
          text: 'Stats activity',
          callback_data: CommandConstants.GetStats,
        }])
        inlineKeyboard.push([{
          text: 'Dashboard',
          callback_data: CommandConstants.GetDashboard,
        }])
      }

      ctx.reply('How can I help?', {
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    });
  }
}

export const initStartCommand =
  (dbClient: DbClientService) => (bot: Telegraf<IBotContext>) =>
    new StartCommand(bot, dbClient);

