import express from 'express'
import UserRoutes from './features/user/routes/UserRoutes';
import SkillRoutes from './features/skill/routes/SkillRoutes';
import CommentRoutes from './features/comment/routes/CommentRoutes';
import TagRoutes from './features/tag/routes/TagRoutes';

const app = express()

app.use(express.json());

const userRoutes = new UserRoutes();
app.use('/user', userRoutes.initialize());

const skillRoutes = new SkillRoutes();
app.use('/skill', skillRoutes.initialize());

const commentRoutes = new CommentRoutes();
app.use('/comment', commentRoutes.initialize());

const tagRoutes = new TagRoutes();
app.use('/tag', tagRoutes.initialize());

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

export default app; 