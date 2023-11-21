import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../../utils/logger';
import { TodoItem } from '../../models/TodoItem';
import { TodoUpdate } from '../../models/TodoUpdate';
import {AttachmentUtils} from "../fileStorage/attachmentUtils";

const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    private readonly todoTable: string = process.env.TODOS_TABLE;
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET;
    private readonly todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX;

    private todoDocument: DocumentClient;

    constructor() {
        this.todoDocument = new XAWS.DynamoDB.DocumentClient();
    }

    public async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info("Ready to add a new todo")

        await this.todoDocument.put({
            TableName: this.todoTable,
            Item: todo
        }).promise();

        logger.info(`todo ${todo.name} is added`);

        return todo;
    }

    public async createAttachmentPresignedUrl(userId: string, todoId: string, attachmentId: string) {
        const attachmentUtil = new AttachmentUtils();
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`;

        if (userId) {
            await this.todoDocument.update({
                TableName: this.todoTable,
                Key: {
                    todoId, userId
                },
                UpdateExpression: "set #attachmentUrl = :attachmentUrl",
                ExpressionAttributeNames: {
                    "#attachmentUrl": "attachmentUrl"
                },
                ExpressionAttributeValues: {
                    ":attachmentUrl": attachmentUrl
                }
            }).promise();

            logger.info(`Url ${await attachmentUtil.createAttachmentPreSignedUrl(attachmentId)}`);

            return await attachmentUtil.createAttachmentPreSignedUrl(attachmentId);
        } else {
            logger.error("Unauthenticated operation");
        }
    }

    public async getTodos(userId: string) : Promise<TodoItem[]> {
        if (userId) {
            logger.info("Ready to get all todos");

            const todos = await this.todoDocument.query({
                TableName: this.todoTable,
                IndexName: this.todosCreatedAtIndex,
                KeyConditionExpression: "#userId = :userId",
                ExpressionAttributeNames: {
                    "#userId": "userId"
                },
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            }).promise();

            logger.info(`Query successfully ${todos.Items}`);

            return todos.Items as TodoItem[];
        } else {
            logger.error(`Unauthenticated operation`);
        }
    }

    public async updateTodo(userId: string, todoId: string, todo: TodoUpdate) {
        if (userId) {
            logger.info(`Found todo ${todoId}, ready for update`);

            await this.todoDocument.update({
                TableName: this.todoTable,
                Key: {
                    todoId,
                    userId
                },
                UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
                ExpressionAttributeNames: {
                    "#name": "name",
                    "#dueDate": "dueDate",
                    "#done": "done"
                },
                ExpressionAttributeValues: {
                    ":name": todo.name,
                    ":dueDate": todo.dueDate,
                    ":done": todo.done
                }
            }).promise();

            logger.info("Updated successfull ", todo)
        } else {
            logger.error(`Unauthenticated operation`);
        }
    }

    public async deleteTodo(userId: string, todoId: string) {
        if (userId) {
            logger.info(`Ready to delete todo ${todoId}`);

            await this.todoDocument.delete({
                TableName: this.todoTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise();

            logger.info("Delete successful");
        } else {
            logger.error("Unauthenticated operation");
        }
    }
}
