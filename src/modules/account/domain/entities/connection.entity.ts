export class Connection {
  constructor(
    private readonly id: number,
    private port: number,
    private user: string,
    private host: string,
    private database: string,
    private password: string
  ) {}

  public get Id(): number {
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

