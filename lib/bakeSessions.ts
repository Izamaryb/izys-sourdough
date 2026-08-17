import { BakeSessionStatus } from '@prisma/client';
import { prisma } from './prisma';

type PrismaTransaction = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function findOpenBakeSessionForPickupDate(
  pickupDate: string,
  tx: PrismaTransaction = prisma,
) {
  return tx.bakeSession.findFirst({
    where: {
      pickupDate,
      status: BakeSessionStatus.open,
    },
  });
}

export async function reserveBakeSessionCapacity(
  bakeSessionId: string,
  units: number,
  tx: PrismaTransaction = prisma,
): Promise<void> {
  const bakeSession = await tx.bakeSession.findUnique({
    where: { id: bakeSessionId },
  });

  if (!bakeSession) {
    throw new Error('Bake session not found.');
  }

  if (bakeSession.status !== BakeSessionStatus.open) {
    throw new Error('Bake session is not open for orders.');
  }

  const remainingCapacity = bakeSession.maxCapacity - bakeSession.reservedUnits;

  if (remainingCapacity < units) {
    throw new Error(
      `Not enough bake capacity for this pickup date. Only ${remainingCapacity} units remaining.`,
    );
  }

  await tx.bakeSession.update({
    where: { id: bakeSessionId },
    data: {
      reservedUnits: { increment: units },
      status: remainingCapacity === units ? BakeSessionStatus.full : bakeSession.status,
    },
  });
}

export async function releaseBakeSessionCapacity(
  bakeSessionId: string,
  units: number,
  tx: PrismaTransaction = prisma,
): Promise<void> {
  const bakeSession = await tx.bakeSession.findUnique({
    where: { id: bakeSessionId },
  });

  if (!bakeSession) {
    return;
  }

  const reservedUnits = Math.max(bakeSession.reservedUnits - units, 0);

  await tx.bakeSession.update({
    where: { id: bakeSessionId },
    data: {
      reservedUnits,
      status:
        bakeSession.status === BakeSessionStatus.full
          ? BakeSessionStatus.open
          : bakeSession.status,
    },
  });
}

export type BakeSessionSummary = {
  id: string;
  bakeDate: string;
  pickupDate: string;
  maxCapacity: number;
  reservedUnits: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapBakeSession(session: {
  id: string;
  bakeDate: string;
  pickupDate: string;
  maxCapacity: number;
  reservedUnits: number;
  status: BakeSessionStatus;
  createdAt: Date;
  updatedAt: Date;
}): BakeSessionSummary {
  return {
    id: session.id,
    bakeDate: session.bakeDate,
    pickupDate: session.pickupDate,
    maxCapacity: session.maxCapacity,
    reservedUnits: session.reservedUnits,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function getBakeSessions(): Promise<BakeSessionSummary[]> {
  const sessions = await prisma.bakeSession.findMany({
    orderBy: { pickupDate: 'desc' },
  });

  return sessions.map(mapBakeSession);
}

export async function getBakeSessionById(id: string): Promise<BakeSessionSummary | null> {
  const session = await prisma.bakeSession.findUnique({ where: { id } });
  return session ? mapBakeSession(session) : null;
}

export async function createBakeSession(input: {
  bakeDate: string;
  pickupDate: string;
  maxCapacity: number;
}): Promise<BakeSessionSummary> {
  const session = await prisma.bakeSession.create({
    data: {
      bakeDate: input.bakeDate,
      pickupDate: input.pickupDate,
      maxCapacity: input.maxCapacity,
      status: BakeSessionStatus.open,
    },
  });

  return mapBakeSession(session);
}

export async function updateBakeSessionCapacity(
  id: string,
  maxCapacity: number,
): Promise<BakeSessionSummary> {
  const session = await prisma.bakeSession.findUnique({ where: { id } });

  if (!session) {
    throw new Error('Bake session not found.');
  }

  if (maxCapacity < session.reservedUnits) {
    throw new Error(
      `Capacity cannot be lower than reserved units (${session.reservedUnits}).`,
    );
  }

  const updated = await prisma.bakeSession.update({
    where: { id },
    data: {
      maxCapacity,
      status:
        session.status === BakeSessionStatus.full && maxCapacity > session.reservedUnits
          ? BakeSessionStatus.open
          : session.status,
    },
  });

  return mapBakeSession(updated);
}

export async function closeBakeSession(id: string): Promise<BakeSessionSummary> {
  const updated = await prisma.bakeSession.update({
    where: { id },
    data: { status: BakeSessionStatus.closed },
  });

  return mapBakeSession(updated);
}
