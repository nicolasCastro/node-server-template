import { Router } from "express";
import { check } from "express-validator";
import { INVALID_EMAIL, PASSWORD_POLICY, REQUIRED_FIELD } from "../../utils/constants";
import { checkUserLogin, checkFields, checkEmailDb, checkJWT, checkPasswordPolicy } from '../../utils/middlewares';
import { forgotPassword, login, logout, redeemForgotPassword, refresh, register, testToken, testPush } from './authController';

const router = Router();

router.get('/login',
    [
        check('email', INVALID_EMAIL).isEmail(),
        check('password', REQUIRED_FIELD).not().isEmpty(),
        check('password', PASSWORD_POLICY).custom(checkPasswordPolicy),
        check('email').custom((email, { req }) => checkUserLogin(email, req.body.password)),
        checkFields
    ],
    login);

router.post('/register',
    [
        check('name', REQUIRED_FIELD).not().isEmpty(),
        check('password', REQUIRED_FIELD).not().isEmpty(),
        check('password', PASSWORD_POLICY).custom(checkPasswordPolicy),
        check('email', INVALID_EMAIL).isEmail(),
        check('email').custom(checkEmailDb),
        checkFields
    ],
    register);

router.post('/refresh', refresh);

router.post('/logout',
    [
        checkJWT
    ], logout);

router.get('/test-token',
    [
        checkJWT
    ], testToken);

router.post('/test-push',
    [
        checkJWT
    ], testPush);

router.post('/forgot-password',
    [
        check('email').custom(checkEmailDb)
    ], forgotPassword);

router.put('/forgot-password',
    [
        check('token', REQUIRED_FIELD).not().isEmpty(),
        check('new_password', REQUIRED_FIELD).not().isEmpty(),
        check('new_password', PASSWORD_POLICY).custom(checkPasswordPolicy),
        checkFields
    ], redeemForgotPassword);

export default router;