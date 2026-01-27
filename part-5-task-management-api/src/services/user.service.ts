import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export const userService = {
  async findAll(): Promise<UserListItem[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  },

  async findById(id: string): Promise<UserListItem | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  },
};
