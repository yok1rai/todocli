import todo from "./list.js"

export function resolveTodoId(input, deleted = false) {
    if (Number.isFinite(Number(input))) {
        return Number(input);
    }
    return deleted ? todo.deletedFind(input) : todo.find(input);
}

