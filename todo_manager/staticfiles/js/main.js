/**
 * Main JavaScript file for TODO Manager
 * Contains all interactive functionality
 */

// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let currentFilter = 'all';
let currentSort = 'created_at';
let currentOrder = 'desc';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeTooltips();
    initializeModals();
    initializeFilters();
    initializeSorting();
    initializeAjax();
    initializeAnimations();
    initializeKeyboardShortcuts();
    loadTodos();
});

// Theme Management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    
    // Animate theme transition
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Modals
function initializeModals() {
    // Auto-focus first input in modals
    document.addEventListener('shown.bs.modal', function (event) {
        const modal = event.target;
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    });
}

// Filters
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            setActiveFilter(filter);
            applyFilters();
        });
    });
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', applyFilters);
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    const dueDateFilter = document.getElementById('dueDateFilter');
    if (dueDateFilter) {
        dueDateFilter.addEventListener('change', applyFilters);
    }
}

function setActiveFilter(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
}

function applyFilters() {
    const todos = document.querySelectorAll('.todo-item');
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const priorityFilter = document.getElementById('priorityFilter')?.value;
    const statusFilter = document.getElementById('statusFilter')?.value;
    const dueDateFilter = document.getElementById('dueDateFilter')?.value;
    
    let visibleCount = 0;
    
    todos.forEach(todo => {
        let shouldShow = true;
        
        // Main filter (all, completed, pending, overdue)
        if (currentFilter === 'completed' && !todo.classList.contains('completed')) {
            shouldShow = false;
        } else if (currentFilter === 'pending' && todo.classList.contains('completed')) {
            shouldShow = false;
        } else if (currentFilter === 'overdue' && !todo.classList.contains('overdue')) {
            shouldShow = false;
        }
        
        // Category filter
        if (categoryFilter && categoryFilter !== 'all' && 
            todo.dataset.category !== categoryFilter) {
            shouldShow = false;
        }
        
        // Priority filter
        if (priorityFilter && priorityFilter !== 'all' && 
            todo.dataset.priority !== priorityFilter) {
            shouldShow = false;
        }
        
        // Status filter
        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'completed' && !todo.classList.contains('completed')) {
                shouldShow = false;
            } else if (statusFilter === 'pending' && todo.classList.contains('completed')) {
                shouldShow = false;
            }
        }
        
        // Due date filter
        if (dueDateFilter && dueDateFilter !== 'all') {
            const dueDate = todo.dataset.dueDate;
            const today = new Date();
            const todoDate = new Date(dueDate);
            
            if (dueDateFilter === 'today' && !isToday(todoDate)) {
                shouldShow = false;
            } else if (dueDateFilter === 'week' && !isThisWeek(todoDate)) {
                shouldShow = false;
            } else if (dueDateFilter === 'overdue' && todoDate >= today) {
                shouldShow = false;
            }
        }
        
        // Apply visibility
        if (shouldShow) {
            todo.style.display = 'block';
            todo.style.animation = 'slideInFromLeft 0.3s ease';
            visibleCount++;
        } else {
            todo.style.display = 'none';
        }
    });
    
    // Update empty state
    updateEmptyState(visibleCount);
    
    // Update counters
    updateCounters();
}

// Sorting
function initializeSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const [field, order] = this.value.split('-');
            currentSort = field;
            currentOrder = order;
            applySorting();
        });
    }
}

