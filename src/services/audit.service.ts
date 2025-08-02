import { prisma } from '../lib/prisma';

export class AuditService {
  async getAuditLogs(page: number = 1, pageSize: number = 10, filters?: {
    entity?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = {
      AND: [
        filters?.entity ? { entity: filters.entity } : {},
        filters?.action ? { action: filters.action } : {},
        filters?.userId ? { userId: filters.userId } : {},
        filters?.startDate || filters?.endDate ? {
          timestamp: {
            ...(filters.startDate && { gte: filters.startDate }),
            ...(filters.endDate && { lte: filters.endDate })
          }
        } : {}
      ]
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: {
          timestamp: 'desc'
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async logAction(data: {
    action: string;
    entity: string;
    entityId: number;
    userId: number;
    details: string;
  }) {
    return prisma.auditLog.create({
      data: {
        ...data,
        timestamp: new Date()
      }
    });
  }

  async getEntityHistory(entity: string, entityId: number) {
    return prisma.auditLog.findMany({
      where: {
        entity,
        entityId
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
  }

  async getUserActions(userId: number, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        skip,
        take,
        orderBy: {
          timestamp: 'desc'
        }
      }),
      prisma.auditLog.count({
        where: { userId }
      })
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async getActionSummary(startDate: Date, endDate: Date) {
    const logs = await prisma.auditLog.groupBy({
      by: ['action', 'entity'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    });

    return logs.reduce((acc, log) => {
      const key = `${log.entity}:${log.action}`;
      acc[key] = log._count;
      return acc;
    }, {} as Record<string, number>);
  }
}