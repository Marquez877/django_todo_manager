/**
 * AJAX utilities for TODO Manager
 * Handles all AJAX requests and dynamic content loading
 */

class AjaxManager {
    constructor() {
        this.csrfToken = this.getCSRFToken();
        this.init();
    }

    init() {
        this.setupDefaults();
        this.bindEvents();
    }

    getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                     document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                     document.querySelector('input[name="csrfmiddlewaretoken"]')?.value;
        return token;
    }

    setupDefaults() {
        // Set default headers for all fetch requests
        const originalFetch = window.fetch;
        window.fetch = (url, options = {}) => {
            options.headers = {
                'X-CSRFToken': this.csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            };
            return originalFetch(url, options);
        };
    }

    bindEvents() {
        // Bind AJAX forms
        this.bindAjaxForms();
        
        // Bind dynamic content loading
        this.bindDynamicLoaders();
    }

    bindAjaxForms() {
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('ajax-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
    }

    bindDynamicLoaders() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ajax-loader')) {
                e.preventDefault();
                this.loadContent(e.target.href, e.target.dataset.target);
            }
        });
    }

    async handleFormSubmit(form) {
        try {
            this.showLoading(form);
            
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData
            });

            const data = await response.json();
            
            this.hideLoading(form);
            
            if (data.success) {
                this.handleSuccess(data, form);
            } else {
                this.handleError(data, form);
            }
        } catch (error) {
            this.hideLoading(form);
            this.handleError({ message: 'Произошла ошибка при отправке формы' }, form);
            console.error('Form submission error:', error);
        }
    }

    async loadContent(url, targetSelector) {
        try {
            const target = document.querySelector(targetSelector);
            if (!target) return;

            this.showLoading(target);
            
            const response = await fetch(url);
            const html = await response.text();
            
            target.innerHTML = html;
            this.hideLoading(target);
            
            // Re-initialize components in loaded content
            this.initializeLoadedContent(target);
            
        } catch (error) {
            this.hideLoading(target);
            console.error('Content loading error:', error);
        }
    }

    handleSuccess(data, form) {
        // Show success message
        if (data.message) {
            showNotification(data.message, 'success');
        }

        // Handle redirect
        if (data.redirect) {
            window.location.href = data.redirect;
            return;
        }

        // Handle form reset
        if (data.reset_form) {
            form.reset();
        }

        // Handle modal close
        if (data.close_modal) {
            const modal = form.closest('.modal');
            if (modal) {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }

        // Handle content update
        if (data.update_content) {
            this.updateContent(data.update_content);
        }

        // Handle todo list refresh
        if (data.refresh_todos) {
            this.refreshTodoList();
        }

        // Handle category list refresh
        if (data.refresh_categories) {
            this.refreshCategoryList();
        }
    }

    handleError(data, form) {
        // Show error message
        if (data.message) {
            showNotification(data.message, 'error');
        }

        // Handle form errors
        if (data.errors) {
            this.displayFormErrors(form, data.errors);
        }
    }

    displayFormErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('is-invalid');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message invalid-feedback';
                errorDiv.textContent = errors[fieldName].join(', ');
                
                field.parentNode.appendChild(errorDiv);
            }
        });
    }

    updateContent(updates) {
        Object.keys(updates).forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = updates[selector];
                this.initializeLoadedContent(element);
            }
        });
    }

    async refreshTodoList() {
        try {
            const response = await fetch('/ajax/todos/');
            const data = await response.json();
            
            if (data.success) {
                const todoContainer = document.querySelector('.todos-container');
                if (todoContainer) {
                    todoContainer.innerHTML = data.html;
                    this.initializeLoadedContent(todoContainer);
                    updateCounters();
                }
            }
        } catch (error) {
            console.error('Error refreshing todo list:', error);
        }
    }

    async refreshCategoryList() {
        try {
            const response = await fetch('/ajax/categories/');
            const data = await response.json();
            
            if (data.success) {
                // Update category filter dropdown
                const categoryFilter = document.querySelector('#categoryFilter');
                if (categoryFilter && data.categories) {
                    this.updateCategoryOptions(categoryFilter, data.categories);
                }
                
                // Update category list page if present
                const categoryContainer = document.querySelector('.categories-container');
                if (categoryContainer && data.html) {
                    categoryContainer.innerHTML = data.html;
                    this.initializeLoadedContent(categoryContainer);
                }
            }
        } catch (error) {
            console.error('Error refreshing category list:', error);
        }
    }

    updateCategoryOptions(select, categories) {
        // Keep the first option (All categories)
        const firstOption = select.querySelector('option[value="all"]');
        select.innerHTML = '';
        
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    initializeLoadedContent(container) {
        // Re-initialize tooltips
        const tooltips = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(element => {
            new bootstrap.Tooltip(element);
        });

        // Re-initialize other components as needed
        // This could include date pickers, select2, etc.
    }

    showLoading(element) {
        // Add loading class
        element.classList.add('loading');
        
        // Disable form elements
        if (element.tagName === 'FORM') {
            const inputs = element.querySelectorAll('input, button, select, textarea');
            inputs.forEach(input => {
                input.disabled = true;
            });
        }
        
        // Show loading spinner
        const loadingSpinner = element.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }

    hideLoading(element) {
        // Remove loading class
        element.classList.remove('loading');
        
        // Enable form elements
        if (element.tagName === 'FORM') {
            const inputs = element.querySelectorAll('input, button, select, textarea');
            inputs.forEach(input => {
                input.disabled = false;
            });
        }
        
        // Hide loading spinner
        const loadingSpinner = element.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
}

// Quick action functions
async function quickToggleTodo(todoId, checkbox) {
    try {
        const formData = new FormData();
        formData.append('done', checkbox.checked);
        
        const response = await fetch(`/todo/${todoId}/toggle/`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            const todoItem = checkbox.closest('.todo-item');
            todoItem.classList.toggle('completed', checkbox.checked);
            
            // Animate the change
            todoItem.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                todoItem.style.animation = '';
            }, 500);
            
            updateCounters();
            showNotification(data.message, 'success');
        } else {
            checkbox.checked = !checkbox.checked; // Revert
            showNotification(data.message || 'Произошла ошибка', 'error');
        }
    } catch (error) {
        checkbox.checked = !checkbox.checked; // Revert
        showNotification('Произошла ошибка при обновлении задачи', 'error');
        console.error('Toggle error:', error);
    }
}

