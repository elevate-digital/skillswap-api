import { Router } from "express";
import SkillController from "../controllers/SkillController";
import { authenticate } from "../../../middleware/auth";

class SkillRoutes {
    
    router: Router;
    controller: SkillController;

    constructor() {
        this.router = Router();
        this.controller = new SkillController();
    }

    initialize() {
        // Public routes (no authentication required)
        this.router.get('/stats', this.controller.getStats);
        this.router.get('/', this.controller.getAllSkills);
        this.router.get('/:id', this.controller.getSkillById);
        
        // Protected routes (authentication required)
        this.router.post('/', authenticate, this.controller.createSkill);
        this.router.put('/:id', authenticate, this.controller.updateSkill);
        this.router.delete('/:id', authenticate, this.controller.deleteSkill);
        return this.router;
    }
}

export default SkillRoutes;
