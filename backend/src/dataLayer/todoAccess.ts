import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from "../models/TodoItem"
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('TodoAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }


    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting todos for a user')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: true
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #todo_name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                '#todo_name': 'name'
            },
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
            },
            ReturnValues: "UPDATED_NEW"
        }
        await this.docClient.update(params).promise()

        return todoUpdate
    }

    async todoExists(userId: string, todoId: string): Promise<boolean> {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }
        const result = await this.docClient.get(params).promise()

        return !!result.Item
    }

    async deleteTodo(userId: string, todoId: string) {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }
        await this.docClient.delete(params).promise()
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new AWS.DynamoDB.DocumentClient()
}
