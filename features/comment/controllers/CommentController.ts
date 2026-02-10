import CommentService from "../services/CommentService";
import { Request, Response } from 'express';

class CommentController {

    service: CommentService;

    constructor() {
        this.service = new CommentService();
    }

    getAllComments = async (req: Request, res: Response) => {
        try {
            const { skillId, userId } = req.query;

            const filters: any = {};

            if (skillId) {
                filters.skillId = parseInt(skillId as string);
            }

            if (userId) {
                filters.userId = parseInt(userId as string);
            }

            const comments = await this.service.findAll(filters);
            res.status(200).json(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            res.status(500).json({ message: 'Failed to fetch comments' });
        }
    }

    getCommentById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const comment = await this.service.findOne(parseInt(id));

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            res.status(200).json(comment);
        } catch (error) {
            console.error('Error fetching comment:', error);
            res.status(500).json({ message: 'Failed to fetch comment' });
        }
    }

    createComment = async (req: Request, res: Response) => {
        try {
            const { message, skill_id } = req.body;

            if (!message || !skill_id) {
                return res.status(400).json({ 
                    message: 'Missing required fields: message, skill_id' 
                });
            }

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            const comment = await this.service.create({
                message,
                user_id,
                skill_id: parseInt(skill_id)
            });

            res.status(201).json(comment);
        } catch (error: any) {
            if (error.code === 'P2003') {
                return res.status(404).json({ 
                    message: 'User or Skill not found' 
                });
            }
            console.error('Error creating comment:', error);
            res.status(500).json({ message: 'Failed to create comment' });
        }
    }

    updateComment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ 
                    message: 'Message is required' 
                });
            }

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            // Check if comment exists and belongs to user
            const existingComment = await this.service.findOne(parseInt(id));
            if (!existingComment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // user_id is available directly on the comment object
            const commentUserId = (existingComment as any).user_id || existingComment.user?.id;
            if (commentUserId !== user_id) {
                return res.status(403).json({ 
                    message: 'You can only update your own comments' 
                });
            }

            const comment = await this.service.update(parseInt(id), { message });
            res.status(200).json(comment);
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Comment not found' });
            }
            console.error('Error updating comment:', error);
            res.status(500).json({ message: 'Failed to update comment' });
        }
    }

    deleteComment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Get user ID from authenticated token
            const user_id = req.user?.userId;
            if (!user_id) {
                return res.status(403).json({ 
                    message: 'Authentication required' 
                });
            }

            // Check if comment exists and belongs to user
            const existingComment = await this.service.findOne(parseInt(id));
            if (!existingComment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // user_id is available directly on the comment object
            const commentUserId = (existingComment as any).user_id || existingComment.user?.id;
            if (commentUserId !== user_id) {
                return res.status(403).json({ 
                    message: 'You can only delete your own comments' 
                });
            }

            await this.service.delete(parseInt(id));
            res.status(204).send();
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Comment not found' });
            }
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Failed to delete comment' });
        }
    }
}

export default CommentController;
