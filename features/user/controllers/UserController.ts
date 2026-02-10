import UserService from "../services/UserService";
import { Request, Response } from 'express';
import { generateToken } from "../../../lib/jwt";

class UserController {

    service: UserService;

    constructor() {
        this.service = new UserService();
    }

    findUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await this.service.findUser(parseInt(id));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Error finding user:', error);
            res.status(500).json({ message: 'Failed to find user' });
        }
    }

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    message: 'Missing required fields: name, email, password' 
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'Invalid email format' 
                });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({ 
                    message: 'Password must be at least 6 characters long' 
                });
            }

            // Check if user with email already exists
            const existingUserByEmail = await this.service.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(409).json({ 
                    message: 'User with this email already exists' 
                });
            }

            // Check if user with name already exists
            const existingUserByName = await this.service.findByName(name);
            if (existingUserByName) {
                return res.status(409).json({ 
                    message: 'User with this name already exists' 
                });
            }

            // Create new user
            const user = await this.service.createUser({
                name,
                email,
                password
            });

            res.status(201).json({
                message: 'User registered successfully',
                user
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: 'User with this email or name already exists' 
                });
            }
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Failed to register user' });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Missing required fields: email, password' 
                });
            }

            // Verify credentials
            const user = await this.service.verifyPassword(email, password);

            if (!user) {
                return res.status(401).json({ 
                    message: 'Invalid email or password' 
                });
            }

            // Generate JWT token
            const token = generateToken({
                userId: user.id,
                email: user.email
            });

            res.status(200).json({
                message: 'Login successful',
                user,
                token
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Failed to login' });
        }
    }
}

export default UserController