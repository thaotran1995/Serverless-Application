import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler, validator } from 'middy/middlewares'
import { transpileSchema } from '@middy/validator/transpile'
import { updateTodo } from '../../helpers/businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const userId = getUserId(event)
    await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 200,
      body: JSON.stringify({})
    }
  }
)

const schema = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 1
        },
        dueDate: {
          type: 'string'
        },
        done: {
          type: 'boolean'
        }
      },
      required: [
        'name',
        'dueDate',
        'done'
      ]
    }
  }
}

handler
  .use(
    validator({
      eventSchema: transpileSchema(schema)
    })
  )
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
