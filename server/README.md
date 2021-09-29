# [Nodejs Starter](https://appseed.us/boilerplate-code/nodejs-starter)

Express / [Nodejs Starter](https://appseed.us/boilerplate-code/nodejs-starter) with [JWT authentication](https://jwt.io/introduction/), [SQLite](https://www.sqlite.org/index.html) database, [Sequelize](http://docs.sequelizejs.com/) ORM, unit tests and basic tooling. Actively supported and versioned by **AppSeed**

<br />

![Open-Source Nodejs Starter - Product cover image.](https://github.com/app-generator/static/blob/master/products/boilerplate-code-nodejs-starter-cover.jpg?raw=true)

<br />

## Requirements

- [Node.js](https://nodejs.org/) >= 6.x

<br />

## Authentication

Authentication is based on [json web tokens](https://jwt.io). `passport-jwt` strategy is used to handle the email / password authentication.
After a successful login the generated token is sent to the requester.

<br />

This project was bootstrapped with [Nodejs Starter](https://appseed.us/boilerplate-code/nodejs-starter) provided by **AppSeed**

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the server in the development mode.<br>

### `npm reset`

Deletes the current database (moves it to the trash bin), creates the tables, and populates the database.<br>
Note: This command will fail if the database is open and can not be deleted.<br>

### `npm seed-create <name>`

Creates a new seed file with the supplied name.<br>

### `npm seed-all`

Runs all of the seed scripts to populate the database.<br>
