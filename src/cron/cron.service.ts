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
import { GetMemoryDatabase } from './utils/get-memory.utils'
import { Memory } from '../modules/account/domain/entities/memory.entity'

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

const checkMemoryDatabase = async (
  connection: Connection,
  connectionRepo: ConnectionRepositoryImpl
) => {
  console.log("test")
  const memory = await GetMemoryDatabase(connection); 
  const currentLastStateMemory = connection?.Memories?.[(connection.Memories?.length ?? 0) - 1 ]
  if (!currentLastStateMemory) {
    connection.addMemory(new Memory(memory[0].pg_database_size))
  } 
  else if (currentLastStateMemory && currentLastStateMemory !== memory[0].pg_database_size) {
    connection.addMemory(new Memory(memory[0].pg_database_size))
  } 
  try{
    await connectionRepo.save(connection)
  } catch (e) {
    console.log(e)
  }
  console.log("Model::::::::", connection.Memories)
}

export class CronService implements ICronService {
  constructor(private readonly bot: Telegraf<IBotContext>) {}

  async init() {
    await this.asyncAnalyzeLongTransaction();
    await this.asyncAnalyzeDeadlocks();
    await this.analizeUseMemory();
  }

  async asyncAnalyzeLongTransaction() {
    cron.schedule('*/13 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      if(!connections) return null;

      try {
        for (const connection of connections) {
          await checkLongTransaction(this.bot, connection)
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }
  async analizeUseMemory() {
    cron.schedule('*/5 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      if(!connections) return null;
      try {
        for (const connection of connections) {
          await checkMemoryDatabase(connection, connectionRepo)
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

