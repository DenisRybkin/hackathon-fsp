
import { Telegraf } from "telegraf"
import { IBotContext } from "../../context/context.interface"
import { DbClientService } from "../../database/db-client.service"
import { Connection } from '../../modules/account/domain/entities/connection.entity'

export const GetDeadlocks = async (
		connection: Connection,
	) => {
		const client = new DbClientService({
			user: connection.User,
			host: connection.Host,
			database: connection.Database,
			password: connection.Password,
			port: connection.Port,
		});
		return await client.checkLockMonitor()		
}

type DeadlockType = {
	locked_item: string, 
	waiting_duration: {
		hours: number,
		minutes: number,
		seconds: number
	},
	blocked_pid: number,
	blocking_pid: number,
	blocked_query: string,
	blocking_query: string,

}

export const SendDeadlockMessage = async (
	bot: Telegraf<IBotContext>,
	connection: Connection,
	deadlock: DeadlockType,
) => {

	const keyboard = [
		[
      {
        text: 'Kill blocking transaction',
        callback_data: `kill-transaction-${deadlock.blocking_pid}`,
      },
    ],
  ];

	await bot.telegram.sendMessage(
		Number(connection.Account?.Id),
		'A deadlock has occurred' + '\n\n' +
		'locked item: ' + deadlock.locked_item + '\n' +
		`waiting: ${deadlock.waiting_duration.hours} hours ${deadlock.waiting_duration.minutes} minutes ${deadlock.waiting_duration.seconds} seconds` + '\n' +
		'blocked pid: ' + deadlock.blocked_pid + '\n' +
		'blocking pid: ' + deadlock.blocking_pid + '\n' +
		'blocked_query: ' + deadlock.blocked_query + '\n' +
		'blocking_query: ' + deadlock.blocking_query + '\n'
		, {reply_markup: {inline_keyboard: keyboard}}
	);
}