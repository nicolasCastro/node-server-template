import { DataTypes } from "sequelize";
import database from "../../config/dbconnection";

const Device = database.define('bxc_user_devices', {
    id: {
        type: DataTypes.INTEGER
    },
    fcm_token: {
        type: DataTypes.STRING,
        primaryKey: true
    },
}, {
    createdAt: false,
    updatedAt: false
});

export default Device;