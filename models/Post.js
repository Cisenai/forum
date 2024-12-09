const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'Posts'
});

Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post, { foreignKey: 'userId' });

module.exports = Post; 