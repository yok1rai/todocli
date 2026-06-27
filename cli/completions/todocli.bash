_todocli_completions() {
    local cur="${COMP_WORDS[COMP_CWORD]}"
    local opts="add list done delete clear help"

    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
}

complete -o bashdefault -o default -o nospace -F _todocli_completions todocli
