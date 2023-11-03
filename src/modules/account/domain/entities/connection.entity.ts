import { UUID, randomUUID } from 'crypto';

export class Connection {
  private readonly id: UUID;

  constructor(
    private port: number,
    private user: string,
    private host: string,
    private database: string,
    private password: string,
    id?: UUID
  ) {
    this.id = id ?? randomUUID();
  }

  public get Id(): UUID {
    return this.id;
  }
  public get Port(): number {
    return this.port;
  }
  public get User(): string {
    return this.user;
  }
  public get Host(): string {
    return this.host;
  }
  public get Database(): string {
    return this.database;
  }
  public get Password(): string {
    return this.password;
  }
}

