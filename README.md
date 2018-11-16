# Truelayer API test for Emma

## Introduction

This node API is the solution for a coding challenge for [Emma](https://emma-app.com/).

It contains user registration and login functionality, along with connecting a user to their bank accounts through Truelayer and storing their account and transaction data.

## Running the API

### Requirements

- node.js version > 8
- mySQL running locally for the development/testing server, or change the database configuration to use a remote server

### Environment

The app configuration can be found in `/app/config/index.js`. 

Values from environment variables will be used unless not set, the values will then fall back to default development values.

It's recommended to create a new file in the root directory called `env.sh` - a script to load the environment variables. Be careful not to commit this file to any public scm, as it will contain secure data such as api secrets and DB user passwords.

Your script should look something like this:

```bash
#!/bin/bash

# env indicating the environment in which the app is running 
export NODE_ENV=test

# secret value used to generate encrypted jwt tokens for authenticating users
# should be complex and hard to guess
export SECRET=test123

# port on which the application will run
export PORT=2000

# hostname of the mysql database server you wish to connect to
export DB_HOST=localhost

# port of the mysql database server you wish to connect to
export DB_PORT=3306

# username of the account you wish to use for the database
export DB_USER=test

# password of the account you wish to use for the database
export DB_PASSWORD=password

# name of the database that you wish to use on the server
# this database should already be created
export DB_NAME=test

# client secret for your truelayer account
export TRUELAYER_CLIENT_SECRET=client-secret

# client id for your truelayer account
export TRUELAYER_CLIENT_ID=client-id

# the redirect uri used for the truelayer authentication flow
export TRUELAYER_REDIRECT_URI={your domain}/api/v1/bank/auth
```

### Usage

(both npm and yarn can be used, but the commands shown here are using yarn)

- install dependencies: `yarn`
- start development server: `yarn start:dev`
- start production server: `yarn start`
- run unit tests: `yarn test:unit`
- run integration tests: `yarn test:integration`
- run full test suite with coverage report: `yarn test`
- run linting with eslint: `yarn lint`

## Endpoints

### Default

#### GET: /

returns: 
A welcome message and the current environment.

### Health

#### GET: /health

returns: 
Information on the health of the service - returns 200 if everything is running fine, returns 503 if the database cannot be connected to.

### Auth

#### POST: /api/v1/auth/register

request data: 
```json
{
	"email": "test@email.com",
	"password": "test"
}
```

returns: 
A success message and a jwt that can be used to authenticate future requests.

#### POST: /api/v1/auth/login

request data: 
```json
{
	"email": "test@email.com",
	"password": "test"
}
```

returns: 
A success message and a jwt that can be used to authenticate future requests.

### User

#### GET: /api/v1/user

request headers: 
```
Authorization: Bearer {token}
```

returns: 
A success message and information about the authenticate user

### Bank

#### GET: /api/v1/bank/auth

request headers: 
```
Authorization: Bearer {token}
```

returns: 
A success message and a url that when navigated to will initiate the authentication flow with truelayer

#### POST: /api/v1/bank/auth

(this endpoint is for use by truelayer in the authentication flow, it should not be called directly)

request data: 
```json
{
  "state": 1234,
  "code": "ab12e715cd97f8c9a2"
}
```

returns: 
A success message confirming that the user has been authenticated and their account/transaction data has been collected

### Account

#### GET: /api/v1/accounts

request headers: 
```
Authorization: Bearer {token}
```

returns: 
A success message and a list of the authenticated users accounts

### Transaction

#### GET: /api/v1/accounts/:accountId/transactions

request headers: 
```
Authorization: Bearer {token}
```

returns: 
A success message and a list of the transactions associated with the provided account ID

### Debug

#### GET: /api/v1/debug/user/:userId

(in production this endpoint should require admin authentication - this could be achieved by adding a modifier on the user account model for admin permissions, then checking the authenticated user's permissions before proceeding with he request)

returns: 
debug information for the calls to truelayer to collect data for the specified user ID. 
