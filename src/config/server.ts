import express from 'express';
import fileUpload from 'express-fileupload';
import userRoutes from '../flows/users/userRouter';
import authRoutes from '../flows/auth/authRouter';
import notificationRoutes from '../flows/notifications/notificationRouter';
import cors from 'cors';
import database from './dbconnection';

export class Server {

    private app: express.Application;
    private port: string;
    private paths = {
        users: '/api/users',
        auth: '/api/auth',
        notifications: '/api/notifications'
    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000';

        this.dbConnection();
        this.static();
        this.middlewares();
        this.routes();
    }

    async dbConnection() {
        try {
            await database.authenticate();
            console.log('Database connected successfully');
        } catch (error) {
            throw new Error(error);
        }
    }

    static() {
        this.app.set('view engine', 'hbs');
        this.app.use(express.static('public'));
        this.app.get('/forgot-password', function (req, res) {
            res.render('forgot-password', {
                name: 'BooXchange',
                title: 'Forgot password'
            });
        })
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));
    }

    routes() {
        this.app.use(this.paths.users, userRoutes);
        this.app.use(this.paths.auth, authRoutes);
        this.app.use(this.paths.notifications, notificationRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port ' + this.port);
        })
        this.app.on('error', err => {
            if (err) console.log('Server error: ' + err);
        })
    }
}