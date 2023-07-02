const express = require("express");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const toDate = require("date-fns/toDate");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = sqlite;
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running in http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const checkTheRequestQueries = async (request, response, next) => {
  const { category, priority, status, due_date, search_q } = request.query;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const isValidCategory = categoryArray.includes(category);
    if (isValidCategory) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const isValidPriority = priorityArray.includes(priority);
    if (isValidPriority) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const isValidStatus = statusArray.includes(status);
    if (isValidStatus) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }
  if (due_date !== undefined) {
    try {
      const myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = await isValid(result);
      console.log(isValidDate);
      if (isValidDate) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
      return;
    }
  }
  request.todoId = todoId;
  request.search_q = search_q;
  next();
};

const checkTheRequestBody = async (request, response, next) => {
  const { id, category, priority, status, due_date, search_q } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    const isValidCategory = categoryArray.includes(category);
    if (isValidCategory) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    const isValidPriority = priorityArray.includes(priority);

    if (isValidPriority) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    const isValidStatus = statusArray.includes(status);
    if (isValidStatus) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }
  if (due_date !== undefined) {
    try {
      const myDate = new Date(dueDate);
      const formatedDate = format(new Date(dueDate), "yyyy-MM-dd");
      console.log(formatedDate);
      const result = toDate(new Date(formatedDate));
      const isValidDate = await isValid(result);
      console.log(isValidDate);
      if (isValidDate) {
        request.dueDate = formatedDate;
      } else {
        response.status(400);
        response.send("Invalid Due Date");
        return;
      }
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
  request.todoId = todoId;
  request.search_q = search_q;
  request.id = id;
  next();
};

//api 1

app.get("/todos/", checkTheRequestQueries, async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  //   console.log(status);
  const getTodo = `SELECT * FROM todo WHERE status LIKE '%${status}%' and priority like '%${priority}%'and category like '%${category}%' and todo like '%${search_q}%';`;
  const dbResponse = await db.all(getTodo);

  response.send(
    dbResponse.map((each) => ({
      id: each.id,
      todo: each.todo,
      priority: each.priority,
      status: each.status,
      category: each.category,
      dueDate: each.due_date,
    }))
  );
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodo = `SELECT * FROM todo WHERE id=${todoId};`;
  const dbResponse = await db.get(getTodo);
  response.send({
    id: dbResponse.id,
    todo: dbResponse.todo,
    priority: dbResponse.priority,
    status: dbResponse.status,
    category: dbResponse.category,
    dueDate: dbResponse.due_date,
  });
});

//API 3

app.get("/agenda/", checkTheRequestQueries, async (request, response) => {
  const { date } = request.query;

  const getAgenda = `select *  from todo where due_date = '${date}';`;
  const dbResponse = await db.all(getAgenda);
  response.send(
    dbResponse.map((each) => ({
      id: each.id,
      todo: each.todo,
      priority: each.priority,
      status: each.status,
      category: each.category,
      dueDate: each.due_date,
    }))
  );
});

//API 4

app.post("/todos/", checkTheRequestBody, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postTodo = `INSERT INTO todo(id,todo,priority,status,category,due_date) values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await db.run(postTodo);
  response.send("Todo Successfully Added");
});

//Api 5

app.put("/todos/:todoId/", checkTheRequestBody, async (request, response) => {
  const { status, priority, todo, category, dueDate } = request.body;
  const { todoId } = request.params;

  switch (true) {
    case status !== undefined:
      const updateStatus = `update todo set status='${status}' where id=${todoId};`;
      await db.run(updateStatus);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      const updatePriority = `update todo set priority='${priority}' where id=${todoId};`;
      await db.run(updatePriority);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      const updateTodo = `update todo set todo='${todo}' where id=${todoId};`;
      await db.run(updateTodo);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      const updateCategory = `update todo set category='${category}' where id=${todoId};`;
      await db.run(updateCategory);
      response.send("Category Updated");
      break;
    case dueDate !== undefined:
      const updateDueDate = `update todo set due_date='${dueDate}' where id=${todoId};`;
      await db.run(updateDueDate);
      response.send("Due Date Updated");
      break;
  }
});

//api 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `delete from todo where id=${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
