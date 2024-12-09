const API_URL = 'http://localhost:5000';

// Variável global para armazenar o ID do usuário logado
let currentUserId = null;

// Variável global para armazenar a URL da última imagem carregada
let lastUploadedImageUrl = null;

// Função para inicializar o usuário atual
function initCurrentUser() {
    const token = localStorage.getItem('token');
    currentUserId = localStorage.getItem('userId');
    console.log('CurrentUserId:', currentUserId); // Para debug
    if (token) {
        updateNavBar(true);
    } else {
        updateNavBar(false);
    }
}

// Funções de navegação
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forum-area').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('forum-area').style.display = 'none';
}

function showForum() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forum-area').style.display = 'block';
    loadPosts();
}

// Funções de autenticação
async function testConnection() {
    try {
        const response = await fetch(`${API_URL}/api/auth/test`);
        const data = await response.json();
        console.log('Teste de conexão:', data);
    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

async function register() {
    try {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        if (!username || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        console.log('Tentando registrar:', { username, password: '***' });

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                password: password 
            })
        });

        console.log('Status da resposta:', response.status);
        const text = await response.text();
        console.log('Resposta bruta:', text);

        const data = JSON.parse(text);
        console.log('Dados parseados:', data);

        if (data.success) {
            alert('Registro realizado com sucesso!');
            showLogin();
        } else {
            alert(data.message || 'Erro ao registrar');
        }
    } catch (error) {
        console.error('Erro completo:', error);
        alert('Erro ao registrar: ' + error.message);
    }
}

// Atualizar a função de login
async function login() {
    try {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        console.log('Tentando login:', { username, password: '***' });

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log('Resposta do login:', data); // Para debug

        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            currentUserId = data.userId;
            console.log('UserId definido:', currentUserId); // Para debug
            updateNavBar(true);
            showForum();
        } else {
            alert(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer login');
    }
}

function logout() {
    localStorage.removeItem('token');
    updateNavBar(false);
    showLogin();
}

// Funções do fórum
function getAuthToken() {
    const token = localStorage.getItem('token');
    console.log('Token atual:', token);
    return token;
}

async function createPost() {
    try {
        const title = document.getElementById('post-title').value;
        let content = document.getElementById('post-content').value;

        console.log('Conteúdo original:', content);

        // Ajustar URLs das imagens se necessário
        if (content.includes('![')) {
            content = content.replace(
                /!\[([^\]]*)\]\((http:\/\/localhost:5000\/uploads\/[^)]+)\)/g,
                (match, alt, url) => {
                    console.log('Ajustando URL da imagem:', { match, alt, url });
                    return `![${alt}](/uploads/${url.split('/uploads/')[1]})`;
                }
            );
        }

        console.log('Conteúdo ajustado:', content);

        if (!title || !content) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            console.error('Token não encontrado');
            alert('Você precisa estar logado para criar um post');
            return;
        }

        console.log('Enviando post com conteúdo:', content);

        const response = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (data.success) {
            alert('Post criado com sucesso!');
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            await loadPosts();
        } else {
            alert(data.message || 'Erro ao criar post');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar post');
    }
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const options = { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Configurar marked
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// Função para renderizar markdown com segurança
function renderMarkdown(content) {
    const rawHtml = marked.parse(content);
    return DOMPurify.sanitize(rawHtml);
}

// Switch entre abas de edição
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');

    if (tab === 'preview') {
        const content = document.getElementById('post-content').value;
        console.log('Conteúdo para preview:', content);
        document.getElementById('preview-content').innerHTML = renderMarkdown(content);
        hljs.highlightAll();
    }
}

