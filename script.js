//Base API URL for backend endpoints
const API_URL = 'http://localhost:3000/todos';

/**
 * Fetch all todos from the backend and render them in the DOM.
 * This function is called on initial load and after any add/update/delete.
 */

async function fetchTodos() {
    try {
        const res = await fetch(API_URL);
        const todos = await res.json();

        const list = document.getElementById('todoList');
        list.innerHTML = '';
        
        // Update counts
        const totalCountElem = document.getElementById('totalCount');
        const completedCountElem = document.getElementById('completedCount');
        const completedCount = todos.filter(t => t.completed).length;
        totalCountElem.textContent = `Total: ${todos.length}`;
        completedCountElem.textContent = `Completed: ${completedCount}`;

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center flex-wrap fade-in';
            if(todo.completed) li.classList.add('completed');
            li.innerHTML = `
                <div class="d-flex align-items-center flex-grow-1">
                    <span id="todo-text-${todo.id}" class="me-2">${todo.title}</span>
                    <input type="text" id="edit-input-${todo.id}" class="form-control form-control-sm d-none me-2" style="width: 60%;" value="${todo.title}" />
                </div>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-secondary" onclick="enableEdit(${todo.id})" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-success d-none" id="save-btn-${todo.id}" onclick="saveEdit(${todo.id})" title="Save"><i class="bi bi-save"></i></button>
                    <button class="btn btn-outline-warning" onclick="toggleComplete(${todo.id}, ${todo.completed})" title="Toggle Complete"><i class="bi bi-check2-circle"></i></button>
                    <button class="btn btn-outline-danger" onclick="deleteTodo(${todo.id})" title="Delete"><i class="bi bi-trash"></i></button>
                </div>
            `;

            // Append this <li> to the list 
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching todos:', error);
    }
}


/**
 * Add a new todo. Reads the input value, sends POST to backend, and refreshes list.
 */

async function addTodo() {
    const input = document.getElementById('todo-input');
    const title = input.value.trim();
    if (!title) return alert('Please enter a todo');

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({title, completed: false })
        });

        input.value = '';
        fetchTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}


/**
 * Toggle the 'completed' status of a todo.
 * Sends PUT with updated 'completed' boolean, then refreshes list.
 * @param {number} id - ID of the todo
 * @param {boolean} completed - current status; will be flipped
 */

async function toggleComplete(id, completed) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({completed: !completed })
        });
        fetchTodos();
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

/**
 * Delete a todo by ID. Sends DELETE request, then refreshes list.
 */

async function deleteTodo(id) {
    try {
        await fetch(`${API_URL}/${id}`, {method: 'DELETE' });
        fetchTodos();
    } catch(error) {
        console.error('Error deleting todo:', error);
    }
}

/** 
 * Enable editing mode for a specific todo;
 * - Hide the <span> showing text
 * - Show the <input> field and Save button
 */

function enableEdit(id) {
    document.getElementById(`todo-text-${id}`).classList.add('d-none');
    document.getElementById(`edit-input-${id}`).classList.remove('d-none');
    document.getElementById(`save-btn-${id}`).classList.remove('d-none');
}

/**
 * Save the edited title:
 * - Read new text
 * - Send PUT request with {title: newText }
 * - Refresh list
 */

async function saveEdit(id) {
    const inputElem = document.getElementById(`edit-input-${id}`);
    const newText = inputElem.value.trim();
    if (!newText) return alert('Todo cannot be empty');

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newText})
        });

        fetchTodos();
    } catch (error) {
        console.error('Error saving edited todo:', error);
    }
}

// On initial page load, fetch and display todos
fetchTodos();