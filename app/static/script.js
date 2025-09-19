class TodoApp {
    constructor() {
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        this.todosList = document.getElementById('todos-list');
        
        this.init();
    }
    
    init() {
        this.todoForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.loadTodos();
    }
    
    async loadTodos() {
        try {
            this.showLoading();
            const response = await fetch('/todos');
            const todos = await response.json();
            this.renderTodos(todos);
        } catch (error) {
            this.showError('Failed to load todos');
            console.error('Error loading todos:', error);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        const title = this.todoInput.value.trim();
        
        if (!title) return;
        
        try {
            const response = await fetch('/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    completed: false
                })
            });
            
            if (response.ok) {
                this.todoInput.value = '';
                this.loadTodos();
            } else {
                this.showError('Failed to add todo');
            }
        } catch (error) {
            this.showError('Failed to add todo');
            console.error('Error adding todo:', error);
        }
    }
    
    async toggleTodo(id, completed) {
        try {
            const todo = this.getCurrentTodo(id);
            const response = await fetch(`/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: todo.title,
                    completed: completed
                })
            });
            
            if (response.ok) {
                this.loadTodos();
            } else {
                this.showError('Failed to update todo');
            }
        } catch (error) {
            this.showError('Failed to update todo');
            console.error('Error updating todo:', error);
        }
    }
    
    async deleteTodo(id) {
        if (!confirm('Are you sure you want to delete this todo?')) {
            return;
        }
        
        try {
            const response = await fetch(`/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadTodos();
            } else {
                this.showError('Failed to delete todo');
            }
        } catch (error) {
            this.showError('Failed to delete todo');
            console.error('Error deleting todo:', error);
        }
    }
    
    getCurrentTodo(id) {
        // This is a simple way to get the todo data for updates
        // In a real app, you might want to store the todos in memory
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        const title = todoItem.querySelector('.todo-text').textContent;
        return { title };
    }
    
    renderTodos(todos) {
        this.todosList.innerHTML = '';
        
        if (todos.length === 0) {
            this.todosList.innerHTML = '<li class="loading">No todos yet. Add one above!</li>';
            return;
        }
        
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);
            
            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.title)}</span>
                <div class="todo-actions">
                    <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
            
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                this.toggleTodo(todo.id, checkbox.checked);
            });
            
            this.todosList.appendChild(li);
        });
    }
    
    showLoading() {
        this.todosList.innerHTML = '<li class="loading">Loading todos...</li>';
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        
        // Remove existing error messages
        const existingError = document.querySelector('.error');
        if (existingError) {
            existingError.remove();
        }
        
        // Insert error before the form
        this.todoForm.parentNode.insertBefore(errorDiv, this.todoForm);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});