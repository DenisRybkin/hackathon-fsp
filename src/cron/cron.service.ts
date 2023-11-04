import cron from 'node-cron'
import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository'
import { ICronService } from './cron.interface'
import { GetDeadlocks, SendDeadlockMessage } from './utils/deadlock.utils'
import {
  GetTransactions,
  SendLongTransactionMessage,
  TerminateHandler,
} from './utils/long-transactions.utils'

const checkLongTransaction = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
  const transactions = await GetTransactions(connection);

  console.log('transactions:', transactions);
  if(!transactions) return null;
  for (const transaction of transactions) {
    await SendLongTransactionMessage(bot, connection, transaction);
  }

  TerminateHandler(bot, connection);
};

const checkDeadlocks = async (
    bot: Telegraf<IBotContext>,
    connection: Connection
) => {
  const deadlocks = await GetDeadlocks(connection);

  console.log('deadlocks:', deadlocks);
  
  for (const deadlock of deadlocks) {
    await SendDeadlockMessage(bot, connection, deadlock)
  }
}

export class CronService implements ICronService {
  constructor(private readonly bot: Telegraf<IBotContext>) {}

  async init() {
    await this.asyncAnalyzeLongTransaction();
    await this.asyncAnalyzeDeadlocks();
    // await this.analizeUseMemory();
  }

  async asyncAnalyzeLongTransaction() {
    cron.schedule('*/13 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      if(!connections) return null;

      try {
        for (const connection of connections) {
          checkLongTransaction(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }

  async asyncAnalyzeDeadlocks() {
    cron.schedule('*/20 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      
      if(!connections) return null;

      try {
        for (const connection of connections) {
          await checkDeadlocks(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    })
  }
}

