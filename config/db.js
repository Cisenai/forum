const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('forum', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        // Sincroniza os modelos com o banco de dados
        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };