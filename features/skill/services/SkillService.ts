import { prisma } from "../../../lib/prisma";
import { SkillType } from "@prisma/client";

interface CreateSkillData {
    title: string;
    description: string;
    type: SkillType;
    user_id: number;
    tagIds?: number[];
}

interface UpdateSkillData {
    title?: string;
    description?: string;
    type?: SkillType;
    completed?: boolean;
    tagIds?: number[];
}

class SkillService {
    
    prisma = prisma;

    async findAll(filters?: {
        type?: SkillType;
        completed?: boolean;
        userId?: number;
        tagIds?: number[];
        search?: string;
    }) {
        const where: any = {};

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.completed !== undefined) {
            where.completed = filters.completed;
        }

        if (filters?.userId) {
            where.user_id = filters.userId;
        }

        if (filters?.tagIds && filters.tagIds.length > 0) {
            where.tags = {
                some: {
                    tag_id: {
                        in: filters.tagIds
                    }
                }
            };
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search } },
                { description: { contains: filters.search } }
            ];
        }

        const skills = await this.prisma.skill.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return skills.map(skill => ({
            ...skill,
            tags: skill.tags.map(st => st.tag)
        }));
    }

    async findOne(id: number) {
        const skill = await this.prisma.skill.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'asc'
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        });

        if (!skill) {
            return null;
        }

        return {
            ...skill,
            tags: skill.tags.map(st => st.tag)
        };
    }

    async create(data: CreateSkillData) {
        const { tagIds, ...skillData } = data;

        const skill = await this.prisma.skill.create({
            data: {
                ...skillData,
                tags: tagIds && tagIds.length > 0 ? {
                    create: tagIds.map(tagId => ({
                        tag_id: tagId
                    }))
                } : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        return {
            ...skill,
            tags: skill.tags.map(st => st.tag)
        };
    }

    async update(id: number, data: UpdateSkillData) {
        const { tagIds, ...updateData } = data;

        // If tagIds are provided, replace all existing tags
        if (tagIds !== undefined) {
            // Delete existing tag relations
            await this.prisma.skill_Tag.deleteMany({
                where: { skill_id: id }
            });

            // Create new tag relations if provided
            if (tagIds.length > 0) {
                await this.prisma.skill_Tag.createMany({
                    data: tagIds.map(tagId => ({
                        skill_id: id,
                        tag_id: tagId
                    }))
                });
            }
        }

        const skill = await this.prisma.skill.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        return {
            ...skill,
            tags: skill.tags.map(st => st.tag)
        };
    }

    async delete(id: number) {
        await this.prisma.skill.delete({
            where: { id }
        });
    }

    async getStats() {
        const [totalOfferings, totalRequests, openOfferings, openRequests] = await Promise.all([
            this.prisma.skill.count({ where: { type: 'OFFER' } }),
            this.prisma.skill.count({ where: { type: 'REQUEST' } }),
            this.prisma.skill.count({ where: { type: 'OFFER', completed: false } }),
            this.prisma.skill.count({ where: { type: 'REQUEST', completed: false } })
        ]);

        return {
            totalOfferings,
            totalRequests,
            openOfferings,
            openRequests
        };
    }
}

export default SkillService;
