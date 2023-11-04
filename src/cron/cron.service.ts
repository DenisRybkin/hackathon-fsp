import cron from 'node-cron';
import { Client } from 'pg';
import { Telegraf } from 'telegraf';
import { IBotContext } from '../context/context.interface';
import { DbClientService } from '../database/db-client.service';
import { Connection } from '../modules/account/domain/entities/connection.entity';
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository';
import { ICronService } from './cron.interface';
import {
  GetTransactions,
  SendMessage,
  TerminateHanlder,
} from './utils/long.transactions';
import { Memory } from '../modules/account/domain/entities/memory.entity';
import { GetMemoryDatabase } from './utils/get-memory.utils';


const checkLongTransaction = async (
  bot: Telegraf<IBotContext>,
  connection: Connection
) => {
  const transactions = await GetTransactions(connection);

  console.log('transactions:', transactions);

  for await (let transaction of transactions) {
    SendMessage(bot, connection, transaction);
  }

  TerminateHanlder(bot, connection);
};

const checkMemoryDatabase = async (
  connection: Connection,
  connectionRepo: ConnectionRepositoryImpl
) => {
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
    //await this.analizeLongTransaction();
    await this.analizeUseMemory();
  }

  async analizeLongTransaction() {
    cron.schedule('*/6 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (const connection of connections) {
          await Promise.all([
            checkLongTransaction(this.bot, connection),
          ]);
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }
  async analizeUseMemory() {
    cron.schedule('*/13 * * * * *', async () => {
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
}

