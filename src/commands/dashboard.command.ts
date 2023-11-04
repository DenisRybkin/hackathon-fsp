import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { AccountRepositoryImpl } from '../modules/account/infrastructure/account.repository'
import { screenshoter } from '../services/screenshot.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'
import { ctxType } from './get-stats.command'

const accountRepo = new AccountRepositoryImpl();

const transformStats = (res: any) => {
  const transformedRes = res.map(item => ({
    datid: "db id: " + item.datid,
    datname: "username db name: " + item.datname,
    pid: "process id:" +item.pid,
    usename: "username: " + item.usename,
    application_name: "app name: " + item.application_name,
    query_start: "start request date: " + item.query_start,
    state_change: "date last change: " + item.state_change,
    state: "process state: " + item.state,
  }));

  return transformedRes.map(item => Object.values(item).map(item => item + '\n'));
};

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

  private async checkSize() {
    const clinet = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });

    const res = await clinet.execute(
      'SELECT pg_size_pretty(pg_database_size($1))',
      [this.connection.Database]
    );

    this.ctx.reply("Size is: " + res.rows?.[0].pg_size_pretty);
  }

  private async getStats() {
    const client = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });
    const res = await client.execute(
      `SELECT * FROM pg_stat_activity where datname='${this.connection.Database}'`
    );
    for (const item of (transformStats(res.rows) as string[]) ) {
      await this.ctx.replyWithHTML(item)
    }
  }

  handle(): void {
    this.bot.action(
      CommandConstants.GetDashboard,
      this.sendDashboard.bind(this)
    );

    this.bot.action(CommandConstants.CheckSize, this.checkSize.bind(this));
    this.bot.action(
      CommandConstants.GetStatsIndividual,
      this.getStats.bind(this)
    );

    const keyboard: InlineKeyboardButton[][] = [
      [
        { text: 'Check size', callback_data: CommandConstants.CheckSize },
        {
          text: 'Get stats',
          callback_data: CommandConstants.GetStatsIndividual,
        },
      ],
      [{
        text: 'Show Dashboard',
        callback_data: CommandConstants.GetDashboard,
      },]
    ];

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

export const initDashboardCommand =
  (connection: Connection, ctx: ctxType) => (bot: Telegraf<IBotContext>) =>
    new DashboardCommand(bot, ctx, connection);

