const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');

const app = express();

// Configuração CORS atualizada
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir todos os métodos necessários
    allowedHeaders: ['Content-Type', 'Authorization'] // Permitir headers necessários
}));

app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Rota de teste
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando!' });
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/upload', require('./routes/upload'));

// Iniciar servidor
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar:', error);
        process.exit(1);
    }
};

startServer(); 