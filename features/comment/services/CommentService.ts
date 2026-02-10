import { prisma } from "../../../lib/prisma";

interface CreateCommentData {
    message: string;
    user_id: number;
    skill_id: number;
}

interface UpdateCommentData {
    message?: string;
}

class CommentService {
    
    prisma = prisma;

    async findAll(filters?: {
        skillId?: number;
        userId?: number;
    }) {
        const where: any = {};

        if (filters?.skillId) {
            where.skill_id = filters.skillId;
        }

        if (filters?.userId) {
            where.user_id = filters.userId;
        }

        const comments = await this.prisma.comment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skill: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        return comments;
    }

    async findOne(id: number) {
        const comment = await this.prisma.comment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skill: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            }
        });

        return comment;
    }

    async create(data: CreateCommentData) {
        const comment = await this.prisma.comment.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skill: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return comment;
    }

    async update(id: number, data: UpdateCommentData) {
        const comment = await this.prisma.comment.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                skill: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return comment;
    }

    async delete(id: number) {
        await this.prisma.comment.delete({
            where: { id }
        });
    }
}

export default CommentService;
