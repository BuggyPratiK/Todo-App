/* Question: Create a todo on your own HTTP server:
1) Where you can perform the CRUD Operations
2) Store the data of todos in json file example - todo.json
 */

const http = require("http");
const fs = require("fs");
const url = require("url");

const PORT = 3000;
const FILE = './todo.json';

//Helper function to read todos from todo.json file
function getTodos() {
    const data = fs.readFileSync(FILE, 'utf-8');
    return JSON.parse(data);
}

// Helper function to save todos to todo.json file
function saveTodos(todos) { 
    fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Add CORS headers to allow requests from file:// or other origins
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const id = parseInt(parsedUrl.pathname.split('/')[2]);  //extract ID from /todos/:id

// Get all todos
if (parsedUrl.pathname === '/todos' && method === 'GET') {
    const todos = getTodos();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(todos));
}

// Add a new todo
else if (parsedUrl.pathname ==='/todos' && method === 'POST'){
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const newTodo = JSON.parse(body);
        const todos = getTodos();
        newTodo.id = Date.now();
        if (typeof newTodo.completed !== 'boolean') {
            newTodo.completed = false;
        }
        todos.push(newTodo);
        saveTodos(todos);
        res.writeHead(201, { 'Content-Type': 'application/json'});
        res.end(JSON.stringify(newTodo));
    });
}

else if (parsedUrl.pathname.startsWith('/todos/') && method === 'PUT') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const updatedFields = JSON.parse(body);
        let todos = getTodos();
        const index = todos.findIndex(t => t.id === id);
        if (index === -1) {
            res.writeHead(404,{ 'Content-Type': 'text/plain' });
            return res.end('Todo not found');
        }
        
        todos[index] = { ...todos[index], ...updatedFields };
        saveTodos(todos);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(todos[index]));
    });
}

else if (parsedUrl.pathname.startsWith('/todos/') && method === 'DELETE') {
    let todos = getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'text/plain'});
        return res.end('Todo not found');
    }
    
    todos.splice(index, 1);
    saveTodos(todos);
    res.writeHead(200, { 'Content-Type': 'text/plain'});
    res.end('Todo deleted');
}

else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
}
});


server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});