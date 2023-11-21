import * as uuid from 'uuid'

import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest"
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from "../models/TodoUpdate"
import { parseUserId } from '../auth/utils'
import {TodoAccess} from "../dataLayer/todoAccess";

const todoAccess = new TodoAccess();

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    const todoId = uuid.v4()
    const userId = parseUserId(jwtToken)

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
    const userId = parseUserId(jwtToken)
    return todoAccess.getTodos(userId)
}

export async function updateTodo (
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string
): Promise<TodoUpdate> {

    const userId = parseUserId(jwtToken)
    return await todoAccess.updateTodo(
        userId,
        todoId,
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done
        }
    )
}

export async function todoExists (
    todoId: string,
    jwtToken: string
): Promise<boolean> {
    const userId = parseUserId(jwtToken)
    return await todoAccess.todoExists(
        userId,
        todoId
    )
}

export async function deleteTodo(
    todoId: string,
    jwtToken: string
) {
    const userId = parseUserId(jwtToken)
    await todoAccess.deleteTodo(userId, todoId);
}

export async function generateAndAddUploadUrl (
    todoId: string,
    jwtToken: string
): Promise<string> {

    const uploadUrl = todoAccess.getUploadUrl(todoId)
    const userId = parseUserId(jwtToken)
    await todoAccess.updateUrl(
        userId,
        todoId,
    )

    return uploadUrl
}
