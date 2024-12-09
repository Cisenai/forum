const router = require('express').Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Criar comentário
router.post('/', auth, async (req, res) => {
    try {
        const { content, postId } = req.body;
        
        const comment = await Comment.create({
            content,
            postId,
            userId: req.user.id
        });

        const commentWithUser = await Comment.findOne({
            where: { id: comment.id },
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        res.json({
            success: true,
            message: 'Comentário criado com sucesso',
            comment: commentWithUser
        });

    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar comentário'
        });
    }
});

// Listar comentários de um post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { postId: req.params.postId },
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            comments
        });

    } catch (error) {
        console.error('Erro ao listar comentários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar comentários'
        });
    }
});

// Editar comentário
router.put('/:id', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findOne({
            where: { 
                id: req.params.id,
                userId: req.user.id // Garante que apenas o autor pode editar
            }
        });

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentário não encontrado ou você não tem permissão para editá-lo'
            });
        }

        await comment.update({ content });

        res.json({
            success: true,
            message: 'Comentário atualizado com sucesso',
            comment
        });

    } catch (error) {
        console.error('Erro ao editar comentário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao editar comentário'
        });
    }
});

// Deletar comentário
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await Comment.destroy({
            where: { 
                id: req.params.id,
                userId: req.user.id // Garante que apenas o autor pode deletar
            }
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Comentário não encontrado ou você não tem permissão para deletá-lo'
            });
        }

        res.json({
            success: true,
            message: 'Comentário deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar comentário'
        });
    }
});

module.exports = router; 