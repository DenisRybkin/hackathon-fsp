import { UUID, randomUUID } from 'crypto';

export class Memory {
  private readonly id: UUID;

  constructor(private readonly usage: string, id?: UUID) {
    this.id = id ?? randomUUID();
  }

  public get Id(): UUID {
    return this.id;
  }

  public get Usage(): string {
    return this.usage;
  }
}

