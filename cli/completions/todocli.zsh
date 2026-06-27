#compdef todocli

_todocli() {
    local -a commands
    commands=(
        'add:Add a new todo'
        'list:Show all todos'
        'done:Mark todo as done'
        'delete:Delete a todo'
        'clear:Delete all todos'
        'help:Show help'
    )

    _describe 'command' commands
}

_todocli "$@"
