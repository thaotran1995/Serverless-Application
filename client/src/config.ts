// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '60my0nx31a'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-t3zorfb12s8wdhxw.us.auth0.com',            // Auth0 domain
  clientId: 'RVVDoPOFyEK4cNHTl5URllWMS8AVSk3e',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
