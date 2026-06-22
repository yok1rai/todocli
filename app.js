#!/usr/bin/env node

import "./overload.js";
import { customGrey, customGreen, customRed, customWhite } from "./overload.js"
import todo from "./list.js";
import { hideBin } from 'yargs/helpers';
import yargs from "yargs";
import readline from "readline";
import chalk from "chalk";

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

async function main() {
    const debugMode = process.env.DEBUG === "1" ? true : false;
    try {
        await yargs(hideBin(process.argv))
            .command(
                'add [task]',
                "add a new todo",
                {},
                async (argv) => {
                    let name;
                    if (!argv.task) {
                        name = (await input("add: ")).trim();
                    } else {
                        name = argv.task;
                    }
                    todo.add(name);
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
                    let id;
                    if (Number.isFinite(Number(name))) {
                        id = Number(name);
                        if (id < 0) {
                            console.error("ID must be bigger than zero");
                            return;
                        }
                    } else {
                        id = todo.find(name);
                    }
                    todo.done(id);
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
                    let id;
                    if (Number.isFinite(Number(name))) {
                        id = Number(name);
                        if (id < 0) {
                            console.error("ID must be bigger than zero");
                            return;
                        }
                    } else {
                        id = todo.find(name);
                    }
                    todo.delete(id);
                }
            )
            .command(
                'clear',
                'delete all todos',
                {},
                async () => {
                    const confirm = (await input("Are you sure? ")).trim().toLowerCase();
                    if (confirm !== 'y' && confirm !== 'yes') {
                        console.log("clear canceled");
                        return;
                    }
                    todo.clear()
                }
            )
        yargs(hideBin(process.argv))
            .help(false)
            .version(false)
            .command('add [task]', 'add a new todo', {}, () => { })
            .command('list', 'show all todos', {}, () => { })
            .fail((msg, err, yargs) => {
                console.log(customRed(msg));
                console.log('\nCustom help:\n');

                console.log(chalk.green('Commands:'));
                console.log(`  ${chalk.yellow('add [task]')}   add a new todo`);
                console.log(`  ${chalk.yellow('list')}         show all todos`);
                console.log(`  ${chalk.yellow('done [id]')}    mark todo as done`);
                console.log(`  ${chalk.yellow('delete [id]')}  delete a todo`);
                console.log(`  ${chalk.yellow('clear')}        delete all todos`);

                process.exit(1);
            })
            .completion('completion', 'Generate completion script', () => {
                return ['add', 'list', 'done', 'delete', 'clear', 'help']
            })
            .demandCommand(1, "You must specify a command")
            .strict()
            .help()
            .alias('h', 'help')
            .version()
            .alias('v', 'version')
            .parseAsync();
            rl.close();

    } catch (e) {
        rl.close();
        if (debugMode) {
            console.log("error [DETAILED]:");
            console.log(e);
        } else {
            console.log("error:", e.message);
        }
        process.exit(1);
    }
}

main();
