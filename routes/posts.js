const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Middleware para verificar token
const auth = require('../middleware/auth');

// Criar post
router.post('/', auth, async (req, res) => {
    try {
        console.log('Recebendo requisição para criar post');
        console.log('Body:', req.body);
        console.log('User:', req.user);

        const { title, content } = req.body;

        if (!title || !content) {
            console.log('Dados inválidos');
            return res.status(400).json({
                success: false,
                message: 'Título e conteúdo são obrigatórios'
            });
        }

        const post = await Post.create({
            title,
            content,
            userId: req.user.id
        });

        console.log('Post criado:', JSON.stringify(post, null, 2));

        // Busca o post com os dados do usuário
        const postWithUser = await Post.findByPk(post.id, {
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        console.log('Post com usuário:', JSON.stringify(postWithUser, null, 2));

        res.json({
            success: true,
            message: 'Post criado com sucesso',
            post: postWithUser
        });

    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar post',
            error: error.message
        });
    }
});

// Listar posts
router.get('/', async (req, res) => {
    try {
        console.log('Buscando posts...');
        const posts = await Post.findAll({
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log('Posts encontrados:', JSON.stringify(posts, null, 2));

        res.json({
            success: true,
            posts
        });

    } catch (error) {
        console.error('Erro ao listar posts:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar posts'
        });
    }
});

// Editar post
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findOne({ 
            where: { 
                id: req.params.id,
                userId: req.user.id // Garante que apenas o autor pode editar
            }
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado ou você não tem permissão para editá-lo'
            });
        }

        await post.update({ title, content });

        res.json({
            success: true,
            message: 'Post atualizado com sucesso',
            post
        });

    } catch (error) {
        console.error('Erro ao editar post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao editar post'
        });
    }
});

// Deletar post
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await Post.destroy({
            where: { 
                id: req.params.id,
                userId: req.user.id // Garante que apenas o autor pode deletar
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Post não encontrado ou você não tem permissão para deletá-lo'
            });
        }

        res.json({
            success: true,
            message: 'Post deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar post:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar post'
        });
    }
});

module.exports = router; 