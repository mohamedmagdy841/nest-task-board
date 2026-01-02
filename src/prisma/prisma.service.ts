
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
// import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }
}
