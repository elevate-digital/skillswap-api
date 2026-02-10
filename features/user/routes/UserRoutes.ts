import { Router } from "express";
import UserController from "../controllers/UserController";

class UserRoutes {
    
    router: Router;
    controller: UserController;

    constructor() {
        this.router = Router();
        this.controller = new UserController();
    }

    initialize() {
        this.router.post('/register', this.controller.register);
        this.router.post('/login', this.controller.login);
        this.router.get('/:id', this.controller.findUser);
        return this.router;
    }
}

export default UserRoutes;