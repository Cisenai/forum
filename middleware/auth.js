const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Pegar o token do header
        const token = req.header('Authorization').replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, 'seu_jwt_secret');
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
}; 