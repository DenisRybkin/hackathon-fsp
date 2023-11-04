import { Telegraf } from 'telegraf'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { screenshoter } from '../services/screenshot.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'
import { ctxType } from './index'


const transformStats = (res: any) => {
  const transformedRes = res.map(item => ({
    datid: 'db id: ' + item.datid,
    datname: 'username db name: ' + item.datname,
    pid: 'process id:' + item.pid,
    usename: 'username: ' + item.usename,
    application_name: 'app name: ' + item.application_name,
    query_start: 'start request date: ' + item.query_start,
    state_change: 'date last change: ' + item.state_change,
    state: 'process state: ' + item.state,
  }));

  return transformedRes.map(item =>
    Object.values(item).reduce((acc, cur) => `${acc}\n${cur}`, '')
  );
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

  private async getBuffersStats() {
    const client = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });

    const maxsize = await client.getMaxBuffers();

    const size = await client.execute(
      'SELECT pg_size_pretty(pg_database_size($1))',
      [this.connection.Database]
    );

    this.ctx.reply(
      `Used disk size is: ${size.rows?.[0].pg_size_pretty} / ${maxsize}`
    );
  }

  private async getMaxConnections() {
    const client = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });

    const res = await client.getMaxConnections();
    this.ctx.reply('Max connections: ' + JSON.stringify(res));
  }

  private async setSharedBuffers() {
    const client = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });

    const res = await client.getMaxBuffers();
    this.ctx.reply("Max shared buffers: " + JSON.stringify(res))
  }

  private async setMaxConnections() {
    const client = new DbClientService({
      database: this.connection.Database,
      host: this.connection.Host,
      password: this.connection.Password,
      port: this.connection.Port,
      user: this.connection.User,
    });
     
    const res = await client.getMaxConnections();
    this.ctx.reply("Max connections: " + JSON.stringify(res))
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
    for (const item of transformStats(res.rows)) {
      this.ctx.reply(item);
    }
  }

  handle(): void {
    this.bot.action(
      CommandConstants.GetDashboard,
      this.sendDashboard.bind(this)
    );
    this.bot.action(
      CommandConstants.GetStatsIndividual,
      this.getStats.bind(this)
    );
    this.bot.action(
      CommandConstants.GetMaxConnections,
      this.getMaxConnections.bind(this)
    );
    this.bot.action(
      CommandConstants.BuffersStats,
      this.getBuffersStats.bind(this)
    );

    const keyboard: InlineKeyboardButton[][] = [
      [
        {
          text: 'Get stats',
          callback_data: CommandConstants.GetStatsIndividual,
        },
      ],
      [
        ...(this.connection.Dashboard?.length
          ? [
              {
                text: 'Show Dashboard',
                callback_data: CommandConstants.GetDashboard,
              },
            ]
          : []),
      ],
      [
        {
          text: 'Max connections',
          callback_data: CommandConstants.GetMaxConnections,
        },
        { text: 'Buffers stats', callback_data: CommandConstants.BuffersStats },
      ],
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

