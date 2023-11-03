import { Pool } from "pg"

export interface ICredentialsDB {
    readonly user: string;
    readonly host: string;
    readonly database: string;
    readonly password: string;
    readonly port: number
}

export class DbClientService {
    private pool: Pool
    public name: string

    constructor(credentials: ICredentialsDB) {
        this.name = credentials.database;
        this.pool = new Pool({
            user: credentials.user,
            host: credentials.host,
            database: credentials.database,
            password: credentials.password,
            port: credentials.port,
        });
    }

    public async execute(command: string): Promise<any> {
        const client = await this.pool.connect()
        const res =  await client.query(command)
        client.release()
        return res;
    }
}