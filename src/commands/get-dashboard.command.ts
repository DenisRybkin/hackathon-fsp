import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository';
import { screenshoter } from '../services/screenshot.service';
import { CommandBase } from './base/command.base';
import { CommandConstants } from './constants/commands.constants';
import { ctxType } from './get-stats.command';
import { Connection } from '../modules/account/domain/entities/connection.entity';
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

const accountRepo = new AccountRepositoryImpl();

export class DashboardCommand extends CommandBase {
  constructor(
    bot: Telegraf<IBotContext>,
    private readonly ctx: ctxType,
    private readonly connection: Connection
  ) {
    super(bot);
  }

  private async sendDashboard() {
    this.ctx.reply('Loading...');
    try {
      const { buffer, path } = await screenshoter.save(
        this.connection.Dashboard ?? ''
      );
      this.ctx.sendPhoto({ source: buffer, filename: path });
    } catch (_) {
      this.ctx.reply('Something went wrong');
    }
  }

  handle(): void {
    this.bot.action(
      CommandConstants.GetDashboard,
      this.sendDashboard.bind(this)
    );

    const keyboard: InlineKeyboardButton[][] = [];

    if (this.connection.Dashboard)
      keyboard.push([
        {
          text: 'Show Dashboard',
          callback_data: CommandConstants.GetDashboard,
        },
      ]);

    this.ctx.reply(
      `Connection\n${this.connection.User}:${this.connection.Database}`,
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  }
}

export const initGetDashboardCommand =
  (connection: Connection, ctx: ctxType) => (bot: Telegraf<IBotContext>) =>
    new DashboardCommand(bot, ctx, connection);

