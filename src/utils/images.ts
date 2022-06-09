import cloudinary from 'cloudinary';
import { Response } from 'express';
import { MISSING_PARAMS, IMAGES_EXTENSIONS, IMAGES_INVALID_EXTENSIONS } from './constants';
cloudinary.v2.config(process.env.CLOUDINARY_URL);

export const validateImageFile = (request: any, response: Response, next: any) => {
    if (!request.files || Object.keys(request.files).length === 0 || !request.files.image) {
        return response.status(400).json({ msg: MISSING_PARAMS });
    }

    next();
}

export const validateImageExtension = (request: any, response: Response, next: any) => {

    const image = request.files.image;
    const nameSplitted = image.name.split('.');
    const extension = nameSplitted[nameSplitted.length - 1];

    if (!IMAGES_EXTENSIONS.includes(extension)) {
        return response.status(400).json({ msg: IMAGES_INVALID_EXTENSIONS });
    }

    next();
}

export const uploadImage = async (request: any, response: Response) => {
    const { tempFilePath } = request.files.image;
    const { secure_url } = await cloudinary.v2.uploader.upload(tempFilePath);

    return secure_url;
}


export const deleteImage = (avatar: string) => {

    if (avatar) {

        const paths = avatar.split('?')[0].split('/');
        const name = paths[paths.length - 1];
        const uid = name.split('.')[0];


        cloudinary.v2.uploader.destroy(uid);
    }

}