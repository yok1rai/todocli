#!/usr/bin/env node

import "./overload.js";
import { customGrey, customGreen, customRed, customWhite } from "./overload.js"
import todo from "./list.js";
import { hideBin } from 'yargs/helpers';
import yargs from "yargs";
import readline from "readline";
import chalk from "chalk";
import { resolveTodoId } from "./utils.js"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function input(prompt) {
    return new Promise((res) => {
        rl.question(customGrey(prompt), (answer) => {
            res(answer);
        })
    })
}

const debugMode = process.env.DEBUG === "1" ? true : false;

async function interactive() {
    console.log("type `help` or `h` for commands");
    while (true) {
        const command = (await input("> ")).trim().toLowerCase();
        switch (command) {
            case 'add': {
                const name = (await input("Enter the name: ")).trim();
                if (!name) {
                    console.error("name cannot be empty");
                    continue;
                }
                let immutableFlag;
                switch ((await input("immutable? ")).trim().toLowerCase()) {
                    case 'y':
                    case 'yes':
                        immutableFlag = true;
                        break;
                    case 'n':
                    case 'no':
                        immutableFlag = false;
                        break;
                    default:
                        console.error("invalid entry");
                        continue;
                }
                todo.add(name, immutableFlag);
                break;
            }
            case 'list': {
                if (!debugMode) {
                    todo.list();
                } else {
                    todo.debugList();
                }
                break;
            }
            case 'done': {
                const name = (await input("Enter ID or name: ")).trim();
                if (!name) {
                    console.error("id or name cannot be empty");
                    continue;
                }
                const id = resolveTodoId(name, false);
                todo.done(id);
                break;
            }
            case 'mute': {
                const name = (await input("Enter ID or name: ")).trim();

                if (!name) {
                    console.error("id or name cannot be empty");
                    continue;
                }
                const id = resolveTodoId(name, false);
                todo.mute(id);
                break;
            }
            case 'immute': {
                const name = (await input("Enter ID or name: ")).trim();

                if (!name) {
                    console.error("id or name cannot be empty");
                    continue;
                }
                const id = resolveTodoId(name, false);
                todo.immute(id);
                break;
            }
            case 'recover': {
                const name = (await input("Enter ID or name: ")).trim();
                if (!name) {
                    console.error("id or name cannot be empty");
                    continue;
                }
                const id = resolveTodoId(name, true);
                todo.recover(id);
                break;
            }
            case 'delete': {
                const name = (await input("Enter ID or name: ")).trim();
                if (!name) {
                    console.error("id or name cannot be empty");
                    continue;
                }
                const id = resolveTodoId(name, false);
                todo.delete(id);
                break;
            }
            case 'clear': {
                const confirm = (await input("are you sure? ")).trim().toLowerCase();
                if (confirm !== 'y' && confirm !== 'yes') {
                    console.error("clear canceled");
                    continue;
                }
                todo.clear();
                break;
            }
            case 'deepclear': {
                const confirm = (await input("are you sure? ")).trim().toLowerCase();
                if (confirm !== 'y' && confirm !== 'yes') {
                    console.error("deepclear canceled");
                    continue;
                }
                todo.deepclear();
                break;
            }
            case 'h':
            case 'help': {
                console.log(customWhite(`app.js <command>

Commands:
  add               add a new todo
  list              show all todos
  done              mark todo as done
  mute              make todo mutable
  immute            make todo immutable
  recover           recover a deleted todo
  delete            delete a todo
  deepclear         hard-delete the todos
  clear             delete all todos
  exit              exit from the interactive mode
`))
                break;
            }
            case 'stat': {
                todo.stat();
                break;
            }
            case 'exit':
                console.log("goodbye!");
                process.exit(0);
                break;
            default:
                console.error("invalid command, type `h` for options")
        }
    }
}

async function nonInteractive() {
    await yargs(hideBin(process.argv))
        .command(
            'add [task] [flags]',
            "add a new todo",
            (yargs) => {
                return yargs.option('i', {
                    alias: 'immutable',
                    type: 'boolean',
                    default: false,
                    description: 'mark todo as immutable'
                });
            },
            async (argv) => {
                let name;
                if (!argv.task) {
                    name = (await input("add: ")).trim();
                } else {
                    name = argv.task;
                }

                todo.add(name, argv.i);
            }
        )
        .command(
            'list',
            'show all todos',
            {},
            () => {
                if (!debugMode) {
                    todo.list()
                } else {
                    todo.debugList();
                }
            }
        )
        .command(
            'done [id]',
            'mark todo as done',
            {},
            async (argv) => {
                let name;
                if (!argv.id) {
                    name = (await input("mark as done: ")).trim();
                    if (!name) {
                        console.error("no task given");
                        return;
                    }
                } else {
                    name = argv.id;
                }
                let id = resolveTodoId(name, false);
                todo.done(id);
            }
        )
        .command(
            'mute [id]',
            'make todo mutable',
            {},
            async (argv) => {
                let name;
                if (!argv.id) {
                    name = (await input("mute: ")).trim();
                    if (!name) {
                        console.error("no task given");
                        return;
                    }
                } else {
                    name = argv.id;
                }
                let id = resolveTodoId(name, false);
                todo.mute(id);
            }
        )
        .command(
            'immute [id]',
            'make todo immutable',
            {},
            async (argv) => {
                let name;
                if (!argv.id) {
                    name = (await input("immute: ")).trim();
                    if (!name) {
                        console.error("no task given");
                        return;
                    }
                } else {
                    name = argv.id;
                }
                let id = resolveTodoId(name, false);
                todo.immute(id);
            }
        )
        .command(
            'recover [id]',
            'recover a deleted todo',
            {},
            async (argv) => {
                let name;
                if (!argv.id) {
                    name = (await input("recover: ")).trim();
                    if (!name) {
                        console.error("no task given");
                        return;
                    }
                } else {
                    name = argv.id;
                }
                let id = resolveTodoId(name, false);
                todo.recover(id);
            }
        )
        .command(
            'delete [id]',
            'delete a todo',
            {},
            async (argv) => {
                let name;
                if (!argv.id) {
                    name = (await input("remove: ")).trim();
                    if (!name) {
                        console.error("no task given");
                        return;
                    }
                } else {
                    name = argv.id;
                }
                let id = resolveTodoId(name, false);
                todo.delete(id);
            }
        )
        .command(
            'clear',
            'delete all todos',
            (yargs) => {
                return yargs.option('f', {
                    alias: 'force',
                    type: 'boolean',
                    default: false,
                    description: 'deep clean the task list'
                });
            },
            async (argv) => {
                const confirm = (await input("Are you sure? ")).trim().toLowerCase();
                if (confirm !== 'y' && confirm !== 'yes') {
                    console.log("clear canceled");
                    return;
                }
                if (!argv.f) {
                    todo.clear();
                } else {
                    todo.deepclear();
                }
            }
        )
        .command(
            'stat',
            'get statics',
            {},
            async () => {
                todo.stat(); 
            }
        )
        .demandCommand(1, 1, "You must provide a message")
        .strict()
        .help()
        .alias('h', 'help')
        .version()
        .alias('v', 'version')
        .parseAsync();
}

async function main() {
    try {
        if (process.argv[2]) {
            await nonInteractive();
        } else {
            await interactive();
        }
    } catch (e) {
        if (debugMode) {
            console.log("error [DETAILED]:");
            console.log(e);
        } else {
            console.log("error:", e.message);
        }
        process.exit(1);
    } finally {
        rl.close();
    }
}

main()
