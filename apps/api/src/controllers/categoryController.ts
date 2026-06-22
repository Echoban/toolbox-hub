import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { successResponse, errorResponse } from '../utils/response';
import { z } from 'zod';

const prisma = new PrismaClient();

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  slug: z.string().min(1, '分类标识不能为空').regex(/^[a-z0-9-]+$/, '标识只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export async function getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { tools: true },
      },
    },
  });

  successResponse(res, categories);
}

export async function getAllCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { tools: true },
      },
    },
  });

  successResponse(res, categories);
}

export async function createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = categorySchema.parse(req.body);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
    });

    if (existing) {
      errorResponse(res, '分类名称或标识已存在', 400);
      return;
    }

    const category = await prisma.category.create({
      data,
    });

    successResponse(res, category, '分类创建成功', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorResponse(res, error.errors[0].message, 400);
      return;
    }
    throw error;
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const data = categorySchema.partial().parse(req.body);

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      errorResponse(res, '分类不存在', 404);
      return;
    }

    if (data.name || data.slug) {
      const duplicate = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                data.name ? { name: data.name } : {},
                data.slug ? { slug: data.slug } : {},
              ],
            },
          ],
        },
      });

      if (duplicate) {
        errorResponse(res, '分类名称或标识已存在', 400);
        return;
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    successResponse(res, category, '分类更新成功');
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorResponse(res, error.errors[0].message, 400);
      return;
    }
    throw error;
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);

  const existing = await prisma.category.findUnique({
    where: { id },
    include: { tools: true },
  });

  if (!existing) {
    errorResponse(res, '分类不存在', 404);
    return;
  }

  if (existing.tools.length > 0) {
    errorResponse(res, '该分类下存在工具，无法删除', 400);
    return;
  }

  await prisma.category.delete({
    where: { id },
  });

  successResponse(res, null, '分类删除成功');
}

export async function toggleCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);

  const existing = await prisma.category.findUnique({
    where: { id },
  });

  if (!existing) {
    errorResponse(res, '分类不存在', 404);
    return;
  }

  const category = await prisma.category.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  successResponse(res, category, '分类状态更新成功');
}
