const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
    sendBtn.disabled = !userInput.value.trim();
});

// Handle send
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Add user message
    addMessage(text, 'user');

    // Add loading indicator
    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: text })
        });

        const data = await response.json();
        removeLoadingIndicator(loadingId);

        if (data.reply) {
            addMessage(data.reply, 'assistant');
        } else {
            addMessage('Có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.', 'assistant');
        }
    } catch (error) {
        console.error(error);
        removeLoadingIndicator(loadingId);
        addMessage('Lỗi hệ thống: Không thể kết nối với server.', 'assistant');
    }
}

function addMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    const icon = role === 'user' ? 'fa-user' : 'fa-robot';
    
    msgDiv.innerHTML = `
        <div class="avatar-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="message-content">
            <p>${formatText(text)}</p>
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = id;
    loadingDiv.innerHTML = `
        <div class="avatar-icon">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function formatText(text) {
    // Basic formatting for newlines and code blocks
    return text
        .replace(/\n/g, '<br>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// Suggestion chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        userInput.value = chip.textContent;
        userInput.dispatchEvent(new Event('input'));
        sendMessage();
    });
});

// File Upload handling (PDF/DOCX)
const fileUpload = document.getElementById('file-upload');
const uploadStatus = document.getElementById('upload-status');

fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toUpperCase();
    uploadStatus.textContent = `Đang xử lý ${extension}...`;
    uploadStatus.style.color = '#a3a3a3';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            uploadStatus.textContent = '✅ Đã nạp tài liệu!';
            uploadStatus.style.color = '#10a37f';
            addMessage(`Đã học xong tài liệu: **${file.name}**. Giờ bạn có thể hỏi tôi về nội dung trong file này.`, 'assistant');
        } else {
            uploadStatus.textContent = '❌ Lỗi tải lên';
            uploadStatus.style.color = '#ff4444';
        }
    } catch (error) {
        console.error(error);
        uploadStatus.textContent = '❌ Lỗi kết nối';
        uploadStatus.style.color = '#ff4444';
    }
});
