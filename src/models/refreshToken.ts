import { DataTypes } from "sequelize";
import database from "../config/dbconnection"

const RefreshToken = database.define('bxc_refresh_tokens', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER
    },
    refresh_token: {
        type: DataTypes.STRING
    }
}, {
    createdAt: false,
    updatedAt: false
});

export default RefreshToken;