async function quickDeleteTodo(todoId, button) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        const response = await fetch(`/todo/${todoId}/delete/`, {
            method: 'POST'
        });

        const data = await response.json();
        
        if (data.success) {
            const todoItem = button.closest('.todo-item');
            
            // Animate removal
            todoItem.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => {
                todoItem.remove();
                updateCounters();
                updateEmptyState();
            }, 300);
            
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || 'Произошла ошибка', 'error');
        }
    } catch (error) {
        showNotification('Произошла ошибка при удалении задачи', 'error');
        console.error('Delete error:', error);
    }
}

async function quickCreateTodo() {
    const quickInput = document.querySelector('#quickTodoInput');
    if (!quickInput || !quickInput.value.trim()) return;
    
    try {
        const formData = new FormData();
        formData.append('title', quickInput.value.trim());
        formData.append('quick_create', 'true');
        
        const response = await fetch('/todo/create/', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            quickInput.value = '';
            showNotification(data.message, 'success');
            
            // Refresh todo list
            ajaxManager.refreshTodoList();
        } else {
            showNotification(data.message || 'Произошла ошибка', 'error');
        }
    } catch (error) {
        showNotification('Произошла ошибка при создании задачи', 'error');
        console.error('Quick create error:', error);
    }
}

// Auto-save functionality
class AutoSave {
    constructor() {
        this.saveDelay = 2000; // 2 seconds
        this.timeouts = new Map();
    }

    register(formSelector) {
        const form = document.querySelector(formSelector);
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.scheduleAutoSave(form);
            });
        });
    }

    scheduleAutoSave(form) {
        const formId = form.id || form.action;
        
        // Clear existing timeout
        if (this.timeouts.has(formId)) {
            clearTimeout(this.timeouts.get(formId));
        }
        
        // Set new timeout
        const timeout = setTimeout(() => {
            this.performAutoSave(form);
        }, this.saveDelay);
        
        this.timeouts.set(formId, timeout);
    }

    async performAutoSave(form) {
        try {
            const formData = new FormData(form);
            formData.append('auto_save', 'true');
            
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAutoSaveIndicator(form, true);
            } else {
                this.showAutoSaveIndicator(form, false);
            }
        } catch (error) {
            this.showAutoSaveIndicator(form, false);
            console.error('Auto-save error:', error);
        }
    }

    showAutoSaveIndicator(form, success) {
        let indicator = form.querySelector('.auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            form.appendChild(indicator);
        }
        
        indicator.className = `auto-save-indicator ${success ? 'success' : 'error'}`;
        indicator.innerHTML = success ? 
            '<i class="fas fa-check"></i> Сохранено' : 
            '<i class="fas fa-exclamation-triangle"></i> Ошибка сохранения';
        
        // Hide after 3 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.opacity = '1';
                indicator.innerHTML = '';
            }, 2000);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AJAX manager
    window.ajaxManager = new AjaxManager();
    
    // Initialize auto-save
    window.autoSave = new AutoSave();
    
    // Register forms for auto-save
    autoSave.register('#editTodoForm');
    autoSave.register('#editCategoryForm');
});

// Export functions for global access
window.quickToggleTodo = quickToggleTodo;
window.quickDeleteTodo = quickDeleteTodo;
window.quickCreateTodo = quickCreateTodo;
