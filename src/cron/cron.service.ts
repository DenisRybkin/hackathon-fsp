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

// const check = async (bot: Telegraf<IBotContext>, connection: Connection) => {
//   const client = new Client({
//     user: connection.User,
//     host: connection.Host,
//     database: connection.Database,
//     password: connection.Password,
//     port: connection.Port,
//   });

//   await client.connect();
//   return client
// }

// const checkLongTransaction = async (bot: Telegraf<IBotContext>, connection: Connection) => {
//   const client = await check(bot,connection)

//   const res =
//     await client.query(`SELECT pid, now() - pg_stat_activity.query_start AS duration, query, query_id state FROM pg_stat_activity
//     WHERE query_start IS NOT NULL
//     AND (now() - pg_stat_activity.query_start) > interval '10 second'
//     AND query NOT LIKE '%FROM pg_stat_activity%'`);

//   console.log('death requests:', res.rows, (client as any).processID);

//   if (res.rows) {
//     for (const row of res.rows) {
//       try {
//         bot.telegram.sendMessage(
//           Number(connection.Account?.Id),
//           `The transaction exceded the time limit query: ${
//             row.query
//           }\n${Object.entries(row.duration).reduce(
//             (acc, [key, value]) => `${acc}\n${value} ${key}`,
//             'Execution time:'
//           )}`,
//           {
//             reply_markup: {
//               inline_keyboard: [
//                 [
//                   {
//                     text: 'Undo',
//                     callback_data: `kill-transaction-${row.pid}`,
//                   },
//                 ],
//               ],
//             },
//           }
//         );
//       } catch (e) {
//         console.log(e);
//       }
//     }

//     let isEndedManualy = false;

//     bot.action(/^kill-transaction-(\d+)$/, async ctx => {
//       await client
//         .query('select pg_terminate_backend($1)', [Number(ctx.match[1])])
//         .then(res => console.log(res.rows));

//       await client.end();
//       isEndedManualy = true;
//     });

//     if (isEndedManualy) await client.end();
//   }
//   client.release();
// };

// const checkUseMemory = async (bot: Telegraf<IBotContext>, connection: Connection, connectionRepo: ConnectionRepositoryImpl) => {
//   const pool = new Pool({
// const checkDeadlocks = async (
//   bot: Telegraf<IBotContext>,
//   connection: Connection
// ) => {
//   const client = new DbClientService({
//     user: connection.User,
//     host: connection.Host,
//     database: connection.Database,
//     password: connection.Password,
//     port: connection.Port,
//   });

//   const client = await pool.connect();
//   const res = await client.query(`select pg_database_size('${connection.Database}');`)
//   const currentLastStateMemory = connection?.Memories?.[(connection.Memories?.length ?? 0) - 1 ]
//   console.log(`OldMembers:::::____:::::${connection?.Memories}`)
//   console.log(`currentLastStateMemory - ${currentLastStateMemory} : ${res.rows[0].pg_database_size} - res.rows[0].pg_database_size`);

//   if (!currentLastStateMemory) {
//     connection.addMemory(new Memory(res.rows[0].pg_database_size))
//   } else if (currentLastStateMemory && currentLastStateMemory !== res.rows[0].pg_database_size) {
//     connection.addMemory(new Memory(res.rows[0].pg_database_size))
//   }
//   try{
//     await connectionRepo.save(connection)
//   } catch (e) {
//     console.log(e)
//   }

//   //connection.addMemory(new Memory(res.rows[0].pg_database_size))
//   console.log("pg_database_size:::::", res.rows[0].pg_database_size)
//   console.log("Model::::::::", connection.Memories)
//   client.release();
// }
//   const res = await client.checkLockMonitor();

//   if (!res) return;

//   console.log('locked transactions:', res);

//   for (const item of res) {
//     await bot.telegram.sendMessage(
//       Number(connection.Account?.Id),
//       'locked item: ' +
//         item.locked_item +
//         '\n' +
//         `waiting: ${item.waiting_duration.hours} hours ${item.waiting_duration.minutes} minutes ${item.waiting_duration.seconds} seconds` +
//         '\n' +
//         'blocked pid: ' +
//         item.blocked_pid +
//         '\n' +
//         'blocked_query: ' +
//         item.blocked_query +
//         '\n',
//       {
//         reply_markup: {    console.log("visit find")

//           inline_keyboard: [
//             [
//               {
//                 text: 'Undo',
//                 callback_data: `kill-locker-${item.blocked_pid}`,
//               },
//             ],
//           ],
//         },
//       }
//     );
//   }

//   bot.action(/^kill-locker-(\d+)$/, async ctx => {
//     await client
//       .execute('select pg_terminate_backend($1)', [Number(ctx.match[1])])
//       .then(res => console.log(res));
//   });
// };

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

export class CronService implements ICronService {
  constructor(private readonly bot: Telegraf<IBotContext>) {}

  async init() {
    await this.asyncanalizeLongTransaction();
    // await this.analizeUseMemory();
  }

  async asyncanalizeLongTransaction() {
    cron.schedule('*/13 * * * * *', async () => {
      const connectionRepo = new ConnectionRepositoryImpl();
      const connections = await connectionRepo.find(true);

      try {
        for await (const connection of connections) {
          await Promise.all([
            checkLongTransaction(this.bot, connection),
            // checkDeadlocks(this.bot, connection),
          ]);
        }
      } catch (e) {
        console.log('error:', e);
      }
    });
  }

  // async analizeUseMemory() {
  //   cron.schedule('*/7 * * * * *', async () => {
  //     console.log('visit to analizeUseMemory');
  //     try {
  //       const connectionRepo = new ConnectionRepositoryImpl();
  //       const connections = await connectionRepo.find(true);
  //       try {
  //         for await (let connection of connections) {
  //           console.log('before checkUseMemory');
  //           await checkUseMemory(this.bot, connection, connectionRepo);
  //         }
  //       } catch (e) {
  //         console.log(e);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   });
  // }
}