function applySorting() {
    const todoContainer = document.querySelector('.todos-container');
    if (!todoContainer) return;
    
    const todos = Array.from(todoContainer.querySelectorAll('.todo-item'));
    
    todos.sort((a, b) => {
        let aValue, bValue;
        
        switch (currentSort) {
            case 'title':
                aValue = a.querySelector('.todo-title').textContent.toLowerCase();
                bValue = b.querySelector('.todo-title').textContent.toLowerCase();
                break;
            case 'priority':
                aValue = parseInt(a.dataset.priority);
                bValue = parseInt(b.dataset.priority);
                break;
            case 'due_date':
                aValue = new Date(a.dataset.dueDate || '9999-12-31');
                bValue = new Date(b.dataset.dueDate || '9999-12-31');
                break;
            case 'created_at':
            default:
                aValue = new Date(a.dataset.createdAt);
                bValue = new Date(b.dataset.createdAt);
                break;
        }
        
        if (currentOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // Re-append sorted elements
    todos.forEach(todo => {
        todoContainer.appendChild(todo);
    });
}

// AJAX Operations
function initializeAjax() {
    // Setup CSRF token for AJAX requests
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    if (csrfToken) {
        setupAjaxCSRF(csrfToken);
    }
}

function setupAjaxCSRF(token) {
    // Set up CSRF token for all AJAX requests
    const xhr = new XMLHttpRequest();
    const originalSetRequestHeader = xhr.setRequestHeader;
    
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        if (header === 'X-CSRFToken' || header === 'X-Requested-With') {
            originalSetRequestHeader.call(this, header, value);
        } else {
            originalSetRequestHeader.call(this, header, value);
        }
        
        if (this.readyState === XMLHttpRequest.OPENED) {
            originalSetRequestHeader.call(this, 'X-CSRFToken', token);
            originalSetRequestHeader.call(this, 'X-Requested-With', 'XMLHttpRequest');
        }
    };
}

// Quick actions
function toggleTodoComplete(todoId, checkbox) {
    const formData = new FormData();
    formData.append('done', checkbox.checked);
    formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
    
    fetch(`/todo/${todoId}/toggle/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
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
            checkbox.checked = !checkbox.checked; // Revert checkbox
            showNotification(data.message || 'Произошла ошибка', 'error');
        }
    })
    .catch(error => {
        checkbox.checked = !checkbox.checked; // Revert checkbox
        showNotification('Произошла ошибка при обновлении задачи', 'error');
        console.error('Error:', error);
    });
}

function deleteTodo(todoId, button) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    const formData = new FormData();
    formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);
    
    fetch(`/todo/${todoId}/delete/`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
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
    })
    .catch(error => {
        showNotification('Произошла ошибка при удалении задачи', 'error');
        console.error('Error:', error);
    });
}

// Load todos with AJAX
function loadTodos() {
    // This would be used for dynamic loading if needed
    // For now, we rely on server-side rendering
}

// Animations
function initializeAnimations() {
    // Add stagger animation to todo items
    const todoItems = document.querySelectorAll('.todo-item');
    todoItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('animate-in');
    });
    
    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('#searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N: New todo
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const newTodoBtn = document.querySelector('#newTodoBtn');
            if (newTodoBtn) {
                newTodoBtn.click();
            }
        }
        
        // Ctrl/Cmd + T: Toggle theme
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Escape: Close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modal = bootstrap.Modal.getInstance(openModal);
                if (modal) {
                    modal.hide();
                }
            }
        }
    });
}

// Utility functions
function updateCounters() {
    const todos = document.querySelectorAll('.todo-item:not([style*="display: none"])');
    const completed = document.querySelectorAll('.todo-item.completed:not([style*="display: none"])');
    const pending = todos.length - completed.length;
    const overdue = document.querySelectorAll('.todo-item.overdue:not([style*="display: none"])');
    
    // Update counter badges
    updateCounterBadge('all', todos.length);
    updateCounterBadge('completed', completed.length);
    updateCounterBadge('pending', pending);
    updateCounterBadge('overdue', overdue.length);
    
    // Update main stats
    const totalCounter = document.querySelector('.stat-total .stat-number');
    const completedCounter = document.querySelector('.stat-completed .stat-number');
    const pendingCounter = document.querySelector('.stat-pending .stat-number');
    const overdueCounter = document.querySelector('.stat-overdue .stat-number');
    
    if (totalCounter) totalCounter.textContent = todos.length;
    if (completedCounter) completedCounter.textContent = completed.length;
    if (pendingCounter) pendingCounter.textContent = pending;
    if (overdueCounter) overdueCounter.textContent = overdue.length;
}

function updateCounterBadge(filter, count) {
    const badge = document.querySelector(`[data-filter="${filter}"] .badge`);
    if (badge) {
        badge.textContent = count;
        badge.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            badge.style.animation = '';
        }, 300);
    }
}

function updateEmptyState(visibleCount = null) {
    if (visibleCount === null) {
        visibleCount = document.querySelectorAll('.todo-item:not([style*="display: none"])').length;
    }
    
    const emptyState = document.querySelector('.empty-state');
    const todosList = document.querySelector('.todos-container');
    
    if (emptyState && todosList) {
        if (visibleCount === 0) {
            emptyState.style.display = 'block';
            todosList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todosList.style.display = 'block';
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this.parentElement)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to notifications container
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function closeNotification(notification) {
    notification.classList.add('hide');
    setTimeout(() => {
        if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
        }
    }, 300);
}

// Date utility functions
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isThisWeek(date) {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= weekStart && date <= weekEnd;
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
}

function performSearch(query) {
    const todos = document.querySelectorAll('.todo-item');
    query = query.toLowerCase().trim();
    
    if (query === '') {
        todos.forEach(todo => {
            todo.style.display = 'block';
        });
        updateEmptyState();
        return;
    }
    
    let visibleCount = 0;
    
    todos.forEach(todo => {
        const title = todo.querySelector('.todo-title').textContent.toLowerCase();
        const description = todo.querySelector('.todo-description')?.textContent.toLowerCase() || '';
        const category = todo.dataset.category?.toLowerCase() || '';
        
        if (title.includes(query) || description.includes(query) || category.includes(query)) {
            todo.style.display = 'block';
            visibleCount++;
        } else {
            todo.style.display = 'none';
        }
    });
    
    updateEmptyState(visibleCount);
}

// Export functions for global access
window.toggleTheme = toggleTheme;
window.toggleTodoComplete = toggleTodoComplete;
window.deleteTodo = deleteTodo;
window.closeNotification = closeNotification;
