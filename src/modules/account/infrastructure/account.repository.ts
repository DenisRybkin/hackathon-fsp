import { IAccountRepository } from '../domain/account.repository';
import { Account } from '../domain/entities/account.entity';
import prisma from '../../../libs/prisma';
import { Connection } from '../domain/entities/connection.entity';
import { Nullable } from '../../../types/app.types';
import { UUID } from 'crypto';

export class AccountRepositoryImpl implements IAccountRepository {
  public async findById(id: bigint): Promise<Nullable<Account>> {
    const account = await prisma.account.findUnique({
      where: { id },
      include: { connections: true },
    });

    if (!account) return null;

    const {
      id: accountId,
      username,
      firstname,
      lastname,
      connections,
    } = account;

    return new Account(
      accountId,
      username ?? null,
      firstname ?? null,
      lastname ?? null,
      connections.map(
        ({ id, port, user, host, database, password, active }) =>
          new Connection(
            port,
            user,
            host,
            database,
            password,
            id as UUID,
            active
          )
      ) ?? []
    );
  }
  public async save(account: Account): Promise<void> {
    await prisma.account.upsert({
      where: { id: account.Id },
      update: {
        id: account.Id,
        username: account.Username,
        firstname: account.Firstname,
        lastname: account.Lastname,
        connections: {
          deleteMany: {},
          connectOrCreate: account.Connections.map(
            ({ Id, Port, User, Host, Database, Password, Active }) => ({
              where: { id: Id },
              create: {
                id: Id,
                port: Port,
                user: User,
                host: Host,
                database: Database,
                password: Password,
                active: Active,
              },
            })
          ),
        },
      },
      create: {
        id: account.Id,
        username: account.Username,
        firstname: account.Firstname,
        lastname: account.Lastname,
        connections: {
          connectOrCreate: account.Connections.map(
            ({ Id, Port, User, Host, Database, Password, Active }) => ({
              where: { id: Id },
              create: {
                id: Id,
                port: Port,
                user: User,
                host: Host,
                database: Database,
                password: Password,
                active: Active,
              },
            })
          ),
        },
      },
    });
  }
}

