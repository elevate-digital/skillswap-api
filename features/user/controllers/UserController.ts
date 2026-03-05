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
            
            if (!id) {
                return res.status(400).json({ message: 'Gebruiker ID is vereist' });
            }

            const userId = parseInt(id);
            if (isNaN(userId)) {
                return res.status(400).json({ message: 'Ongeldig gebruikers ID formaat' });
            }

            const user = await this.service.findUser(userId);

            if (!user) {
                return res.status(404).json({ message: 'Gebruiker niet gevonden' });
            }

            res.status(200).json(user);
        } catch (error: any) {
            console.error('Error finding user:', error);
            if (error.message === 'Ongeldig gebruikers ID formaat') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Gebruiker niet gevonden' });
        }
    }

    register = async (req: Request, res: Response) => {
        try {
            const { name, email, password } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    message: 'Ontbrekende verplichte velden: naam, e-mail, wachtwoord' 
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'Ongeldig e-mailformaat' 
                });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({ 
                    message: 'Wachtwoord moet minimaal 6 tekens lang zijn' 
                });
            }

            // Check if user with email already exists
            const existingUserByEmail = await this.service.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(409).json({ 
                    message: 'Er bestaat al een gebruiker met dit e-mailadres' 
                });
            }

            // Check if user with name already exists
            const existingUserByName = await this.service.findByName(name);
            if (existingUserByName) {
                return res.status(409).json({ 
                    message: 'Er bestaat al een gebruiker met deze naam' 
                });
            }

            // Create new user
            const user = await this.service.createUser({
                name,
                email,
                password
            });

            res.status(201).json({
                message: 'Gebruiker is succesvol geregistreerd',
                user
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: 'Er bestaat al een gebruiker met dit e-mailadres of deze naam' 
                });
            }
            console.error('Error registreren gebruiker:', error);
            res.status(500).json({ message: 'Registratie van gebruiker mislukt' });
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Ontbrekende verplichte velden: e-mailadres, wachtwoord' 
                });
            }

            // Verify credentials
            const user = await this.service.verifyPassword(email, password);

            if (!user) {
                return res.status(401).json({ 
                    message: 'Ongeldig e-mailadres of wachtwoord' 
                });
            }

            // Generate JWT token
            const token = generateToken({
                userId: user.id,
                email: user.email
            });

            res.status(200).json({
                message: 'Inloggen succesvol',
                user,
                token
            });
        } catch (error) {
            console.error('Error tijdens inloggen:', error);
            res.status(500).json({ message: 'Inloggen mislukt' });
        }
    }
}

export default UserController