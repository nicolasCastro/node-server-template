import User from "../flows/users/user";
import bcrypt from 'bcryptjs';
import { AUTH_ERROR, AUTH_HEADER, EMAIL_ALREADY_USED, INVALID_TOKEN, TOKEN_EXPIRATION_TIME, USERNAME_ALREADY_USED, PASSWORD_POLICY } from './constants';
import { Request, Response } from 'express';
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken';

export const createJWT = (uid: any = '', timeExpiration: string = undefined) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ uid }, process.env.JWT_PRIVATE_KEY, {
            expiresIn: timeExpiration ?? TOKEN_EXPIRATION_TIME
        }, (error, token) => {
            if (error) reject(error)
            else resolve(token);
        })
    });
}

export const createJWTNoExpiration = (uid: any = '', timeExpiration: string = undefined) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ uid }, process.env.JWT_PRIVATE_KEY, (error, token) => {
            if (error) reject(error)
            else resolve(token);
        })
    });
}

export const checkJWT = async (request: Request, response: Response, next: any) => {
    try {
        const token = request.header(AUTH_HEADER).split(' ')[1];
        if (!token) return response.status(403).json({ msg: INVALID_TOKEN });
        const decoded: any = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        const { uid, exp } = decoded;

        const user: any = await getUserById(uid);

        if (!user || !user.active) return response.status(403).json({ msg: INVALID_TOKEN });

        next();
    } catch (error) {
        response.status(403).json({ msg: INVALID_TOKEN, error });
    }
}

export const checkFields = (request: Request, resposne: Response, next: any) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) return resposne.status(400).json({
        errors
    })
    next();
}

export const checkUserLogin = async (email: string = '', password: string = '') => {
    // check the email
    const exist: any = await User.findOne({ where: { email } })
    if (!exist || !exist.active || !bcrypt.compareSync(password, exist.password))
        throw new Error(AUTH_ERROR);
}

export const checkEmailDb = async (email: string = '') => {
    // check the email
    const exist = await User.findOne({ where: { email } });
    if (exist) throw new Error(EMAIL_ALREADY_USED);
}

export const getUserById = async (id: number = -1) => {
    // get the user by id
    return await User.findByPk(id);
}

export const getUserByEmail = async (email: string = '') => {
    // get the user by email
    return await User.findOne({ where: { email } });
}

export const checkAvailableUsername = async (request: Request, resposne: Response, next: any) => {
    const { username } = request.body;
    const exist: any = await User.findOne({ where: { username } });
    if (exist) return resposne.status(400).json({ msg: USERNAME_ALREADY_USED });
    next();
}

export const getUserId = (request: Request) => {
    const token = request.header(AUTH_HEADER).split(' ')[1];

    const decoded: any = jwt.decode(token);
    const id = decoded.uid;
    return id;
}

export const checkPasswordPolicy = async (password: string) => {
    var strongRegex: RegExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    const result: boolean = strongRegex.test(password);
    if (!result) throw new Error(PASSWORD_POLICY);
}