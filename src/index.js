// 密码管理器 - 主脚本

class PasswordManager {
    constructor() {
        this.passwords = [];
        this.selectedCategory = 'all';
        this.selectedPassword = null;
        this.searchQuery = '';
        this.currentEditingId = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPasswords();
    }

    bindEvents() {
        // 搜索
        document.getElementById('search').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterPasswords();
        });

        // 分类
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectedCategory = item.dataset.category;
                this.updateCategories();
                this.filterPasswords();
            });
        });

        // 添加密码
        document.getElementById('addPassword').addEventListener('click', () => {
            this.openPasswordModal();
        });

        document.getElementById('addPasswordToolbar').addEventListener('click', () => {
            this.openPasswordModal();
        });

        // 编辑密码
        document.getElementById('editPassword').addEventListener('click', () => {
            this.editSelectedPassword();
        });

        // 删除密码
        document.getElementById('deletePassword').addEventListener('click', () => {
            this.deleteSelectedPassword();
        });

        // 刷新
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadPasswords();
        });

        // 生成密码
        document.getElementById('generatePassword').addEventListener('click', () => {
            this.openGeneratorModal();
        });

        // 导出
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // 导入
        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });

        // 设置
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showToast('设置功能开发中...');
        });

        // 模态框
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal('passwordModal');
        });

        document.getElementById('cancelModal').addEventListener('click', () => {
            this.closeModal('passwordModal');
        });

        document.getElementById('savePassword').addEventListener('click', () => {
            this.savePassword();
        });

        // 生成器模态框
        document.getElementById('closeGenerator').addEventListener('click', () => {
            this.closeModal('generatorModal');
        });

        document.getElementById('cancelGenerator').addEventListener('click', () => {
            this.closeModal('generatorModal');
        });

        document.getElementById('regenerate').addEventListener('click', () => {
            this.generatePassword();
        });

        document.getElementById('copyGenerated').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('generatedPassword').value);
        });

        // 切换密码显示
        document.getElementById('togglePassword').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // 内联生成密码
        document.getElementById('generateInlinePassword').addEventListener('click', () => {
            const password = this.generateRandomPassword();
            document.getElementById('passwordInput').value = password;
        });

        // �认对话框
        document.getElementById('closeConfirm').addEventListener('click', () => {
            this.closeModal('confirmModal');
        });

        document.getElementById('cancelConfirm').addEventListener('click', () => {
            this.closeModal('confirmModal');
        });

        document.getElementById('confirmAction').addEventListener('click', () => {
            this.executeConfirmAction();
        });
    }

    async loadPasswords() {
        this.showLoading();

        try {
            const passwords = await invoke('list_passwords');
            this.passwords = JSON.parse(passwords);

            this.filterPasswords();
            this.updateStats();
            this.showToast('密码列表已加载');
        } catch (error) {
            console.error('加载密码失败:', error);
            this.showToast('加载密码失败');
        } finally {
            this.hideLoading();
        }
    }

    filterPasswords() {
        let filtered = this.passwords;

        // 按分类过滤
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.selectedCategory);
        }

        // 按搜索词过滤
        if (this.searchQuery) {
            filtered = filtered.filter(p => {
                return (
                    p.title.toLowerCase().includes(this.searchQuery) ||
                    p.username.toLowerCase().includes(this.searchQuery) ||
                    (p.website && p.website.toLowerCase().includes(this.searchQuery))
                );
            });
        }

        this.renderPasswords(filtered);
    }

    renderPasswords(passwords) {
        const list = document.getElementById('passwordList');
        list.innerHTML = '';

        passwords.forEach(password => {
            const item = document.createElement('div');
            item.className = 'password-item';
            item.dataset.id = password.id;
            item.innerHTML = `
                <div class="icon">${password.title.charAt(0).toUpperCase()}</div>
                <div class="content">
                    <div class="title">${this.escapeHtml(password.title)}</div>
                    <div class="username">${this.escapeHtml(password.username)}</div>
                </div>
                <div class="actions">
                    <button class="action-icon" title="复制用户名" onclick="event.stopPropagation(); app.copyToClipboard('${this.escapeHtml(password.username)}')">👤</button>
                    <button class="action-icon" title="复制密码" onclick="event.stopPropagation(); app.copyToClipboard('${this.escapeHtml(password.password)}')">🔑</button>
                    ${password.website ? `<button class="action-icon" title="打开网站" onclick="event.stopPropagation(); app.openWebsite('${this.escapeHtml(password.website)}')">🌐</button>` : ''}
                    <button class="action-icon" title="编辑" onclick="event.stopPropagation(); app.editPassword('${this.escapeHtml(password.id)}')">✏️</button>
                </div>
            `;

            // 双击编辑
            item.addEventListener('dblclick', () => {
                this.editPassword(password.id);
            });

            list.appendChild(item);
        });

        document.getElementById('passwordCount').textContent = `${passwords.length} 个密码`;
    }

    async openPasswordModal() {
        this.currentEditingId = null;
        document.getElementById('modalTitle').textContent = '添加密码';
        document.getElementById('passwordForm').reset();
        document.getElementById('savePassword').textContent = '保存';
        this.openModal('passwordModal');
    }

    async editPassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (!password) return;

        this.currentEditingId = id;
        document.getElementById('modalTitle').textContent = '编辑密码';
        document.getElementById('savePassword').textContent = '更新';

        document.getElementById('titleInput').value = password.title;
        document.getElementById('usernameInput').value = password.username;
        document.getElementById('passwordInput').value = password.password;
        document.getElementById('websiteInput').value = password.website || '';
        document.getElementById('notesInput').value = password.notes || '';
        document.getElementById('categorySelect').value = password.category || 'other';

        this.openModal('passwordModal');
    }

    async savePassword() {
        const title = document.getElementById('titleInput').value.trim();
        const username = document.getElementById('usernameInput').value.trim();
        const password = document.getElementById('passwordInput').value.trim();
        const website = document.getElementById('websiteInput').value.trim();
        const notes = document.getElementById('notesInput').value.trim();
        const category = document.getElementById('categorySelect').value;

        if (!title) {
            this.showToast('标题不能为空', 'error');
            return;
        }

        if (!password) {
            this.showToast('密码不能为空', 'error');
            return;
        }

        try {
            if (this.currentEditingId) {
                // 更新
                await invoke('update_password', {
                    id: this.currentEditingId,
                    title,
                    username,
                    password,
                    website,
                    notes,
                    category
                });

                this.showToast('密码已更新');
            } else {
                // 添加
                await invoke('add_password', {
                    title,
                    username,
                    password,
                    website,
                    notes,
                    category
                });

                this.showToast('密码已添加');
            }

            this.closeModal('passwordModal');
            this.loadPasswords();
        } catch (error) {
            console.error('保存密码失败:', error);
            this.showToast('保存密码失败', 'error');
        }
    }

    async editSelectedPassword() {
        const selected = document.querySelector('.password-item.selected');
        if (!selected) {
            this.showToast('请先选择一个密码', 'warning');
            return;
        }

        this.editPassword(selected.dataset.id);
    }

    async deleteSelectedPassword() {
        const selected = document.querySelector('.password-item.selected');
        if (!selected) {
            this.showToast('请先选择一个密码', 'warning');
            return;
        }

        const password = this.passwords.find(p => p.id === selected.dataset.id);
        if (!password) return;

        this.confirmAction(`确定要删除 "${password.title}" 吗？`, async () => {
            try {
                await invoke('delete_password', password.id);
                this.showToast('密码已删除');
                this.loadPasswords();
            } catch (error) {
                console.error('删除密码失败:', error);
                this.showToast('删除密码失败', 'error');
            }
        });
    }

    async editPassword(id) {
        // 编辑密码已在 openPasswordModal 中实现
    }

    updateCategories() {
        document.querySelectorAll('.category-item').forEach(item => {
            const category = item.dataset.category;
            const isActive = category === this.selectedCategory;

            if (isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }

            // 更新计数
            const count = category === 'all' ?
                this.passwords.length :
                this.passwords.filter(p => p.category === category).length;

            item.querySelector('.count').textContent = count;
        });
    }

    updateStats() {
        document.getElementById('totalPasswords').textContent = `总计: ${this.passwords.length} 个密码`;
    }

    async openGeneratorModal() {
        this.generatePassword();
        this.openModal('generatorModal');
    }

    async generatePassword() {
        const length = parseInt(document.getElementById('lengthInput').value) || 16;
        const uppercase = document.getElementById('uppercase').checked;
        const lowercase = document.getElementById('lowercase').checked;
        const numbers = document.getElementById('numbers').checked;
        const symbols = document.getElementById('symbols').checked;

        try {
            const password = await invoke('generate_password', {
                length,
                uppercase,
                lowercase,
                numbers,
                symbols
            });

            document.getElementById('generatedPassword').value = password;
        } catch (error) {
            console.error('生成密码失败:', error);
            this.showToast('生成密码失败', 'error');
        }
    }

    generateRandomPassword() {
        const length = 16;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password;
    }

    async exportData() {
        try {
            // 创建文件选择器
            const path = await save({
                defaultPath: 'passwords.json',
                filters: [{ name: 'JSON', extensions: ['json'] }]
            });

            if (path) {
                await invoke('export_passwords', path);
                this.showToast('数据已导出');
            }
        } catch (error) {
            console.error('导出失败:', error);
            this.showToast('导出失败', 'error');
        }
    }

    async importData() {
        try {
            const path = await open({
                multiple: false,
                filters: [{ name: 'JSON', extensions: ['json'] }]
            });

            if (path) {
                this.showLoading();

                await invoke('import_passwords', path);
                this.showToast('数据已导入');
                this.loadPasswords();
            }
        } catch (error) {
            console.error('导入失败:', error);
            this.hideLoading();
            this.showToast('导入失败', 'error');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            this.showToast('复制失败', 'error');
        });
    }

    openWebsite(url) {
        window.open(url, '_blank');
    }

    togglePasswordVisibility() {
        const input = document.getElementById('passwordInput');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
    }

    // 模态框管理
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // 残认对话框
    confirmAction(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        this.confirmCallback = callback;

        this.openModal('confirmModal');
    }

    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.closeModal('confirmModal');
    }

    // Toast 通知
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;

        toast.classList.remove('show');

        // 稍后显示
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // 加载遮罩
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    // 工具方法
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
const app = new PasswordManager();

// 导出到全局
window.app = app;
