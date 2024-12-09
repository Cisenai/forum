const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configurar o multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log('Salvando arquivo em:', path.join(__dirname, '../uploads/'));
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        console.log('Nome do arquivo:', filename);
        cb(null, filename);
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    console.log('Tipo do arquivo:', file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // limite de 5MB
    }
});

// Rota para upload de imagem
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        console.log('Requisição de upload recebida');
        console.log('Arquivo:', req.file);

        if (!req.file) {
            console.log('Nenhum arquivo recebido');
            return res.status(400).json({
                success: false,
                message: 'Nenhuma imagem foi enviada'
            });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        console.log('URL da imagem gerada:', imageUrl);

        res.json({
            success: true,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao fazer upload da imagem'
        });
    }
});

module.exports = router; 