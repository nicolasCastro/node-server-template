import { Request, Response } from 'express';
import { MSG_SUCCESS, SERVER_ERROR } from '../../utils/constants';
import { getUserId } from '../../utils/middlewares';
import Device from './device';


export const addDevice = async (request: Request, response: Response) => {
    try {
        const { fcm_token } = request.body;

        const id = getUserId(request);

        const device = Device.build({ id, fcm_token }, { isNewRecord: true });

        await device.save();

        response.status(200).json(device);
    } catch (error) {
        response.status(500).json({ msg: SERVER_ERROR, error: error });
    }
}

export const deleteDevice = async (request: Request, response: Response) => {
    const { fcm_token } = request.body;
    await Device.destroy({ where: { fcm_token: fcm_token }, force: true });
}

export const removeDevice = async (request: Request, response: Response) => {
    try {
        await deleteDevice(request, response);
        response.status(200).json({ msg: MSG_SUCCESS });
    } catch (error) {
        response.status(500).json({ msg: SERVER_ERROR, error: error });
    }
}