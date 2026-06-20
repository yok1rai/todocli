import todo from "./list.js";

async function main() {
    try {
        const command = process.argv[2] || "help";
        switch (command.trim().toLowerCase()) {
            case 'help':
                console.log(`
    TODO CLI

    USAGE:
        node app.js <command> [args]

    COMMAND:
        add <task>      Add a new todo
        list            Show all todos
        done <id>       Mark todos as done
        delete <id>     Delete a todo
        help            show this help menu
    `)
                break;
            case 'add':
                const newItem = process.argv[3];
                if (!newItem) {
                    throw new Error("You must specify the task name");
                }
                todo.add(newItem);
                break;
            case 'done':
                const id = process.argv[3];
                if (!id) {
                    throw new Error("You must specify the ID");
                } else if (Number.isNaN(id) || id < 0) {
                    console.error("ID must be a number that is 0 or bigger than 0");
                    return;
                }
                todo.done(id);
                break;
            case 'delete':
                const id2 = process.argv[3];
                if (!id2) {
                    throw new Error("You must specify the ID");
                } else if (Number.isNaN(id2) || id2 < 0) {
                    console.error("ID must be a number that is 0 or bigger than 0");
                    return;
                }
                todo.delete(id2);
                break;
            case 'list':
                todo.list(); 
        }
    } catch (e) {
        console.log("error:", e.message);
    }
}

main();
