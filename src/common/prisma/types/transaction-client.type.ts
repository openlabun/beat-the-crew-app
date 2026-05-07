import { PrismaClient } from "@prisma/client/extension";

export type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;