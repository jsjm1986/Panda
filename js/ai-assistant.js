document.addEventListener('DOMContentLoaded', function() {
    const aiButton = document.getElementById('aiButton');
    const chatWindow = document.getElementById('chatWindow');
    const minimizeChat = document.getElementById('minimizeChat');
    const closeChat = document.getElementById('closeChat');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // 打开/关闭聊天窗口
    aiButton.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            userInput.focus();
        }
    });

    // 最小化聊天窗口
    minimizeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // 关闭聊天窗口
    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // 发送消息
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            // 添加用户消息到聊天窗口
            addMessage('user', message);
            
            // 清空输入框
            userInput.value = '';
            
            // 显示正在输入指示器
            showTypingIndicator();
            
            // 调用DeepSeek API（这里需要实现具体的API调用）
            callDeepSeekAPI(message);
        }
    }

    // 发送按钮点击事件
    sendMessage.addEventListener('click', sendUserMessage);

    // 回车发送消息
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
    });

    // 自动调整输入框高度
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });

    // 添加消息到聊天窗口
    function addMessage(type, text) {
        // 防止重复消息
        const lastMessage = chatMessages.lastElementChild;
        if (lastMessage && 
            lastMessage.classList.contains(type) && 
            lastMessage.querySelector('.message-text').textContent === text) {
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (type === 'assistant') {
            const avatar = document.createElement('i');
            avatar.className = 'fas fa-robot message-avatar';
            messageContent.appendChild(avatar);
        }
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 显示正在输入指示器
    let currentTypingIndicator = null;  // 添加全局变量跟踪当前的输入指示器

    function showTypingIndicator() {
        // 如果已经存在输入指示器，先移除它
        if (currentTypingIndicator) {
            currentTypingIndicator.remove();
        }

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-robot message-avatar"></i>
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        currentTypingIndicator = typingDiv;  // 保存当前的输入指示器引用
        return typingDiv;
    }

    // 调用DeepSeek API
    async function callDeepSeekAPI(message) {
        const typingIndicator = showTypingIndicator();
        const API_KEY = 'sk-7eeeb89fd2b64611b73cea2c9f7d55de';
        const API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
        
        try {
            // 防止重复请求
            if (sendMessage.disabled) {
                return;
            }
            sendMessage.disabled = true;  // 禁用发送按钮

            // 获取当前语言
            const currentLang = document.getElementById('languageSelector').value;

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        {
                            role: "system",
                            content: `你是熊猫车服的AI客服助手，熟悉二手车出口业务，可以回答用户关于公司服务、合作方式、出口流程等问题。
                                    请注意以下要求：
                                    1. 请使用用户提问时使用的语言来回答
                                    2. 如果用户使用中文提问，用中文回答
                                    3. 如果用户使用英文提问，用英文回答
                                    4. 如果用户使用俄语提问，用俄语回答
                                    5. 如果用户使用阿拉伯语提问，用阿拉伯语回答
                                    6. 如果用户使用日语提问，用日语回答
                                    7. 如果用户使用德语提问，用德语回答
                                    8. 如果用户使用法语提问，用法语回答
                                    9. 如果用户使用哈萨克语提问，用哈萨克语回答
                                    当前网站界面语言：${currentLang}
                                    请用专业、友好的语气回答用户问题，确保每次回复都是完整的一条消息。`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                })
            });
            
            const data = await response.json();
            
            // 移除输入指示器
            if (currentTypingIndicator) {
                currentTypingIndicator.remove();
                currentTypingIndicator = null;
            }
            
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const aiResponse = data.choices[0].message.content;
                const cleanedResponse = aiResponse.trim().replace(/\n{2,}/g, '\n');
                addMessage('assistant', cleanedResponse);
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error:', error);
            if (currentTypingIndicator) {
                currentTypingIndicator.remove();
                currentTypingIndicator = null;
            }
            // 使用多语言错误消息
            const errorMessage = document.querySelector('[data-i18n="ai-error-message"]')?.textContent || 
                               '抱歉，服务出现了一些问题，请稍后再试。如果问题持续存在，请通过其他联系方式与我们联系。';
            addMessage('assistant', errorMessage);
        } finally {
            sendMessage.disabled = false;  // 重新启用发送按钮
        }
    }

    // 语言切换时更新AI助手界面文本
    document.getElementById('languageSelector').addEventListener('change', function() {
        // 更新placeholder文本
        const placeholder = document.querySelector('[data-i18n-placeholder="ai-assistant-placeholder"]');
        if (placeholder) {
            placeholder.placeholder = placeholder.getAttribute('data-i18n-placeholder');
        }
    });
}); 