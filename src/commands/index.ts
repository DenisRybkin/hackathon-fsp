import { NarrowedContext, Telegraf } from 'telegraf'
import { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'
import { IBotContext } from '../context/context.interface'
import { initAddConnectionCommand } from './add-connection.command'
import { CommandBase } from './base/command.base'
import { initStartCommand } from './start.command'

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export type ctxType = NarrowedContext<
  IBotContext,
  | Update.CallbackQueryUpdate<CallbackQuery>
  | {
      message: any;
      update_id: number;
    }
>;

export const initializersCommands: () => Array<InitCommandType> = () => [
  initStartCommand(),
  initAddConnectionCommand(),
]
