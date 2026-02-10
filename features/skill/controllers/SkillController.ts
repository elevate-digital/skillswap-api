import SkillService from "../services/SkillService";
import { Request, Response } from 'express';
import { SkillType } from "@prisma/client";

class SkillController {

    service: SkillService;

    constructor() {
        this.service = new SkillService();
    }

    getAllSkills = async (req: Request, res: Response) => {
        try {
            const { type, completed, userId, tagIds, search } = req.query;

            const filters: any = {};

            if (type) {
                filters.type = type as SkillType;
            }

            if (completed !== undefined) {
                filters.completed = completed === 'true';
            }

            if (userId) {
                filters.userId = parseInt(userId as string);
            }

            if (tagIds) {
                const ids = Array.isArray(tagIds) 
                    ? tagIds.map(id => parseInt(id as string))
                    : [parseInt(tagIds as string)];
                filters.tagIds = ids;
            }

            if (search) {
                filters.search = search as string;
            }

            const skills = await this.service.findAll(filters);
            res.status(200).json(skills);
        } catch (error) {
            console.error('Error fetching skills:', error);
            res.status(500).json({ message: 'Failed to fetch skills' });
        }
    }

    getSkillById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const skill = await this.service.findOne(parseInt(id));

            if (!skill) {
                return res.status(404).json({ message: 'Skill not found' });
            }

            res.status(200).json(skill);
        } catch (error) {
            console.error('Error fetching skill:', error);
            res.status(500).json({ message: 'Failed to fetch skill' });
        }
    }

    createSkill = async (req: Request, res: Response) => {
        try {
            const { title, description, type, tagIds } = req.body;

            if (!title || !description || !type) {
                return res.status(400).json({ 
                    message: 'Missing required fields: title, description, type' 
                });
            }

            if (!['OFFER', 'REQUEST'].includes(type)) {
                return res.status(400).json({ 
                    message: 'Type must be either OFFER or REQUEST' 
                });
            }

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            const skill = await this.service.create({
                title,
                description,
                type: type as SkillType,
                user_id,
                tagIds: tagIds ? (Array.isArray(tagIds) ? tagIds.map(id => parseInt(id)) : [parseInt(tagIds)]) : undefined
            });

            res.status(201).json(skill);
        } catch (error) {
            console.error('Error creating skill:', error);
            res.status(500).json({ message: 'Failed to create skill' });
        }
    }

    updateSkill = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title, description, type, completed, tagIds } = req.body;

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            // Check if skill exists and belongs to user
            const existingSkill = await this.service.findOne(parseInt(id));
            if (!existingSkill) {
                return res.status(404).json({ message: 'Skill not found' });
            }

            // user_id is available directly on the skill object
            const skillUserId = (existingSkill as any).user_id || existingSkill.user?.id;
            if (skillUserId !== user_id) {
                return res.status(403).json({ 
                    message: 'You can only update your own skills' 
                });
            }

            const updateData: any = {};

            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (type !== undefined) {
                if (!['OFFER', 'REQUEST'].includes(type)) {
                    return res.status(400).json({ 
                        message: 'Type must be either OFFER or REQUEST' 
                    });
                }
                updateData.type = type as SkillType;
            }
            if (completed !== undefined) updateData.completed = completed === true || completed === 'true';
            if (tagIds !== undefined) {
                updateData.tagIds = Array.isArray(tagIds) 
                    ? tagIds.map(id => parseInt(id))
                    : [parseInt(tagIds)];
            }

            const skill = await this.service.update(parseInt(id), updateData);
            res.status(200).json(skill);
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Skill not found' });
            }
            console.error('Error updating skill:', error);
            res.status(500).json({ message: 'Failed to update skill' });
        }
    }

    deleteSkill = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            // Check if skill exists and belongs to user
            const existingSkill = await this.service.findOne(parseInt(id));
            if (!existingSkill) {
                return res.status(404).json({ message: 'Skill not found' });
            }

            // user_id is available directly on the skill object
            const skillUserId = (existingSkill as any).user_id || existingSkill.user?.id;
            if (skillUserId !== user_id) {
                return res.status(403).json({ 
                    message: 'You can only delete your own skills' 
                });
            }

            await this.service.delete(parseInt(id));
            res.status(204).send();
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Skill not found' });
            }
            console.error('Error deleting skill:', error);
            res.status(500).json({ message: 'Failed to delete skill' });
        }
    }

    getStats = async (req: Request, res: Response) => {
        try {
            const stats = await this.service.getStats();
            res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({ message: 'Failed to fetch stats' });
        }
    }
}

export default SkillController;
