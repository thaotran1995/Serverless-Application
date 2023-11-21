import 'source-map-support/register'
import { getTodos } from '../../businessLogic/todos'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    console.log('Processing event: ', event)

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
