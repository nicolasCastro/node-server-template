import { DataTypes } from "sequelize";
import database from "../../config/dbconnection";

const User = database.define('bxc_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    },
    avatar: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN
    },
    last_login_date: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    },
    createdAt: {
        type: DataTypes.DATE
    },
    type: {
        type: DataTypes.INTEGER
    }
});

export default User;