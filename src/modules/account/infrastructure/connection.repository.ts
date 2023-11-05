import { UUID } from 'crypto'
import prisma from '../../../libs/prisma'
import { IConnectionRepository } from '../domain/connection.repository'
import { Account } from '../domain/entities/account.entity'
import { Connection } from '../domain/entities/connection.entity'
import { Memory } from '../domain/entities/memory.entity'

export class ConnectionRepositoryImpl implements IConnectionRepository {
  public async find(onlyActive = true): Promise<Connection[]> {
    return prisma.connection
      .findMany({
        ...(onlyActive && { where: { active: true } }),
        include: { account: true, memories: true },
      })
      .then(connections =>
        connections.map(
          ({
            id,
            active,
            port,
            user,
            host,
            database,
            password,
            account,
            dashboardUrl,
            memories,
          }) =>
            new Connection(
              port,
              user,
              host,
              database,
              password,
              id as UUID,
              active,
              dashboardUrl,
              new Account(
                account.id,
                account.username,
                account.firstname,
                account.lastname,
                []
              ),
              memories.map(({ id, usage }) => new Memory(usage, id as UUID))
            )
        )
      );
  }

  public async save(connection: Connection): Promise<void> {
    await prisma.connection.upsert({
      where: { id: connection.Id },
      update: {
        id: connection.Id,
        port: connection.Port,
        user: connection.User,
        host: connection.Host,
        database: connection.Database,
        password: connection.Password,
        active: connection.Active,
        dashboardUrl: connection.Dashboard,
        memories: {
          deleteMany: {},
          connectOrCreate: connection.Memories?.map(({ Id, Usage }) => ({
            where: { id: Id },
            create: { id: Id, usage: Usage },
          })),
        },
      },
      create: {
        id: connection.Id,
        port: connection.Port,
        user: connection.User,
        host: connection.Host,
        database: connection.Database,
        password: connection.Password,
        active: connection.Active,
        dashboardUrl: connection.Dashboard,
        account: {
          connect: { id: connection.Account?.Id },
        },
        memories: {
          connectOrCreate: connection.Memories?.map(({ Id, Usage }) => ({
            where: { id: Id },
            create: { usage: Usage },
          })),
        },
      },
    });
  }
}

