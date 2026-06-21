import todo from "./list.js";

async function main() {
    const debugMode = process.env.DEBUG === "1" ? true : false;

    try {
        const command = process.argv[2] || "invalid";

        switch (command.trim().toLowerCase()) {

            case 'help': {
                console.log(`
    TODO CLI

    USAGE:
        node app.js <command> [args]

    COMMAND:
        add <task>          Add a new todo
        list                Show all todos
        done <id|name>      Mark todos as done
        delete <id|name>    Delete a todo
        clear               Delete all todos
        help                show this help menu
    `);
                break;
            }

            case 'add': {
                const item = process.argv[3];

                if (!item) {
                    throw new Error("You must specify the task name");
                }

                todo.add(item);
                break;
            }

            case 'done': {
                const name = process.argv[3];
                let id;

                if (Number.isFinite(Number(name))) {
                    id = Number(name);

                    if (id < 0) {
                        console.error("ID must be bigger than zero");
                        break;
                    }
                } else {
                    const todoItem = todo.todos.find((t) => t.task === name);

                    if (!todoItem) {
                        console.error("Todo not found");
                        break;
                    }

                    id = todoItem.id;
                }

                todo.done(id);
                break;
            }

            case 'delete': {
                const name = process.argv[3];
                let id;

                if (Number.isFinite(Number(name))) {
                    id = Number(name);

                    if (id < 0) {
                        console.error("ID must be bigger than zero");
                        break;
                    }
                } else {
                    const todoItem = todo.todos.find((t) => t.task === name);

                    if (!todoItem) {
                        console.error("Todo not found");
                        break;
                    }

                    id = todoItem.id;
                }

                todo.delete(id);
                break;
            }

            case 'clear': {
                console.log("will be added");
                break;
            }

            case 'list': {
                todo.list();
                break;
            }

            default: {
                throw new Error("Invalid command");
            }
        }

    } catch (e) {
        if (debugMode) {
            console.log("detailed error:\n", e);
        } else {
            console.log("error:", e.message);
        }
    }
}

main();
