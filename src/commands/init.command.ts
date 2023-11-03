import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { CommandBase } from './base/command.base';
import { CommandConstants } from './constants/commands.constants';
import { Account } from '../modules/account/domain/entities/account.entity';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { Connection } from '../modules/account/domain/entities/connection.entity';

const accountRepo = new AccountRepositoryImpl();

class InitCommand extends CommandBase {
  constructor(bot: Telegraf<IBotContext>) {
    super(bot);
  }

  handle(): void {
    this.bot.command(CommandConstants.Init, async ctx => {
      const { id, username, first_name, last_name, is_bot } = ctx.message.from;

      if (is_bot) return ctx.reply('Sorry, we dont work with bots');

      const account = new Account(
        BigInt(id),
        username ?? null,
        first_name ?? null,
        last_name ?? null,
        []
      );

      const alreadyHasAccount = await accountRepo.findById(account.Id);
      if (alreadyHasAccount) return ctx.reply('Account already exist');

      await accountRepo.save(account);

      ctx.reply('Wow, nice!');
    });
  }
}

export const initInitCommand = () => (bot: Telegraf<IBotContext>) =>
  new InitCommand(bot);

