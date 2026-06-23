import todo from "./list.js"

export function resolveTodoId(input, deleted = false) {
    if (Number.isFinite(Number(input))) {
        return Number(input);
    }
    if (!deleted) todo.find(input);
    else todo.deletedFind(input); 
}

