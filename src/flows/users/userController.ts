import { Request, Response } from "express";
import User from './user';
import bcrypt from 'bcryptjs';
import { SERVER_ERROR, MSG_SUCCESS, INVALID_PASS, MISSING_PARAMS, USER_NOT_FOUND } from '../../utils/constants';
import { deleteImage, uploadImage } from "../../utils/images";
import { getUserById, getUserId } from "../../utils/middlewares";

export const getUser = async (request: Request, response: Response) => {

    const id = getUserId(request);
    const user: any = await getUserById(id);

    // avoid to send the password value
    user.password = undefined;

    if (!id) response.status(400).json({ msg: MISSING_PARAMS });
    else if (!user) response.status(404).json({ msg: USER_NOT_FOUND });
    else response.status(200).json(user);
}

export const updateImage = async (request: Request, response: Response) => {
    try {
        const id = getUserId(request);
        const user: any = await getUserById(id);

        const imageUrl = await uploadImage(request, response);

        const oldAvatar = user.avatar;
        deleteImage(oldAvatar);

        user.avatar = imageUrl;

        await user.save();

        response.status(200).json(user);
    } catch (error) {
        response.status(500).json({ msg: SERVER_ERROR, error });
    }
}

export const updateUser = async (request: Request, response: Response) => {
    try {
        const id = getUserId(request);
        const { name, username } = request.body;

        await User.update({ name, username }, { where: { id } });

        response.status(200).json({ mgs: MSG_SUCCESS });
    } catch (error) {
        response.status(500).json({ mgs: SERVER_ERROR, error });
    }
}

export const deleteUser = async (request: Request, response: Response) => {
    try {
        const id = getUserId(request);
        const { active = false } = request.body;

        await User.update({ active }, { where: { id } });

        response.status(200).json({ mgs: MSG_SUCCESS })
    } catch (error) {
        response.status(500).json({ mgs: SERVER_ERROR, error })
    }
}


export const changeUserPassword = async (request: Request, response: Response) => {
    try {
        const id = getUserId(request);
        const user: any = await getUserById(id);
        const { old_password, new_password } = request.body;

        if (old_password !== new_password && bcrypt.compareSync(old_password, user.password)) {
            // new password hash
            const salt = bcrypt.genSaltSync();
            const encryptedPassword = bcrypt.hashSync(new_password, salt);

            await User.update({ password: encryptedPassword }, { where: { id } });
            response.status(200).json({ mgs: MSG_SUCCESS })
        } else {
            response.status(400).json({ mgs: INVALID_PASS })
        }
    } catch (error) {
        response.status(500).json({ mgs: SERVER_ERROR, error })
    }
}