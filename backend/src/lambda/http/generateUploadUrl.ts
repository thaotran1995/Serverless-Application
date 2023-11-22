import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler, validator } from 'middy/middlewares'
import { transpileSchema } from '@middy/validator/transpile'
import { createAttachmentPreSignedUrl } from '../../helpers/businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoRequest = event.pathParameters;
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const uploadUrl = await createAttachmentPreSignedUrl(userId, todoRequest.todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

const schema = {
  type: 'object',
  required: ['pathParameters'],
  properties: {
    pathParameters: {
      type: 'object',
      required: ['todoId'],
      properties: {
        todoId: {
          type: 'string',
          minLength: 1
        }
      }
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
