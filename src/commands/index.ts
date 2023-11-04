import { NarrowedContext, Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { DbClientService } from '../database/db-client.service';
import { initAddConnectionCommand } from './add-connection.command';
import { CommandBase } from './base/command.base';
import { initStartCommand } from './start.command';
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram';

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export type ctxType = NarrowedContext<
  IBotContext,
  | Update.CallbackQueryUpdate<CallbackQuery>
  | {
      message: any;
      update_id: number;
    }
>;

export const initializersCommands: (
  dbClient: DbClientService
) => Array<InitCommandType> = () => [
  initStartCommand(),
  initAddConnectionCommand(),
];

