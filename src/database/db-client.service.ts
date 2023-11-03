import {Client} from "pg";

export interface ICredentialsDB {
    readonly user: string;
    readonly host: string;
    readonly database: string;
    readonly password: string;
    readonly port: number
}

export class DbClientService {
    private client: Client
    public name: string

    constructor(credentials: ICredentialsDB) {
        this.name = credentials.database;
        this.client = new Client({
            user: credentials.user,
            host: credentials.host,
            database: credentials.database,
            password: credentials.password,
            port: credentials.port,
        });
    }

    public execute(command: string): Promise<any> {
        return this.client.query(command)
    }
}