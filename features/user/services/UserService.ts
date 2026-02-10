import { prisma } from "../../../lib/prisma";
import bcrypt from 'bcryptjs';

interface CreateUserData {
    name: string;
    email: string;
    password: string;
}

class UserService {
    
    prisma = prisma;

    async findUser(id: number) {
        if (!id || isNaN(id)) {
            throw new Error('Invalid user ID');
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                email: true,
                name: true,
                created_at: true,
                updated_at: true
            }
        });

        return user;
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });

        return user;
    }

    async findByName(name: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                name: name
            }
        });

        return user;
    }

    async createUser(data: CreateUserData) {
        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                created_at: true,
                updated_at: true
            }
        });

        return user;
    }

    async verifyPassword(email: string, password: string) {
        const user = await this.findByEmail(email);
        
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return null;
        }

        // Return user without password
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
}

export default UserService;