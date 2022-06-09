import { Router } from "express";
import { addDevice, removeDevice } from "./notificationController";
import { checkJWT } from '../../utils/middlewares';


const router = Router();

router.post('/add',
    [
        checkJWT
    ], addDevice);

router.delete('/remove',
    [
        checkJWT
    ], removeDevice);

export default router;