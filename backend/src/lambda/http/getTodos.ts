import 'source-map-support/register'
import { getTodos } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const logger = createLogger('getTodoshandler')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    logger.info('Processing event: ', event)

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const todos = await getTodos(jwtToken);

    return {
        statusCode: 200,
        body: JSON.stringify({
            items: todos,
        }),
    }
}