// Carregar posts (atualizado com botões de editar/deletar)
async function loadPosts() {
    try {
        const response = await fetch(`${API_URL}/api/posts`);
        const data = await response.json();

        if (data.success) {
            console.log('Posts recebidos:', data.posts);

            const postsHtml = data.posts.map(post => {
                // Log do conteúdo original
                console.log('Conteúdo original:', post.content);
                
                // Ajusta as URLs das imagens para incluir a URL base da API
                const content = post.content.replace(
                    /!\[([^\]]*)\]\((\/uploads\/[^)]+)\)/g,
                    (match, alt, url) => {
                        console.log('Encontrou imagem:', { match, alt, url });
                        return `![${alt}](${API_URL}${url})`;
                    }
                );
                
                // Log do conteúdo após ajuste
                console.log('Conteúdo ajustado:', content);

                return `
                    <div class="post" id="post-${post.id}">
                        <div class="post-header">
                            <h3>${post.title}</h3>
                            ${post.userId == currentUserId ? `
                                <div class="post-actions">
                                    <button onclick="editPost(${post.id})" class="edit-btn">Editar</button>
                                    <button onclick="deletePost(${post.id})" class="delete-btn">Deletar</button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="post-meta">
                            <span class="author">Por: ${post.User.username}</span>
                            <span class="date">Em: ${formatDate(post.createdAt)}</span>
                        </div>
                        <div class="post-content markdown-body" id="post-content-${post.id}">
                            ${renderMarkdown(content)}
                        </div>
                        <div class="comments-section">
                            <h4>Comentários</h4>
                            <div class="comment-form">
                                <textarea id="comment-${post.id}" placeholder="Escreva um comentário..."></textarea>
                                <button onclick="addComment(${post.id})">Comentar</button>
                            </div>
                            <div id="comments-${post.id}" class="comments-list">
                                Carregando comentários...
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('posts-list').innerHTML = postsHtml;
            hljs.highlightAll();
            data.posts.forEach(post => loadComments(post.id));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar posts');
    }
}

// Carregar comentários (atualizado com botões de editar/deletar)
async function loadComments(postId) {
    try {
        const response = await fetch(`${API_URL}/api/comments/post/${postId}`);
        const data = await response.json();

        if (data.success) {
            const commentsHtml = data.comments.map(comment => `
                <div class="comment" id="comment-${comment.id}">
                    <div class="comment-content markdown-body" id="comment-content-${comment.id}">
                        ${renderMarkdown(comment.content)}
                    </div>
                    <div class="comment-meta">
                        <span class="author">Por: ${comment.User.username}</span>
                        <span class="date">Em: ${formatDate(comment.createdAt)}</span>
                    </div>
                    ${comment.userId == currentUserId ? `
                        <div class="comment-actions">
                            <button onclick="editComment(${comment.id})" class="edit-btn">Editar</button>
                            <button onclick="deleteComment(${comment.id})" class="delete-btn">Deletar</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');

            document.getElementById(`comments-${postId}`).innerHTML = 
                commentsHtml || '<p>Nenhum comentário ainda.</p>';
            hljs.highlightAll();
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById(`comments-${postId}`).innerHTML = 
            'Erro ao carregar comentários';
    }
}

// Adicionar comentário
async function addComment(postId) {
    try {
        const content = document.getElementById(`comment-${postId}`).value;
        
        if (!content) {
            alert('Por favor, escreva um comentário');
            return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, postId })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById(`comment-${postId}`).value = '';
            loadComments(postId);
        } else {
            alert(data.message || 'Erro ao adicionar comentário');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar comentário');
    }
}

// Função para atualizar a barra de navegação
function updateNavBar(isLoggedIn) {
    document.getElementById('forum-btn').style.display = isLoggedIn ? 'inline' : 'none';
    document.getElementById('logout-btn').style.display = isLoggedIn ? 'inline' : 'none';
}

// Atualizar window.onload
window.onload = function() {
    initCurrentUser();
    const token = localStorage.getItem('token');
    if (token) {
        updateNavBar(true);
        showForum();
    } else {
        updateNavBar(false);
        showLogin();
    }
};

// Editar post
async function editPost(postId) {
    const postElement = document.getElementById(`post-content-${postId}`);
    const currentContent = postElement.textContent;
    const newContent = prompt('Editar post:', currentContent);
    
    if (newContent && newContent !== currentContent) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newContent })
            });

            const data = await response.json();
            if (data.success) {
                loadPosts(); // Recarrega todos os posts
            } else {
                alert(data.message || 'Erro ao editar post');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao editar post');
        }
    }
}

// Deletar post
async function deletePost(postId) {
    if (confirm('Tem certeza que deseja deletar este post?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                loadPosts(); // Recarrega todos os posts
            } else {
                alert(data.message || 'Erro ao deletar post');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar post');
        }
    }
}

// Editar comentário
async function editComment(commentId) {
    const commentElement = document.getElementById(`comment-content-${commentId}`);
    const currentContent = commentElement.textContent;
    const newContent = prompt('Editar comentário:', currentContent);
    
    if (newContent && newContent !== currentContent) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newContent })
            });

            const data = await response.json();
            if (data.success) {
                loadPosts(); // Recarrega todos os posts e comentários
            } else {
                alert(data.message || 'Erro ao editar comentário');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao editar comentário');
        }
    }
}

// Deletar comentário
async function deleteComment(commentId) {
    if (confirm('Tem certeza que deseja deletar este comentário?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                loadPosts(); // Recarrega todos os posts e comentários
            } else {
                alert(data.message || 'Erro ao deletar comentário');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar comentário');
        }
    }
}

// Função para salvar o estado do post
function savePostState() {
    return {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value
    };
}

// Função para restaurar o estado do post
function restorePostState(state) {
    document.getElementById('post-title').value = state.title;
    document.getElementById('post-content').value = state.content;
}

// Função para fazer upload de imagem
async function handleImageUpload(event) {
    // Previne TODOS os comportamentos padrão
    if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    }
    
    const file = event.target.files[0];
    if (!file) return false;

    // Desabilita temporariamente o input para prevenir múltiplos uploads
    const imageInput = event.target;
    imageInput.disabled = true;

    try {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            const imageUrl = `${API_URL}${data.imageUrl}`;
            const imageMarkdown = `![Imagem](${imageUrl})`;
            
            const textarea = document.getElementById('post-content');
            textarea.value += '\n' + imageMarkdown + '\n';
            
            if (document.getElementById('preview-tab').classList.contains('active')) {
                document.getElementById('preview-content').innerHTML = renderMarkdown(textarea.value);
            }
        } else {
            throw new Error(data.message || 'Erro ao fazer upload da imagem');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
        // Reabilita o input e limpa o valor
        imageInput.disabled = false;
        imageInput.value = '';
    }

    return false; // Previne qualquer submissão de formulário
}

// Adiciona os event listeners quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image-input');
    if (imageInput) {
        // Previne eventos padrão no input
        imageInput.onclick = (e) => e.stopPropagation();
        imageInput.onchange = handleImageUpload;
        
        // Previne eventos padrão no botão de upload
        const uploadBtn = document.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                imageInput.click();
                return false;
            };
        }
    }
});