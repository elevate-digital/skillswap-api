import { prisma } from "../../../lib/prisma";

interface CreateTagData {
    title: string;
}

interface UpdateTagData {
    title?: string;
}

class TagService {
    
    prisma = prisma;

    async findAll() {
        const tags = await this.prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        skills: true
                    }
                }
            },
            orderBy: {
                title: 'asc'
            }
        });

        return tags;
    }

    async findOne(id: number) {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: {
                skills: {
                    include: {
                        skill: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        skills: true
                    }
                }
            }
        });

        if (!tag) {
            return null;
        }

        return {
            ...tag,
            skills: tag.skills.map(st => st.skill)
        };
    }

    async findByTitle(title: string) {
        // MySQL doesn't support case-insensitive mode, so we'll search case-sensitively
        // For case-insensitive search, you could use raw SQL or handle it in application logic
        const tag = await this.prisma.tag.findFirst({
            where: {
                title: title
            }
        });

        return tag;
    }

    async create(data: CreateTagData) {
        const tag = await this.prisma.tag.create({
            data
        });

        return tag;
    }

    async createOrFind(title: string) {
        // Try to find existing tag (case-sensitive for MySQL)
        // For case-insensitive matching, you may want to normalize the title
        let tag = await this.prisma.tag.findFirst({
            where: {
                title: title
            }
        });

        // If not found, create it
        if (!tag) {
            tag = await this.prisma.tag.create({
                data: { title }
            });
        }

        return tag;
    }

    async update(id: number, data: UpdateTagData) {
        const tag = await this.prisma.tag.update({
            where: { id },
            data
        });

        return tag;
    }

    async delete(id: number) {
        await this.prisma.tag.delete({
            where: { id }
        });
    }
}

export default TagService;
