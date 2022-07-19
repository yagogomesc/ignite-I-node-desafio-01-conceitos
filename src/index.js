const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const existUser = users.find((user) => user.username === username);

  if (!existUser) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  request.user = existUser;

  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existUser = users.find((user) => user.username === username);

  if (existUser) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);

  return response.status(200).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const existTodo = user.todos.find((todo) => todo.id === id);

  if (!existTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  existTodo.title = title;
  existTodo.deadline = new Date(deadline);

  return response.json(existTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const existTodo = user.todos.find((todo) => todo.id === id);

  if (!existTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  existTodo.done = true;

  return response.json(existTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const existTodo = user.todos.find((todo) => todo.id === id);

  if (!existTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(existTodo, 1);

  return response.status(204).json(user);
});

module.exports = app;
