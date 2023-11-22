import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, validator } from 'middy/middlewares'
import { transpileSchema } from '@middy/validator/transpile'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'
import { createTodo } from '../../helpers/businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)

    const result = await createTodo(newTodo, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: result
      })
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
        }
      },
      required: [
        'name',
        'dueDate'
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
  .use(
    cors({
      credentials: true
    })
  )
