import * as uuid from 'uuid'

import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { TodoItem } from "../models/TodoItem"
import { TodoAccess } from '../dataLayer/todosAccess'

const todoAccess = new TodoAccess();

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    const userId = 'user' //getUserId(jwtToken)

    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function getTodos(
    jwtToken: string
): Promise<TodoItem[]> {
    const userId = 'user' //getUserId(jwtToken)

    return todoAccess.getTodos(userId)
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
) {

    const userId = 'user' //getUserId(jwtToken)

    await todoAccess.updateTodo(
        userId,
        todoId,
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        }
    )
}


