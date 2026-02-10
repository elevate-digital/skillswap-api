import { Router } from "express";
import TagController from "../controllers/TagController";
import { authenticate } from "../../../middleware/auth";

class TagRoutes {
    
    router: Router;
    controller: TagController;

    constructor() {
        this.router = Router();
        this.controller = new TagController();
    }

    initialize() {
        // Public routes (no authentication required)
        this.router.get('/', this.controller.getAllTags);
        this.router.get('/:id', this.controller.getTagById);
        
        // Protected routes (authentication required)
        this.router.post('/', authenticate, this.controller.createTag);
        this.router.post('/find-or-create', authenticate, this.controller.createOrFindTag);
        this.router.put('/:id', authenticate, this.controller.updateTag);
        this.router.delete('/:id', authenticate, this.controller.deleteTag);
        return this.router;
    }
}

export default TagRoutes;
