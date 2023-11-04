import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { initAddConnectionCommand } from './add-connection.command'
import { CommandBase } from './base/command.base'
import { initStartCommand } from './start.command'

export type InitCommandType = (bot: Telegraf<IBotContext>) => CommandBase;

export const initializersCommands: (
) => Array<InitCommandType> = () => [
  initStartCommand(),
  initAddConnectionCommand(),
];

