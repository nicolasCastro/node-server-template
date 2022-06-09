import { Request, Response } from "express";
import { MSG_SUCCESS, SERVER_ERROR, JWT_SCOPE_FORGOT_PASSWORD, LANG_HEADER } from '../../utils/constants';
import randomstring from "randomstring";
import User from '../users/user';
import bcrypt from 'bcryptjs';
import { createJWT, getUserByEmail, getUserById, createJWTNoExpiration } from '../../utils/middlewares';
import { deleteDevice } from "../notifications/notificationController";
import { sendEmail } from "../../utils/emails";
import jwt from 'jsonwebtoken';
import Localizables from '../../utils/translations';
import { StringKeys } from '../../utils/keys';
import RefreshToken from '../../models/refreshToken';
import NotificationsAdmin from '../notifications/notificationsAdmin';

export const login = async (request: Request, response: Response) => {

    const { email } = request.body;

    const user: any = await getUserByEmail(email);
    const token: any = await createJWT(user.id);
    const refreshToken: any = await createJWTNoExpiration(user.id);

    // Update refresh token on DB
    const [dbRefreshToken, created] = await RefreshToken.findOrCreate({
        where: { user_id: user.id },
        defaults: {
            refresh_token: refreshToken
        }
    });
    if (!created) await RefreshToken.update({ refresh_token: refreshToken }, { where: { user_id: user.id } });

    await user.update({ last_login_date: new Date() }, { where: { id: user.id } })

    // avoid to send the password value
    user.password = undefined;

    response.status(200).json({ access_token: token, refresh_token: refreshToken, user });
}

export const register = async (request: Request, response: Response) => {
    try {
        const localizables = new Localizables(request);
        const { email, password, name } = request.body;

        // assign an avatar
        const initials = name.split(" ").map((initial) => { return initial[0] }).slice(0, 2).join('');
        const avatar = `https://avatars.dicebear.com/api/initials/${initials}.svg?background=%232A4864&radius=50`;

        // create a random username
        const username = email.split('@')[0] + randomstring.generate({ length: 6, charset: 'numeric' });

        // encrypt password
        const salt = bcrypt.genSaltSync();
        const encryptedPassword = bcrypt.hashSync(password, salt);

        const user: any = User.build({
            avatar, email, name, username, password: encryptedPassword
        }, { isNewRecord: true });

        await user.save();

        // avoid to send the password value
        user.password = undefined;
        const token = await createJWT(user.id);
        const refreshToken: any = await createJWTNoExpiration(user.id);

        const dbRefreshToken: any = RefreshToken.build({
            user_id: user.id, refresh_token: refreshToken
        }, { isNewRecord: true });

        await dbRefreshToken.save();

        await sendEmail({
            from: localizables.getString(StringKeys.EMAIL_FROM),
            to: user.email,
            subject: localizables.getString(StringKeys.REGISTER_CONFIRM_EMAIL_TITLE),
            template: localizables.getString(StringKeys.REGISTER_CONFIRM_EMAIL_TEMPLATE),
            context: { name: user.name }
        }, () => { });

        response.status(200).json({ access_token: token, refresh_token: refreshToken, user });
    } catch (error) {
        response.status(500).json({ msg: SERVER_ERROR, error: error });
    }
}

export const refresh = async (request: Request, response: Response) => {
    const { refresh_token } = request.body;

    const exists: any = await RefreshToken.findOne({ where: { refresh_token } });

    if (refresh_token && exists) {
        const newToken: any = await createJWT(exists.user_id);

        response.status(200).json({ access_token: newToken });
    } else {
        response.status(400).json({ msg: SERVER_ERROR });
    }
}

export const logout = async (request: Request, response: Response) => {
    const { refresh_token } = request.body;
    const exists: any = await RefreshToken.findOne({ where: { refresh_token } });

    if (refresh_token && exists) {

        await RefreshToken.destroy({ where: { user_id: exists.user_id } });
        await deleteDevice(request, response);

        response.status(200).json({ msg: MSG_SUCCESS });
    } else {
        response.status(500).json({ msg: SERVER_ERROR });
    }
}

export const testPush = async (request: Request, response: Response) => {
    const { fcm_token } = request.body;
    const admin = NotificationsAdmin.Instance();

    const message = {
        notification: {
            title: 'BooXchange',
            body: 'Testing push!'
        },
        token: fcm_token
    };

    admin.sendNotification(message);
    response.status(200).json({ msg: 'Push sent successfully!' });
}

export const testToken = async (request: Request, response: Response) => {
    response.status(200).json({ msg: 'Valid token' });
}

export const forgotPassword = async (request: Request, response: Response) => {
    try {
        const localizables = new Localizables(request);
        const { email } = request.body;
        const user: any = await getUserByEmail(email);
        const token = await createJWT({
            uid: user.id,
            scope: JWT_SCOPE_FORGOT_PASSWORD
        }, '1h');

        await sendEmail({
            from: localizables.getString(StringKeys.EMAIL_FROM),
            to: user.email,
            subject: localizables.getString(StringKeys.FORGOT_PASS_REQUEST_EMAIL_TITLE),
            template: localizables.getString(StringKeys.FORGOT_PASS_REQUEST_EMAIL_TEMPLATE),
            context: {
                name: user.name,
                url: `http://localhost:3000/forgot-password?token=${token}`
            }
        }, (result: boolean) => {
            if (result) response.status(200).json({ msg: MSG_SUCCESS });
            else response.status(500).json({ msg: SERVER_ERROR });
        });
    } catch (error) {
        // email doesn't exist in DB
        response.status(200).json({ msg: MSG_SUCCESS });
    }
}

export const redeemForgotPassword = async (request: Request, response: Response) => {
    try {
        const localizables = new Localizables(request);
        const { token, new_password } = request.body;

        const decoded: any = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        if (decoded) {

            const { uid } = decoded;

            if (uid.uid && uid.scope && uid.scope === JWT_SCOPE_FORGOT_PASSWORD) {

                const salt = bcrypt.genSaltSync();
                const encryptedPassword = bcrypt.hashSync(new_password, salt);

                await User.update({ password: encryptedPassword }, { where: { id: uid.uid } });
                // send confirmation email
                const user: any = await getUserById(uid.uid);
                await sendEmail({
                    from: localizables.getString(StringKeys.EMAIL_FROM),
                    to: user.email,
                    subject: localizables.getString(StringKeys.FORGOT_PASS_CONFIRM_EMAIL_TITLE),
                    template: localizables.getString(StringKeys.FORGOT_PASS_CONFIRM_EMAIL_TEMPLATE),
                    context: {
                        name: user.name
                    }
                }, () => {
                    response.status(200).json({ msg: MSG_SUCCESS });
                });
            } else response.status(500).json({ msg: SERVER_ERROR });
        } else response.status(500).json({ msg: SERVER_ERROR });
    } catch (error) {
        response.status(500).json({ msg: SERVER_ERROR, error });
    }
}