import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { successResponse, errorResponse } from '../utils/response';
import { z } from 'zod';

const prisma = new PrismaClient();

const toolSchema = z.object({
  name: z.string().min(1, '工具名称不能为空'),
  slug: z.string().min(1, '工具标识不能为空').regex(/^[a-z0-9-]+$/, '标识只能包含小写字母、数字和连字符'),
  description: z.string().min(1, '工具描述不能为空'),
  icon: z.string().optional(),
  categoryId: z.number().int().positive('请选择分类'),
  content: z.string().min(1, '工具内容不能为空'),
  sortOrder: z.number().int().default(0),
});

export async function getTools(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { category, search, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    isActive: true,
    isVisible: true,
  };

  if (category) {
    where.category = { slug: category as string };
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limitNum,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.tool.count({ where }),
  ]);

  successResponse(res, {
    tools,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getAllTools(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limitNum,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.tool.count(),
  ]);

  successResponse(res, {
    tools,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

export async function getToolBySlug(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { slug } = req.params;

  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!tool) {
    errorResponse(res, '工具不存在', 404);
    return;
  }

  if (!tool.isActive || !tool.isVisible) {
    if (!req.user || req.user.role !== 'ADMIN') {
      errorResponse(res, '工具不存在', 404);
      return;
    }
  }

  await prisma.tool.update({
    where: { id: tool.id },
    data: { viewCount: { increment: 1 } },
  });

  successResponse(res, tool);
}

export async function createTool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = toolSchema.parse(req.body);

    const existing = await prisma.tool.findFirst({
      where: { slug: data.slug },
    });

    if (existing) {
      errorResponse(res, '工具标识已存在', 400);
      return;
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      errorResponse(res, '分类不存在', 400);
      return;
    }

    const tool = await prisma.tool.create({
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    successResponse(res, tool, '工具创建成功', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorResponse(res, error.errors[0].message, 400);
      return;
    }
    throw error;
  }
}

export async function updateTool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const data = toolSchema.partial().parse(req.body);

    const existing = await prisma.tool.findUnique({
      where: { id },
    });

    if (!existing) {
      errorResponse(res, '工具不存在', 404);
      return;
    }

    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.tool.findFirst({
        where: { slug: data.slug, id: { not: id } },
      });

      if (duplicate) {
        errorResponse(res, '工具标识已存在', 400);
        return;
      }
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        errorResponse(res, '分类不存在', 400);
        return;
      }
    }

    const tool = await prisma.tool.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    successResponse(res, tool, '工具更新成功');
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorResponse(res, error.errors[0].message, 400);
      return;
    }
    throw error;
  }
}

export async function deleteTool(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);

  const existing = await prisma.tool.findUnique({
    where: { id },
  });

  if (!existing) {
    errorResponse(res, '工具不存在', 404);
    return;
  }

  await prisma.tool.delete({
    where: { id },
  });

  successResponse(res, null, '工具删除成功');
}

export async function toggleTool(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const { field } = req.body;

  if (!field || (field !== 'isActive' && field !== 'isVisible')) {
    errorResponse(res, '无效的字段', 400);
    return;
  }

  const existing = await prisma.tool.findUnique({
    where: { id },
  });

  if (!existing) {
    errorResponse(res, '工具不存在', 404);
    return;
  }

  const tool = await prisma.tool.update({
    where: { id },
    data: { [field]: !existing[field as keyof typeof existing] },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  successResponse(res, tool, '工具状态更新成功');
}
