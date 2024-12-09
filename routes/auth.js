const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Rota de teste
router.get('/test', (req, res) => {
    res.json({ message: 'Rota de auth funcionando!' });
});

// Registro
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verificar se o usuário já existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Nome de usuário já está em uso. Por favor, escolha outro.'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Criar usuário
        const user = await User.create({
            username,
            password: hashedPassword
        });

        res.json({
            success: true,
            message: 'Usuário registrado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao registrar:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao registrar usuário',
            error: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.json({
                success: false,
                message: 'Usuário ou senha inválidos'
            });
        }

        const token = jwt.sign(
            { id: user.id },
            'seu_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token,
            userId: user.id
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.json({
            success: false,
            message: 'Erro ao fazer login',
            error: error.message
        });
    }
});

module.exports = router; 