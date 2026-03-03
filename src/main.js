// Main application code
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
        // Search
        const searchEl = document.getElementById('search');
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterPasswords();
            });
        }

        // Categories
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectedCategory = item.dataset.category;
                this.updateCategories();
                this.filterPasswords();
            });
        });

        // Add password
        const addPwdEl = document.getElementById('addPassword');
        const addPwdToolbarEl = document.getElementById('addPasswordToolbar');
        if (addPwdEl) addPwdEl.addEventListener('click', () => this.openPasswordModal());
        if (addPwdToolbarEl) addPwdToolbarEl.addEventListener('click', () => this.openPasswordModal());

        // Edit password
        const editPwdEl = document.getElementById('editPassword');
        if (editPwdEl) editPwdEl.addEventListener('click', () => this.editSelectedPassword());

        // Delete password
        const delPwdEl = document.getElementById('deletePassword');
        if (delPwdEl) delPwdEl.addEventListener('click', () => this.deleteSelectedPassword());

        // Refresh
        const refreshEl = document.getElementById('refreshBtn');
        if (refreshEl) refreshEl.addEventListener('click', () => this.loadPasswords());

        // Generate password
        const genPwdEl = document.getElementById('generatePassword');
        if (genPwdEl) genPwdEl.addEventListener('click', () => this.openGeneratorModal());

        // Export
        const exportEl = document.getElementById('exportBtn');
        if (exportEl) exportEl.addEventListener('click', () => this.exportData());

        // Import
        const importEl = document.getElementById('importBtn');
        if (importEl) importEl.addEventListener('click', () => this.importData());

        // Settings
        const settingsEl = document.getElementById('settingsBtn');
        if (settingsEl) settingsEl.addEventListener('click', () => this.showToast('设置功能开发中...'));

        // Password modal
        const closeModalEl = document.getElementById('closeModal');
        const cancelModalEl = document.getElementById('cancelModal');
        const savePwdEl = document.getElementById('savePassword');
        if (closeModalEl) closeModalEl.addEventListener('click', () => this.closeModal('passwordModal'));
        if (cancelModalEl) cancelModalEl.addEventListener('click', () => this.closeModal('passwordModal'));
        if (savePwdEl) savePwdEl.addEventListener('click', () => this.savePassword());

        // Generator modal
        const closeGenEl = document.getElementById('closeGenerator');
        const cancelGenEl = document.getElementById('cancelGenerator');
        const regenEl = document.getElementById('regenerate');
        const copyGenEl = document.getElementById('copyGenerated');
        const lengthInputEl = document.getElementById('lengthInput');
        if (closeGenEl) closeGenEl.addEventListener('click', () => this.closeModal('generatorModal'));
        if (cancelGenEl) cancelGenEl.addEventListener('click', () => this.closeModal('generatorModal'));
        if (regenEl) regenEl.addEventListener('click', () => this.generatePassword());
        if (copyGenEl) copyGenEl.addEventListener('click', () => this.copyToClipboard(document.getElementById('generatedPassword')?.value || ''));
        if (lengthInputEl) {
            lengthInputEl.addEventListener('input', (e) => {
                const lengthValueEl = document.getElementById('lengthValue');
                if (lengthValueEl) lengthValueEl.textContent = e.target.value;
            });
        }

        // Toggle password visibility
        const togglePwdEl = document.getElementById('togglePassword');
        if (togglePwdEl) togglePwdEl.addEventListener('click', () => this.togglePasswordVisibility());

        // Inline generate password
        const inlineGenEl = document.getElementById('generateInlinePassword');
        if (inlineGenEl) {
            inlineGenEl.addEventListener('click', () => {
                const password = this.generateRandomPassword();
                const pwdInputEl = document.getElementById('passwordInput');
                if (pwdInputEl) pwdInputEl.value = password;
            });
        }

        // Confirm dialog
        const closeConfirmEl = document.getElementById('closeConfirm');
        const cancelConfirmEl = document.getElementById('cancelConfirm');
        const confirmActionEl = document.getElementById('confirmAction');
        if (closeConfirmEl) closeConfirmEl.addEventListener('click', () => this.closeModal('confirmModal'));
        if (cancelConfirmEl) cancelConfirmEl.addEventListener('click', () => this.closeModal('confirmModal'));
        if (confirmActionEl) confirmActionEl.addEventListener('click', () => this.executeConfirmAction());
    }

    async loadPasswords() {
        this.showLoading();

        try {
            // Try to invoke Tauri command
            const passwords = window.__TAURI__?.core?.invoke ? 
                await window.__TAURI__.core.invoke('list_passwords') : 
                '[]';
            
            this.passwords = Array.isArray(passwords) ? passwords : JSON.parse(passwords || '[]');

            this.filterPasswords();
            this.updateStats();
            this.showToast('密码列表已加载');
        } catch (error) {
            console.error('加载密码失败:', error);
            this.passwords = [];
            this.filterPasswords();
            this.showToast('加载密码失败，使用空列表');
        } finally {
            this.hideLoading();
        }
    }

    filterPasswords() {
        let filtered = this.passwords;

        // Filter by category
        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.selectedCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            filtered = filtered.filter(p => {
                return (
                    (p.title && p.title.toLowerCase().includes(this.searchQuery)) ||
                    (p.username && p.username.toLowerCase().includes(this.searchQuery)) ||
                    (p.website && p.website.toLowerCase().includes(this.searchQuery))
                );
            });
        }

        this.renderPasswords(filtered);
    }

    renderPasswords(passwords) {
        const listEl = document.getElementById('passwordList');
        if (!listEl) return;

        listEl.innerHTML = '';

        passwords.forEach(password => {
            const item = document.createElement('div');
            item.className = 'password-item';
            item.dataset.id = password.id;
            item.innerHTML = `
                <div class="icon">${password.title ? password.title.charAt(0).toUpperCase() : '?'}</div>
                <div class="content">
                    <div class="title">${this.escapeHtml(password.title)}</div>
                    <div class="username">${this.escapeHtml(password.username)}</div>
                </div>
                <div class="actions">
                    <button class="action-icon" title="复制用户名" data-action="copy-username" data-value="${this.escapeHtml(password.username)}">👤</button>
                    <button class="action-icon" title="复制密码" data-action="copy-password" data-value="${this.escapeHtml(password.password)}">🔑</button>
                    ${password.website ? `<button class="action-icon" title="打开网站" data-action="open-website" data-value="${this.escapeHtml(password.website)}">🌐</button>` : ''}
                    <button class="action-icon" title="编辑" data-action="edit-password" data-id="${this.escapeHtml(password.id)}">✏️</button>
                </div>
            `;

            // Action buttons
            item.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    switch (action) {
                        case 'copy-username':
                            this.copyToClipboard(btn.dataset.value || '');
                            break;
                        case 'copy-password':
                            this.copyToClipboard(btn.dataset.value || '');
                            break;
                        case 'open-website':
                            this.openWebsite(btn.dataset.value || '');
                            break;
                        case 'edit-password':
                            this.editPassword(btn.dataset.id || '');
                            break;
                    }
                });
            });

            // Double click to edit
            item.addEventListener('dblclick', () => {
                this.editPassword(password.id);
            });

            listEl.appendChild(item);
        });

        const countEl = document.getElementById('passwordCount');
        if (countEl) countEl.textContent = `${passwords.length} 个密码`;
    }

    async openPasswordModal() {
        this.currentEditingId = null;
        const modalTitleEl = document.getElementById('modalTitle');
        const savePwdEl = document.getElementById('savePassword');
        const formEl = document.getElementById('passwordForm');

        if (modalTitleEl) modalTitleEl.textContent = '添加密码';
        if (savePwdEl) savePwdEl.textContent = '保存';
        if (formEl) formEl.reset();

        this.openModal('passwordModal');
    }

    async editPassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (!password) return;

        this.currentEditingId = id;
        const modalTitleEl = document.getElementById('modalTitle');
        const savePwdEl = document.getElementById('savePassword');

        if (modalTitleEl) modalTitleEl.textContent = '编辑密码';
        if (savePwdEl) savePwdEl.textContent = '更新';

        const titleInputEl = document.getElementById('titleInput');
        const usernameInputEl = document.getElementById('usernameInput');
        const passwordInputEl = document.getElementById('passwordInput');
        const websiteInputEl = document.getElementById('websiteInput');
        const notesInputEl = document.getElementById('notesInput');
        const categorySelectEl = document.getElementById('categorySelect');

        if (titleInputEl) titleInputEl.value = password.title || '';
        if (usernameInputEl) usernameInputEl.value = password.username || '';
        if (passwordInputEl) passwordInputEl.value = password.password || '';
        if (websiteInputEl) websiteInputEl.value = password.website || '';
        if (notesInputEl) notesInputEl.value = password.notes || '';
        if (categorySelectEl) categorySelectEl.value = password.category || 'other';

        this.openModal('passwordModal');
    }

    async savePassword() {
        const titleInputEl = document.getElementById('titleInput');
        const usernameInputEl = document.getElementById('usernameInput');
        const passwordInputEl = document.getElementById('passwordInput');
        const websiteInputEl = document.getElementById('websiteInput');
        const notesInputEl = document.getElementById('notesInput');
        const categorySelectEl = document.getElementById('categorySelect');

        const title = titleInputEl?.value.trim() || '';
        const username = usernameInputEl?.value.trim() || '';
        const password = passwordInputEl?.value.trim() || '';
        const website = websiteInputEl?.value.trim() || '';
        const notes = notesInputEl?.value.trim() || '';
        const category = categorySelectEl?.value || 'other';

        if (!title) {
            this.showToast('标题不能为空', 'error');
            return;
        }

        if (!password) {
            this.showToast('密码不能为空', 'error');
            return;
        }

        try {
            if (window.__TAURI__?.core?.invoke) {
                if (this.currentEditingId) {
                    await window.__TAURI__.core.invoke('update_password', {
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
                    await window.__TAURI__.core.invoke('add_password', {
                        title,
                        username,
                        password,
                        website,
                        notes,
                        category
                    });
                    this.showToast('密码已添加');
                }
            } else {
                this.showToast('演示模式 - 未实际保存', 'warning');
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
                if (window.__TAURI__?.core?.invoke) {
                    await window.__TAURI__.core.invoke('delete_password', password.id);
                    this.showToast('密码已删除');
                } else {
                    this.showToast('演示模式 - 未实际删除', 'warning');
                }
                this.loadPasswords();
            } catch (error) {
                console.error('删除密码失败:', error);
                this.showToast('删除密码失败', 'error');
            }
        });
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

            // Update count
            const count = category === 'all' ?
                this.passwords.length :
                this.passwords.filter(p => p.category === category).length;

            const countEl = item.querySelector('.count');
            if (countEl) countEl.textContent = count;
        });
    }

    updateStats() {
        const statsEl = document.getElementById('totalPasswords');
        if (statsEl) statsEl.textContent = `总计: ${this.passwords.length} 个密码`;
    }

    async openGeneratorModal() {
        this.generatePassword();
        this.openModal('generatorModal');
    }

    async generatePassword() {
        const lengthInputEl = document.getElementById('lengthInput');
        const uppercaseEl = document.getElementById('uppercase');
        const lowercaseEl = document.getElementById('lowercase');
        const numbersEl = document.getElementById('numbers');
        const symbolsEl = document.getElementById('symbols');
        const generatedPwdEl = document.getElementById('generatedPassword');

        const length = parseInt(lengthInputEl?.value || '16', 10);
        const uppercase = uppercaseEl?.checked || false;
        const lowercase = lowercaseEl?.checked || false;
        const numbers = numbersEl?.checked || false;
        const symbols = symbolsEl?.checked || false;

        try {
            if (window.__TAURI__?.core?.invoke) {
                const password = await window.__TAURI__.core.invoke('generate_password', {
                    length,
                    uppercase,
                    lowercase,
                    numbers,
                    symbols
                });

                if (generatedPwdEl) generatedPwdEl.value = password;
            } else {
                if (generatedPwdEl) generatedPwdEl.value = this.generateRandomPassword();
            }
        } catch (error) {
            console.error('生成密码失败:', error);
            if (generatedPwdEl) generatedPwdEl.value = this.generateRandomPassword();
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
            if (window.__TAURI__?.dialog?.save && window.__TAURI__?.core?.invoke) {
                const path = await window.__TAURI__.dialog.save({
                    defaultPath: 'passwords.json',
                    filters: [{ name: 'JSON', extensions: ['json'] }]
                });

                if (path) {
                    await window.__TAURI__.core.invoke('export_passwords', path);
                    this.showToast('数据已导出');
                }
            } else {
                this.showToast('导出功能仅在桌面应用中可用', 'warning');
            }
        } catch (error) {
            console.error('导出失败:', error);
            this.showToast('导出失败', 'error');
        }
    }

    async importData() {
        try {
            if (window.__TAURI__?.dialog?.open && window.__TAURI__?.core?.invoke) {
                const path = await window.__TAURI__.dialog.open({
                    multiple: false,
                    filters: [{ name: 'JSON', extensions: ['json'] }]
                });

                if (path) {
                    this.showLoading();

                    await window.__TAURI__.core.invoke('import_passwords', path);
                    this.showToast('数据已导入');
                    this.loadPasswords();
                }
            } else {
                this.showToast('导入功能仅在桌面应用中可用', 'warning');
            }
        } catch (error) {
            console.error('导入失败:', error);
            this.hideLoading();
            this.showToast('导入失败', 'error');
        }
    }

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                this.showToast('已复制到剪贴板');
            } else {
                // Fallback
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast('已复制到剪贴板');
            }
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败', 'error');
        }
    }

    openWebsite(url) {
        window.open(url, '_blank');
    }

    togglePasswordVisibility() {
        const pwdInputEl = document.getElementById('passwordInput');
        if (pwdInputEl) {
            const type = pwdInputEl.getAttribute('type') === 'password' ? 'text' : 'password';
            pwdInputEl.setAttribute('type', type);
        }
    }

    // Modal management
    openModal(modalId) {
        const modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.classList.add('active');
    }

    closeModal(modalId) {
        const modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.classList.remove('active');
    }

    // Confirm dialog
    confirmAction(message, callback) {
        const confirmMsgEl = document.getElementById('confirmMessage');
        if (confirmMsgEl) confirmMsgEl.textContent = message;
        this.confirmCallback = callback;

        this.openModal('confirmModal');
    }

    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.closeModal('confirmModal');
    }

    // Toast notification
    showToast(message, type = 'info') {
        const toastEl = document.getElementById('toast');
        if (!toastEl) return;

        toastEl.textContent = message;
        toastEl.classList.remove('show');

        setTimeout(() => {
            toastEl.classList.add('show');
        }, 10);

        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    }

    // Loading overlay
    showLoading() {
        const loadingEl = document.getElementById('loadingOverlay');
        if (loadingEl) loadingEl.classList.add('active');
    }

    hideLoading() {
        const loadingEl = document.getElementById('loadingOverlay');
        if (loadingEl) loadingEl.classList.remove('active');
    }

    // Utility methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PasswordManager();
    window.app = app;
});
