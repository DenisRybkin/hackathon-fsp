import cron from 'node-cron'
import { Pool } from 'pg'
import { Telegraf } from 'telegraf'
import { IBotContext } from '../context/context.interface'
import { DbClientService } from '../database/db-client.service'
import { Connection } from '../modules/account/domain/entities/connection.entity'
import { ConnectionRepositoryImpl } from '../modules/account/infrastructure/connection.repository'
import { ICronService } from './cron.interface'

const check = async (bot: Telegraf<IBotContext>, connection: Connection) => {
  const pool = new Pool({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });

  const client = await pool.connect();
  const res =
    await client.query(`SELECT pid, now() - pg_stat_activity.query_start AS duration, query, query_id state FROM pg_stat_activity 
    WHERE query_start IS NOT NULL
    AND (now() - pg_stat_activity.query_start) > interval '5 hour'
    AND query NOT LIKE '%FROM pg_stat_activity%'`);

  //console.log('death request:::::::::', res.rows);

  if (res.rows) {
    for (const row of res.rows) {
      try {
        bot.telegram.sendMessage(
          Number(connection.Account?.Id),
          `The transaction exceded the time limit query: ${
            row.query
          }\n${Object.entries(row.duration).reduce(
            (acc, [key, value]) => `${acc}\n${value} ${key}`,
            'Execution time:'
          )}`
        );

        client.release();
      } catch (e) {
        client.release();
        console.log(e);
      }
    }
  }
};

const checkDeadlocks = async (bot: Telegraf<IBotContext>, connection: Connection) => {
  const client = new DbClientService({
    user: connection.User,
    host: connection.Host,
    database: connection.Database,
    password: connection.Password,
    port: connection.Port,
  });
  const res = await client.checkLockMonitor()
  for (const item of res) {
    await bot.telegram.sendMessage(
      Number(connection.Account?.Id),
      'locked item: ' + item.locked_item + '\n' +
      `waiting: ${item.waiting_duration.hours} hours ${item.waiting_duration.minutes} minutes ${item.waiting_duration.seconds} seconds` + '\n' +
      'blocked pid: ' + item.blocked_pid + '\n' +
      'blocked_query: ' + item.blocked_query + '\n'
    );
  }
}

export class CronService implements ICronService {
  constructor(
    private readonly bot: Telegraf<IBotContext>
  ) {}

  async init() {
    cron.schedule('*/30 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);
      if(!connections?.length) return
      try {
        for await (const connection of connections) {
          await Promise.all(
            [
              check(this.bot, connection),
              checkDeadlocks(this.bot, connection)
            ]
          )
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
}

