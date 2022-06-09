import { Router } from "express";
import { changeUserPassword, deleteUser, getUser, updateImage, updateUser } from "./userController";
import { validateImageFile, validateImageExtension } from '../../utils/images';
import { checkAvailableUsername, checkFields, checkJWT, checkPasswordPolicy } from '../../utils/middlewares';
import { PASSWORD_POLICY, REQUIRED_FIELD } from "../../utils/constants";
import { check } from "express-validator";

const router = Router();

router.get('/',
    [
        checkJWT
    ], getUser);

router.put('/image',
    [
        checkJWT,
        validateImageFile,
        validateImageExtension
    ], updateImage);

router.put('/',
    [
        checkJWT,
        checkAvailableUsername
    ], updateUser);

router.delete('/',
    [
        checkJWT
    ], deleteUser);

router.put('/change-password',
    [
        checkJWT,
        check('old_password', REQUIRED_FIELD).not().isEmpty(),
        check('old_password', PASSWORD_POLICY).custom(checkPasswordPolicy),
        check('new_password', REQUIRED_FIELD).not().isEmpty(),
        check('new_password', PASSWORD_POLICY).custom(checkPasswordPolicy),
        checkFields
    ], changeUserPassword);


export default router;