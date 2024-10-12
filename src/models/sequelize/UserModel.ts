import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/databases/mysql';

interface UserAttributes {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: string;
    userType: 'user' | 'admin';
    profileImg?: string; // Optional profile image field
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public phone!: string;
    public userType!: 'user' | 'admin';
    public profileImg?: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userType: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
        },
        profileImg: {
            type: DataTypes.STRING(2048),
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
    }
);

export default User;
