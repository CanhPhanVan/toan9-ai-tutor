import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createClient() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalThis._prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalThis._prisma = prisma
