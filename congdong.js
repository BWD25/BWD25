document.addEventListener('DOMContentLoaded', () => {
    // Ensure currentUserEmail is set correctly on page load
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
        console.warn('No current user email found in localStorage.');
    }

    loadPosts();
    checkMembershipStatus();

    const createPostForm = document.getElementById('createPostForm');
    if (createPostForm) {
        createPostForm.addEventListener('submit', handlePostSubmit);
    } else {
        console.warn('createPostForm element not found.');
    }

    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinSubmit);
    } else {
        console.warn('joinForm element not found.');
    }

    const fileInput = document.getElementById('postImage');
    const fileLabel = document.querySelector('.file-label span');
    if (fileInput && fileLabel) {
        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || 'Chọn Ảnh';
            fileLabel.textContent = fileName;
        });
    } else {
        console.warn('fileInput or fileLabel element not found.');
    }
});

function checkMembershipStatus() {
    const currentUser = getCurrentUser();
    const postForm = document.querySelector('.post-form');
    const createPostForm = document.getElementById('createPostForm');
    const welcomeMessage = postForm?.querySelector('.welcome-message');
    const membershipMessage = postForm?.querySelector('.membership-required');

    if (!postForm || !createPostForm || !welcomeMessage || !membershipMessage) {
        console.error('Required DOM elements (postForm, createPostForm, welcomeMessage, or membershipMessage) are missing.');
        return;
    }

    if (!currentUser) {
        createPostForm.style.display = 'none';
        membershipMessage.style.display = 'block';
        welcomeMessage.textContent = '';
    } else {
        createPostForm.style.display = 'block';
        membershipMessage.style.display = 'none';
        welcomeMessage.textContent = `Xin chào, ${currentUser.name}!`;
    }
}

function getCurrentUser() {
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    return members.find(member => member.email === currentUserEmail) || null;
}

function handlePostSubmit(e) {
    e.preventDefault();

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.name) {
        alert('Bạn phải đăng ký làm thành viên trước khi đăng bài!');
        return;
    }

    const content = document.getElementById('postContent')?.value || '';
    const imageFile = document.getElementById('postImage')?.files[0];

    if (!content.trim()) {
        alert('Vui lòng nhập nội dung bài viết!');
        return;
    }

    const post = {
        id: Date.now(),
        content,
        author: currentUser.name,
        authorEmail: currentUser.email,
        timestamp: new Date().toISOString(),
        comments: [],
        likes: 0, // Thêm trường likes mặc định
        likedBy: [] // Thêm mảng để theo dõi người đã thích
    };

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            post.image = event.target.result;
            savePost(post);
        };
        reader.readAsDataURL(imageFile);
    } else {
        savePost(post);
    }

    e.target.reset();
    const fileLabel = document.querySelector('.file-label span');
    if (fileLabel) {
        fileLabel.textContent = 'Chọn Ảnh';
    }
}

function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    posts.unshift(post);
    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) {
        console.error('postsContainer element not found.');
        return;
    }

    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    // Ensure all posts have authorEmail, likes, and likedBy
    posts = posts.map(post => {
        if (!post || !post.author || typeof post.author !== 'string') {
            return null;
        }
        if (!post.authorEmail) {
            const members = JSON.parse(localStorage.getItem('members') || '[]');
            const matchedMember = members.find(member => member.name === post.author);
            post.authorEmail = matchedMember ? matchedMember.email : 'unknown@example.com';
        }
        if (!post.hasOwnProperty('likes')) post.likes = 0;
        if (!post.hasOwnProperty('likedBy')) post.likedBy = [];
        return post;
    }).filter(post => post !== null);

    localStorage.setItem('posts', JSON.stringify(posts)); // Save updated posts

    postsContainer.innerHTML = '<h2>Bài Viết Cộng Đồng</h2>';

    if (posts.length === 0) {
        postsContainer.innerHTML += `
            <div class="post" style="text-align: center;">
                <p>Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
            </div>
        `;
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.warn('No current user found when loading posts.');
        return;
    }

    posts.forEach(post => {
        const postElement = createPostElement(post, currentUser);
        postsContainer.appendChild(postElement);
    });
}

