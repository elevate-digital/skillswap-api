import { prisma } from "../../../lib/prisma";
import { SkillType } from "@prisma/client";

interface CreateSkillData {
    title: string;
    description: string;
    type: SkillType;
    user_id: number;
    tags?: string[];
}

interface UpdateSkillData {
    title?: string;
    description?: string;
    type?: SkillType;
    completed?: boolean;
    tags?: string[];
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
                    tag_id: { in: filters.tagIds }
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

    /** Resolve tag labels to tag IDs: find existing by name (case-insensitive), create missing tags with original casing. */
    private async resolveTagLabelsToIds(labels: string[]): Promise<number[]> {
        if (!labels?.length) return [];
        const trimmed = labels.map((l) => (l && String(l).trim())).filter(Boolean);
        const firstByLower = new Map<string, string>();
        for (const t of trimmed) {
            const key = t.toLowerCase();
            if (!firstByLower.has(key)) firstByLower.set(key, t);
        }
        const normalized = [...firstByLower.keys()];
        if (normalized.length === 0) return [];

        const existing = await this.prisma.tag.findMany({
            where: {
                OR: normalized.map((n) => ({ title: { equals: n, mode: 'insensitive' as const } }))
            }
        });
        const existingByLower = new Map(existing.map((t) => [t.title.toLowerCase(), t.id]));
        const ids: number[] = [];

        for (const key of normalized) {
            let tagId = existingByLower.get(key);
            if (tagId == null) {
                const created = await this.prisma.tag.create({
                    data: { title: firstByLower.get(key)! }
                });
                tagId = created.id;
                existingByLower.set(key, tagId);
            }
            ids.push(tagId);
        }
        return ids;
    }

    async create(data: CreateSkillData) {
        const { tags: tagLabels, ...skillData } = data;
        const tagIds = tagLabels?.length
            ? await this.resolveTagLabelsToIds(tagLabels)
            : undefined;

        const skill = await this.prisma.skill.create({
            data: {
                ...skillData,
                tags: tagIds && tagIds.length > 0 ? {
                    create: tagIds.map((tagId) => ({ tag_id: tagId }))
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
        const { tags: tagLabels, ...updateData } = data;

        if (tagLabels !== undefined) {
            await this.prisma.skill_Tag.deleteMany({
                where: { skill_id: id }
            });
            const tagIds = tagLabels?.length
                ? await this.resolveTagLabelsToIds(tagLabels)
                : [];
            if (tagIds.length > 0) {
                await this.prisma.skill_Tag.createMany({
                    data: tagIds.map((tagId) => ({
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
