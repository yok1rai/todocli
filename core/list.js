import getConfigPath, { jsonExists } from "#cli/genFile.js";
import fs from "fs";
import path from "path";
import "#core/overload.js";
import { customGrey, customGreen, customRed, customWhite, customYellow } from "./overload.js"
import chalk from "chalk";

chalk.level = 3;

class Todolist {
    static #lastID;
    #todos;
    constructor(filePath = getConfigPath()) {
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
    get #deletedTodos() {
        return this.#todos.filter(t => t.deleted);
    }
    #humanReadableDiff(todo) {
        const createdTime = new Date(todo.createdAt).getTime();
        const createdDiff = Date.now() - createdTime;

        const createdMin = createdDiff < 60000 ? Math.floor(createdDiff / 1000) : Math.floor(createdDiff / 60000);
        const createdIsSec = createdDiff < 60000;

        const completedTime = new Date(todo.completedAt).getTime();
        const completedDiff = Date.now() - completedTime;

        const completedMin = completedDiff < 60000 ? Math.floor(completedDiff / 1000) : Math.floor(completedDiff / 60000);
        const CompletedIsSec = completedDiff < 60000;
        return { createdMin, createdIsSec, completedMin, CompletedIsSec };
    }
    find(task) {
        let todoItem;
        if (Number.isFinite(Number(task))) {
            if (Number(task) < 0) {
                console.error("ID cannot be less than zero");
                return;
            }
            todoItem =  this.#activeTodos.find((t) => t.id === Number(task));
        } else {
            todoItem = this.#activeTodos.find((t) => t.task === task);
            if (!todoItem) {
                return;
            }
        }
        return todoItem.id;
    }
    deletedFind(task) {
        const todoItem = this.#deletedTodos.find((t) => t.task === task);
        if (!todoItem) {
            return;
        }
        return todoItem.id;
    }
    add(task, immutable) {
        const activeTodos = this.#activeTodos;
        if (activeTodos.some(t => t.task.toLowerCase() === task.toLowerCase())) {
            console.error("task name must be unique");
            return;
        }
        if (!task) {
            console.error("task name cannot be empty");
            return
        }
        if (task.length > 25) {
            console.error("task name is so long");
            return;
        }
        Todolist.#lastID += 1;
        const todo = {
            id: Todolist.#lastID,
            task,
            completed: false,
            deleted: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            immutable
        }
        this.#todos.push(todo);
        this.#saveTodos();
        const text = immutable ? `immutable \`${task}\` task is added` : `\`${task}\` is added`;
        console.log(text);
    }
    done(id) {
        if (id < 0) {
            console.error("ID cannot be less than 0");
            return;
        }
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
    mute(id) {
        if (id < 0) {
            console.error("ID cannot be less than 0");
            return;
        }
        const todo = this.#activeTodos.find(t => t.id == Number(id));
        if (!todo) {
            console.error("Todo not found or already deleted");
            return;
        }
        if (todo.immutable) {
            console.log(`Todo \`${todo.task}\` is now mutable`);
            todo.immutable = false;
        } else {
            console.error(`Todo \`${todo.task}\` is already mutable`);
            return;
        }
        this.#saveTodos();
    }
    immute(id) {
        if (id < 0) {
            console.error("ID cannot be less than 0");
            return;
        }
        const todo = this.#activeTodos.find(t => t.id == Number(id));
        if (!todo) {
            console.error("Todo not found or already deleted");
            return;
        }
        if (!todo.immutable) {
            console.log(`Todo \`${todo.task}\` is now immutable`);
            todo.immutable = true;
        } else {
            console.error(`Todo \`${todo.task}\` is already immutable`);
            return;
        }
        this.#saveTodos();
    }
    recover(id) {
        if (id < 0) {
            console.error("ID cannot be less than 0");
            return;
        }
        const todo = this.#deletedTodos.find(t => t.id === Number(id));
        if (!todo) {
            console.error("Todo not found or not deleted");
            return;
        }
        todo.deleted = false;
        this.#saveTodos();
        console.log(`"${todo.task}" is recovered`)
    }
    delete(id) {
        if (id < 0) {
            console.error("ID cannot be less than 0");
            return;
        }
        const todo = this.#activeTodos.find(t => t.id === Number(id));
        if (!todo) {
            console.error(`Todo not found or already deleted`);
            return;
        }
        if (todo.immutable) {
            console.error(`Todo \`${todo.task}\` is immutable, you cannot delete it`);
            return;
        }
        todo.deleted = true;
        this.#saveTodos();
        console.log(`\`${todo.task}\` is deleted`);
    }
    clear() {
        const activeTodos = this.#activeTodos;
        if (activeTodos.length === 0) {
            console.error("nothing to clear");
            return
        }
        const deletableTodos = activeTodos.filter(t => t.immutable == false);
        deletableTodos.forEach(t => t.deleted = true);
        this.#saveTodos();
        console.log("all todos cleared");
    }
    deepclear() {
        if (this.#todos.length === 0) {
            console.error("file is empty");
            return;
        }
        this.#todos = [];
        this.#saveTodos();
        console.log("file is cleared");
    }
    list() {
        const activeTodos = this.#activeTodos;
        if (activeTodos.length === 0) {
            console.error("no todos yet!");
            return;
        }

        console.log("Your Todos:");

        activeTodos.forEach(todo => {
            const diff = this.#humanReadableDiff(todo);

            const rawTask = todo.task.padEnd(25);
            const rawID = String(todo.id).padEnd(4);
            const rawStatus = (todo.completed ? "done" : "not finished").padEnd(14);

            const task = rawTask; // keep plain (optional color later)
            const id = customYellow(rawID);
            const status = todo.completed
                ? customGreen(rawStatus)
                : customRed(rawStatus);

            const time = todo.completed
                ? `done ${diff.completedMin} ${diff.CompletedIsSec ? "seconds" : "minutes"} ago`
                : `created ${diff.createdMin} ${diff.createdIsSec ? "seconds" : "minutes"} ago`;

            console.log(`${task} [${id}] [${status}] [${time}] ${todo.immutable ? "[i]" : ""}`);
        });
    }
    listDeleted() {
        const deleted = this.#deletedTodos;
        if (deleted.length === 0) {
            console.error("no todos yet!");
            return;
        }

        console.log("Deleted Todos:");

        deleted.forEach(todo => {
            const diff = this.#humanReadableDiff(todo);

            const rawTask = todo.task.padEnd(25);
            const rawID = String(todo.id).padEnd(4);
            const rawStatus = (todo.completed ? "done" : "not finished").padEnd(14);

            const task = rawTask;
            const id = customYellow(rawID);
            const status = todo.completed
                ? customGreen(rawStatus)
                : customRed(rawStatus);

            const time = todo.completed
                ? `done ${diff.completedMin} ${diff.CompletedIsSec ? "seconds" : "minutes"} ago`
                : `created ${diff.createdMin} ${diff.createdIsSec ? "seconds" : "minutes"} ago`;

            console.log(`${task} [${id}] [${status}] [${time}] ${todo.immutable ? "[i]" : ""}`);
        });
    }
    debugList() {
        const todos = this.#todos;
        if (todos.length === 0) {
            console.error("no todos yet!");
            return;
        }

        console.log("Your Todos:");

        todos.forEach(todo => {
            const diff = this.#humanReadableDiff(todo);

            const rawTask = todo.task.padEnd(25);
            const rawID = String(todo.id).padEnd(4);
            const rawStatus = (todo.completed ? "done" : "not finished").padEnd(14);
            const rawIsDeleted = (todo.deleted ? "deleted" : "not deleted").padEnd(14);

            const isDeleted = todo.deleted
                ? customRed(rawIsDeleted)
                : customGreen(rawIsDeleted);
            const task = rawTask;
            const id = customYellow(rawID);
            const status = todo.completed
                ? customGreen(rawStatus)
                : customRed(rawStatus);

            const time = todo.completed
                ? `done ${diff.completedMin} ${diff.CompletedIsSec ? "seconds" : "minutes"} ago`
                : `created ${diff.createdMin} ${diff.createdIsSec ? "seconds" : "minutes"} ago`;

            console.log(`${task} [${id}] [${status}] [${isDeleted}] [${time}] ${todo.immutable ? "[i]" : ""}`);
        });
    }
    stat() {
        const total = this.#todos.length;
        const active = this.#activeTodos.length;

        const completed = this.#activeTodos.filter(t => t.completed).length;
        const notCompleted = this.#activeTodos.filter(t => !t.completed);
        const deleted = this.#deletedTodos.length;

        const completionRate = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        let longestTime = null;
        let diffText = "";
        if (notCompleted.length > 0) {
            const now = Date.now();

            longestTime = notCompleted.reduce((oldest, todo) => {
                return (now - new Date(todo.createdAt)) >
                    (now - new Date(oldest.createdAt))
                    ? todo
                    : oldest;
            });

            const diff = this.#humanReadableDiff(longestTime);

            diffText = longestTime.completed
                ? `done ${diff.completedMin} ${diff.CompletedIsSec ? "seconds" : "minutes"} ago`
                : `created ${diff.createdMin} ${diff.createdIsSec ? "seconds" : "minutes"} ago`;
        }
        console.log(`
Total Todos: ${total}
Active Todos: ${active}
Completed Todos: ${completed}
Deleted Todos: ${deleted}
Completion Rate: ${completionRate}%
Longest task: ${longestTime ? longestTime.task : "none"} [${diffText}]
`);
    }
}

const todo = new Todolist();
export default todo;
