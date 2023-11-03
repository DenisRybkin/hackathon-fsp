import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { DbClientService, ICredentialsDB } from '../database/db-client.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'

class AddConnectionCommand extends CommandBase {

  private credentialsModel: {[userId: number] : Partial<ICredentialsDB> & {step?: number}} = {}

  constructor(
    bot: Telegraf<IBotContext>,
    private readonly dbClient: DbClientService
  ) {
    super(bot);
		
  }


  private submit() {
    if(!this.credentialsModel?.database 
      || !this.credentialsModel?.host 
      || !this.credentialsModel?.password 
      || !this.credentialsModel?.port
      || !this.credentialsModel?.user
      ) {
        // TODO: return ctx.reply("Fuck ypu")
      }
     //this.prisma.addConnection

  }

	private initInputHandler() {
		
	}

  handle() {
    this.bot.command(CommandConstants.AddConnection, async ctx => {
      ctx.replyWithHTML(
        `You must fill in the following fields:\n\n` +
        `<i>database</i>` +
        `<i>host</i>` +
        `<i>password</i>` +
        `<i>port</i>` +
        `<i>user</i>`
      )
      ctx.reply('Please, fill the "database" field')
      this.credentialsModel[ctx.message.from.id] = { step: 1 }
    })
  }
}

export const initAddConnectionCommand =
  (dbClient: DbClientService) =>
  (bot: Telegraf<IBotContext>) =>
    new AddConnectionCommand(bot,dbClient);
