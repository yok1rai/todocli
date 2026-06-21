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

    ENVIRONMENT VARIABLES
        DEBUG              Enable DEBUG mode
           1                    DEBUG mode enabled
           anything else        DEBUG mode disabled
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
                if (!name) {
                    throw new Error("you must specify an ID or task name");
                }
                let id;
                if (Number.isFinite(Number(name))) {
                    id = Number(name);

                    if (id < 0) {
                        console.error("ID must be bigger than zero");
                        break;
                    }
                } else {
                    id = todo.find(name);
                }

                todo.done(id);
                break;
            }

            case 'delete': {
                const name = process.argv[3];
                if (!name) {
                    throw new Error("you must specify an ID or task name");
                }
                let id;

                if (Number.isFinite(Number(name))) {
                    id = Number(name);

                    if (id < 0) {
                        console.error("ID must be bigger than zero");
                        break;
                    }
                } else {
                    id = todo.find(name);
                }

                todo.delete(id);
                break;
            }

            case 'clear': {
                todo.clear();
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
