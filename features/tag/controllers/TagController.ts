import TagService from "../services/TagService";
import { Request, Response } from 'express';

class TagController {

    service: TagService;

    constructor() {
        this.service = new TagService();
    }

    getAllTags = async (req: Request, res: Response) => {
        try {
            const tags = await this.service.findAll();
            res.status(200).json(tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({ message: 'Failed to fetch tags' });
        }
    }

    getTagById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const tag = await this.service.findOne(parseInt(id));

            if (!tag) {
                return res.status(404).json({ message: 'Tag not found' });
            }

            res.status(200).json(tag);
        } catch (error) {
            console.error('Error fetching tag:', error);
            res.status(500).json({ message: 'Failed to fetch tag' });
        }
    }

    createTag = async (req: Request, res: Response) => {
        try {
            const { title } = req.body;

            if (!title) {
                return res.status(400).json({ 
                    message: 'Title is required' 
                });
            }

            const tag = await this.service.create({ title });
            res.status(201).json(tag);
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: 'Tag with this title already exists' 
                });
            }
            console.error('Error creating tag:', error);
            res.status(500).json({ message: 'Failed to create tag' });
        }
    }

    createOrFindTag = async (req: Request, res: Response) => {
        try {
            const { title } = req.body;

            if (!title) {
                return res.status(400).json({ 
                    message: 'Title is required' 
                });
            }

            const tag = await this.service.createOrFind(title);
            res.status(200).json(tag);
        } catch (error) {
            console.error('Error creating or finding tag:', error);
            res.status(500).json({ message: 'Failed to create or find tag' });
        }
    }

    updateTag = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title } = req.body;

            if (!title) {
                return res.status(400).json({ 
                    message: 'Title is required' 
                });
            }

            const tag = await this.service.update(parseInt(id), { title });
            res.status(200).json(tag);
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Tag not found' });
            }
            if (error.code === 'P2002') {
                return res.status(409).json({ 
                    message: 'Tag with this title already exists' 
                });
            }
            console.error('Error updating tag:', error);
            res.status(500).json({ message: 'Failed to update tag' });
        }
    }

    deleteTag = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.service.delete(parseInt(id));
            res.status(204).send();
        } catch (error: any) {
            if (error.code === 'P2025') {
                return res.status(404).json({ message: 'Tag not found' });
            }
            console.error('Error deleting tag:', error);
            res.status(500).json({ message: 'Failed to delete tag' });
        }
    }
}

export default TagController;
