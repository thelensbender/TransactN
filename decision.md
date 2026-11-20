# Problems encountered and Decisions

## PostgreSQL Local Setup and database creation

- I had problems with working with PostgreSQL on my local device, including installation. So AI gave me a step to step guide on how to do the installation and using it.
- I got stucked with creating a database with tables. This is my first time working with a local database. It was quite annoying.
- I had a problems with understanding things like connection pool, client, ("BEGIN", "COMMIT", "ROLLBACK"). I read from the postgres docs. (<https://node-postgres.com/features/pooling/>, <https://node-postgres.com/features/connecting>, <https://node-postgres.com/features/transactions>)

## Config

I used a config.js file because

- using process.env for a lot of files can cause an issue like Misspelling.
- Changing anything means I have update the change across files where they are used.

## SQL

I have never used SQL and starting to learn SQL from the basics while working on personal and group project, with joggling school activities is almost impossible. So, I wrote the SQL codes with the help of an AI. I tried writing similar queries using the sample that the AI gave. I also google searched for "How to..." when I got stucked.

## Testing

Writing the test code was a brain squeezing for me. Especially when this is my first time using SQL.
