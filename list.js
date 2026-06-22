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
    static #lastID;
    #todos;
    constructor(filePath = "data.json") {
        if (!(filePath.endsWith(".json"))) {
            throw new Error("save file must be a JSON");
        }
        this.filePath = filePath;
        this.#todos = this.#loadTodos();
        Todolist.#lastID = this.#todos.length ? Math.max(...this.#todos.map(t => t.id)) : 0;
    }
    #loadTodos() {
        try {
            return jsonExists(this.filePath);
        } catch (e) {
            console.error(`error: file cannot be created (probably due to permission issues)`);
            console.error(`detailed info: ${e.message}`);
            return [];
        }
    }
    #saveTodos() {
        try {
            const dir = path.dirname(this.filePath);
            if (dir && !fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.filePath, JSON.stringify(this.#todos, null, 2), "utf-8");
        } catch (e) {
            throw new Error(`Error saving todos: ${e.message}`);
        }
    }
    get #activeTodos() {
        return this.#todos.filter(t => !t.deleted);
    }
    #humanReadableDiff(todo) {
        const createdTime = new Date(todo.createdAt).getTime();
        const createdDiff = Date.now() - createdTime;

        const createdMin =  createdDiff < 60000 ? Math.floor(createdDiff / 1000) : Math.floor(createdDiff / 60000);
        const createdIsSec = createdDiff < 60000;

        const completedTime = new Date(todo.completedAt).getTime();
        const completedDiff = Date.now() - completedTime;

        const completedMin = completedDiff < 60000 ? Math.floor(completedDiff / 1000) : Math.floor(completedDiff / 60000);
        const CompletedIsSec = completedDiff < 60000;
        return { createdMin, createdIsSec, completedMin, CompletedIsSec };
    }
    find(task) {
        const todoItem = this.#activeTodos.find((t) => t.task.toLowerCase() === task.toLowerCase());
        if (!todoItem) {
            console.error("todo not found");
            return
        }
        return todoItem.id;
    }
    add(task) {
        Todolist.#lastID += 1;
        const todo = {
            id: Todolist.#lastID,
            task,
            completed: false,
            deleted: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        }
        this.#todos.push(todo);
        this.#saveTodos();
        console.log("Added:", task);
    }
    done(id) {
        const todo = this.#activeTodos.find(t => t.id === Number(id));
        if (!todo) {
            console.error(`Todo #${id} not found`);
            return
        }
        if (todo.completed) {
            console.error(`Todo #${id} is already completed`);
            return
        }
        todo.completed = true;
        todo.completedAt = new Date().toISOString();
        this.#saveTodos();
        console.log(`${todo.task} marked as done! `);
    }
    delete(id) {
        const todo = this.#activeTodos.find(t => t.id === Number(id));
        if (!todo) {
            console.error(`Todo #${id} not found or already deleted`);
            return
        }

        todo.deleted = true;
        this.#saveTodos();
        console.log(`"${todo.task}" is deleted`);
    }
    clear() {
        const activeTodos = this.#activeTodos;
        if (activeTodos.length === 0) {
            console.error("nothing to clear");
            return
        }
        this.#todos.forEach(t => t.deleted = true);
        this.#saveTodos();
        console.log("all todos cleared");
    }
    list() {
        const activeTodos = this.#activeTodos;
        if (activeTodos.length === 0) {
            console.error("no todos yet!");
            return
        }
        console.log("Your Todos:");
        activeTodos.forEach(todo => {
            const status = todo.completed ? "done" : "not finished";
            const diff = this.#humanReadableDiff(todo);
            const time = todo.completed
                ? `done ${diff.completedMin} ${diff.CompletedIsSec ? "seconds" : "minutes"} ago`
                : `created ${diff.createdMin} ${diff.createdIsSec ? "seconds" : "minutes"} ago`;
            console.log(`${todo.task} [${todo.id}] [${status}] [${time}]`);
        });
    }
}

const todo = new Todolist();
export default todo;
