import { TodosAccess } from '../dataLayer/todosAccess';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { createLogger } from '../../utils/logger';
import * as uuid from 'uuid';

const logger = createLogger("Business Logic CRUD todo");
const todoAccessLayer = new TodosAccess();
// TODO: Implement businessLogic
export const createTodo = async (request: CreateTodoRequest, userId: string) => {
    logger.info("BL: createTodo");

    if (request) {
        logger.info("Adding a new todo");
        const todoId = uuid.v4()
        return await todoAccessLayer.createTodo({
            userId: userId,
            todoId: todoId,
            createdAt: (new Date()).toISOString(),
            done: false,
            attachmentUrl: null,
            ...request
        });
    } else {
        logger.error("Add failure");
    }
}

export const createAttachmentPreSignedUrl = async (userId, todoId) => {
    const attachmentId = uuid.v4();

    return await todoAccessLayer.createAttachmentPresignedUrl(userId, todoId, attachmentId);
}

export const getTodosForUser = async (userId: string) => {
    return await todoAccessLayer.getTodos(userId);
}

export const updateTodo = async (userId: string, todoId: string, request: UpdateTodoRequest) => {
    await todoAccessLayer.updateTodo(userId, todoId, request);
}

export const deleteTodo = async (userId: string, todoId: string) => {
    await todoAccessLayer.deleteTodo(userId, todoId);
}