function createPostElement(post, currentUser) {
    const article = document.createElement('article');
    article.className = 'post';

    const author = typeof post.author === 'string' && post.author.trim() ? post.author : 'Người dùng ẩn danh';
    const firstLetter = author.charAt(0).toUpperCase();

    // Hiển thị nút "Gỡ Bài" cho tất cả bài đăng
    const deleteButton = `<button class="delete-post-btn" data-post-id="${post.id}">Gỡ Bài</button>`;
    // Thêm nút "Tim" và số lượt thích
    const isLiked = currentUser && post.likedBy.includes(currentUser.email);
    const likeButton = `
        <button class="like-post-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
            <span>❤️</span> ${post.likes}
        </button>
    `;

    article.innerHTML = `
        <div class="post-header">
            <div class="avatar">${firstLetter}</div>
            <div class="post-info">
                <h3>${author}</h3>
                <div class="post-meta">
                    <span class="timestamp">${new Date(post.timestamp).toLocaleString('vi-VN')}</span>
                </div>
            </div>
            ${deleteButton}
        </div>
        <p>${post.content}</p>
        ${post.image ? `<img src="${post.image}" alt="Post Image">` : ''}
        <div class="post-actions">
            ${likeButton}
        </div>
        <div class="comments">
            <h4>Bình luận (${post.comments.length})</h4>
            ${post.comments.map(comment => `
                <div class="comment">
                    <p>${comment.content}</p>
                    <small>${new Date(comment.timestamp).toLocaleString('vi-VN')}</small>
                </div>
            `).join('')}
            <form class="comment-form" data-post-id="${post.id}">
                <textarea placeholder="Viết bình luận của bạn..." required></textarea>
                <button type="submit">Gửi Bình Luận</button>
            </form>
        </div>
    `;

    const commentForm = article.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = e.target.querySelector('textarea').value;
            if (content.trim()) {
                addComment(post.id, content);
                e.target.reset();
            }
        });
    }

    const deleteBtn = article.querySelector('.delete-post-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn gỡ bài viết này?')) {
                deletePost(post.id);
            }
        });
    }

    const likeBtn = article.querySelector('.like-post-btn');
    if (likeBtn && currentUser) {
        likeBtn.addEventListener('click', () => {
            handleLike(post.id, currentUser.email);
        });
    }

    return article;
}

function handleLike(postId, userEmail) {
    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        const post = posts[postIndex];
        const hasLiked = post.likedBy.includes(userEmail);

        if (!hasLiked) {
            post.likes += 1;
            post.likedBy.push(userEmail);
        } else {
            post.likes -= 1;
            post.likedBy = post.likedBy.filter(email => email !== userEmail);
        }

        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }
}

function addComment(postId, content) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Bạn cần đăng ký làm thành viên để bình luận!');
        return;
    }

    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        const comment = {
            id: Date.now(),
            content,
            author: currentUser.name,
            timestamp: new Date().toISOString()
        };

        posts[postIndex].comments.push(comment);
        localStorage.setItem('posts', JSON.stringify(posts));
        loadPosts();
    }
}

function deletePost(postId) {
    let posts = JSON.parse(localStorage.getItem('posts') || '[]');
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}

function handleJoinSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('userEmail')?.value;
    const name = document.getElementById('userName')?.value;
    const reason = document.getElementById('userReason')?.value;

    if (!email || !name || !reason) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const existingMembers = JSON.parse(localStorage.getItem('members') || '[]');
    const memberExists = existingMembers.some(member => member.email === email);

    const member = {
        name,
        email,
        reason,
        timestamp: new Date().toISOString()
    };

    if (!memberExists) {
        existingMembers.push(member);
        localStorage.setItem('members', JSON.stringify(existingMembers));
    }

    localStorage.setItem('currentUserEmail', email);

    alert('Chào mừng bạn đã tham gia cộng đồng! Bây giờ bạn có thể đăng bài.');
    e.target.reset();
    checkMembershipStatus();
}