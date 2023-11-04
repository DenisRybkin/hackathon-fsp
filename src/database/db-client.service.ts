import { Client, Query, QueryResult } from 'pg';

export interface ICredentialsDB {
  readonly user: string;
  readonly host: string;
  readonly database: string;
  readonly password: string;
  readonly port: number;
}

export class DbClientService {
  private config: ICredentialsDB;
  public name: string;

  constructor(credentials: ICredentialsDB) {
    this.name = credentials.database;
    this.config = credentials;
  }

  private Client(): Client {
    return new Client(this.config);
  }

  private async process<T>(fn: (client: Client) => T): Promise<T> {
    const client = this.Client();
    await client.connect();
    const res = await fn(client);
    await client.end();
    return res;
  }

  public async CheckConnection() {
    return this.process(client =>
      client.query('select * from pg_stat_activity;')
    );
  }

  public async execute<V extends any[]>(
    query: string,
    values?: V
  ): Promise<QueryResult<any>> {
    return this.process(client => client.query(query, values));
  }

  public async getMaxBuffers() {
    const res = await this.execute('SHOW shared_buffers;');
    return res.rows[0].shared_buffers;
  }

  public async getConnections() {
    const res = await this.execute('SHOW max_connections;');
    const now = await this.execute(
      'SELECT count(*) FROM pg_stat_activity where datname=$1',
      [this.name]
    );

    return { max: res.rows[0].max_connections, now: now.rows[0].count };
  }

  public async setMaxConnections(value: number) {
    const res = await this.execute('ALTER SYSTEM SET max_connections = $1', [
      value,
    ]);
    return res;
  }

  public async setMaxBuffers(value: number) {
    const res = await this.execute('ALTER SYSTEM SET shared_buffers = $1', [
      value,
    ]);
    return res;
  }

  private async checkExistLockMonitor() {
    const res = await this.execute(`SELECT EXISTS (
      SELECT 1
      FROM information_schema.views
      WHERE table_name = 'lock_monitor'
    );`);
    return !!res.rows[0]?.exists as boolean;
  }

  private async createLockMonitor() {
    const res = await this.execute(`CREATE VIEW lock_monitor AS(
      SELECT
        COALESCE(blockingl.relation::regclass::text,blockingl.locktype) as locked_item,
        now() - blockeda.query_start AS waiting_duration, blockeda.pid AS blocked_pid,
        blockeda.query as blocked_query, blockedl.mode as blocked_mode,
        blockinga.pid AS blocking_pid, blockinga.query as blocking_query,
        blockingl.mode as blocking_mode
      FROM pg_catalog.pg_locks blockedl
      JOIN pg_stat_activity blockeda ON blockedl.pid = blockeda.pid
      JOIN pg_catalog.pg_locks blockingl ON(
        ( (blockingl.transactionid=blockedl.transactionid) OR
        (blockingl.relation=blockedl.relation AND blockingl.locktype=blockedl.locktype)
        ) AND blockedl.pid != blockingl.pid)
      JOIN pg_stat_activity blockinga ON blockingl.pid = blockinga.pid
        AND blockinga.datid = blockeda.datid
      WHERE NOT blockedl.granted
      AND blockinga.datname = current_database()
      );`);

    return res;
  }

  public async checkLockMonitor() {
    if (await this.checkExistLockMonitor()) {
      const res = await this.execute(`SELECT * from lock_monitor;`);
      return res.rows.length ? res.rows : null;
    } else {
      await this.createLockMonitor();
      return await this.checkLockMonitor();
    }
  }

  public async getBufferHitRatio() {
    const res = await this.execute(`select
      sum(blks_hit)*100/sum(blks_hit+blks_read) as hit_ratio
      from pg_stat_database;`);
    return Number(res.rows[0].hit_ratio);
  }

  public async longTransactions() {
    return this.execute(
      `SELECT pid, now() - pg_stat_activity.query_start AS duration, query, query_id state FROM pg_stat_activity 
    WHERE query_start IS NOT NULL
    AND (now() - pg_stat_activity.query_start) > interval '10 second'
    AND query NOT LIKE '%FROM pg_stat_activity%'`
    ).then(res => res.rows);
  }
}

