import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { IBotContext } from '../context/context.interface'
import { ICredentialsDB } from '../database/db-client.service'
import { CommandBase } from './base/command.base'
import { CommandConstants } from './constants/commands.constants'
import { ctxType } from './get-stats.command'

class AddConnectionCommand extends CommandBase {

  private credentials: {[userId: number] : Partial<ICredentialsDB> & {step?: number}} = {}

  constructor(
    bot: Telegraf<IBotContext>
  ) {
    super(bot);
  }

  private async submit(userId: number, credentials: Partial<ICredentialsDB> & {step?: number}, ctx: ctxType) {
    if(
      !credentials.database 
      || !credentials.host 
      || !credentials.password 
      || !credentials.port //number
      || !credentials.user
      ) 
        return ctx.reply("Invalid data!")
      delete this.credentials[userId].step
      ctx.reply('YRAAAAA!!!')
      
     //this.prisma.addConnection

  }

  test(test: string) {
    if((Object.values(CommandConstants) as string []).includes(test)) return false
    else true 
  }

	private initInputHandler() {
		this.bot.on(message('text'), async ctx => {
      const userId = ctx.message.from.id;
      switch (this.credentials[userId]?.step) {
         case undefined: return;
         case null: return;
         case 1: {
          this.credentials[userId] = { step: 2, database: ctx.message.text }
          ctx.reply('Please, fill the "host" field')
          break;
         }
         case 2: {
          this.credentials[userId] = { ...this.credentials[userId],  step: 3, host: ctx.message.text }
          ctx.reply('Please, fill the "password" field')
          break;
         }
         case 3: {
          this.credentials[userId] = { ...this.credentials[userId],  step: 4, password: ctx.message.text }
          ctx.reply('Please, fill the "port" field')
          break;
         }
         case 4: {
          this.credentials[userId] = { ...this.credentials[userId],  step: 5, port: Number(ctx.message.text) }
          ctx.reply('Please, fill the "user" field')
          break;
         }
         case 5: {
          this.credentials[userId] = { ...this.credentials[userId], user: ctx.message.text }
          ctx.reply('Adding a connection...')
          await this.submit(userId, this.credentials[userId], ctx)
          delete this.credentials[userId]
          break;
        }
      }
    })
	}

  handle() {

    this.bot.command(CommandConstants.AddConnection, async ctx => {
      await ctx.replyWithHTML(
        `You must fill in the following fields:\n\n` +
        `<i>database</i> \n` +
        `<i>host</i> \n` +
        `<i>password</i> \n` +
        `<i>port</i> \n` +
        `<i>user</i> \n`
      )
      ctx.reply('Please, fill the "database" field')
      this.credentials[ctx.message.from.id] = { step: 1 }
    })
    this.initInputHandler()
  }
}

export const initAddConnectionCommand =
  () =>
  (bot: Telegraf<IBotContext>) =>
    new AddConnectionCommand(bot);
