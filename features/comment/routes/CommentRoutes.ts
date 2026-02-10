import { Router } from "express";
import CommentController from "../controllers/CommentController";
import { authenticate } from "../../../middleware/auth";

class CommentRoutes {
    
    router: Router;
    controller: CommentController;

    constructor() {
        this.router = Router();
        this.controller = new CommentController();
    }

    initialize() {
        // Public routes (no authentication required)
        this.router.get('/', this.controller.getAllComments);
        this.router.get('/:id', this.controller.getCommentById);
        
        // Protected routes (authentication required)
        this.router.post('/', authenticate, this.controller.createComment);
        this.router.put('/:id', authenticate, this.controller.updateComment);
        this.router.delete('/:id', authenticate, this.controller.deleteComment);
        return this.router;
    }
}

export default CommentRoutes;
