import fs from "fs";
import path from "path";

function jsonExists(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
        return [];
    } else {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data);
    }
}


class Todolist {
    constructor(filePath = "data.json") {
        if (!(filePath.endsWith(".json"))) {
            throw new Error("save file must be a JSON");
        }
        this.filePath = filePath;
        this.todos = this.loadTodos();
    }
    loadTodos() {
        try {
            return jsonExists(this.filePath);
        } catch (e) {
            console.error(`error: file cannot be created (probably due to permission issues)`);
            console.error(`detailed info: ${e.message}`);
            return [];
        }
    }
    saveTodos() {
        try {
            const dir = path.dirname(this.filePath);
            if (dir && !fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.todos, null, 2), "utf-8");
        } catch (e) {
            console.error(`Error saving todos: ${e.message}`);
        }
    }
    add(task) {
        const todo = {
            id: this.todos.length + 1,
            task,
            completed: false,
            createdAt: new Date().toISOString()
        }
        this.todos.push(todo);
        this.saveTodos();
        console.log("Added:", task);
    }
    done(id) {
        const todo = this.todos.find(t => t.id === Number(id));
        if (!todo) {
            console.log(`Todo #${id} not found`);
            return;
        }
        if (todo.completed) {
            console.log(`Todo #${id} is already completed`);
            return;
        }
        todo.completed = true;
        this.saveTodos();
        console.log(`${todo.task} marked as done! `);
    }
    delete(id) {
        const index = this.todos.findIndex(t => t.id === Number(id));
        if (index === -1) {
            console.log(`Todo #${id} not found`);
            return;
        }
        const task = this.todos[index].task;
        this.todos.splice(index, 1);
        this.saveTodos();
        console.log(`"${task}" is deleted`);
    }
    list() {
        if (this.todos.length === 0) {
            console.log("no todos yet!");
            return;
        }
        console.log("Your Todos:");
        this.todos.forEach(todo => {
            const status = todo.completed ? "done" : "not finished"
            console.log(`${todo.task}  [${todo.id}]  [${status}]`);
        })
    }
}

const todo = new Todolist();
export default todo;
