import { GraphQLClient, gql } from 'graphql-request'
import 'cross-fetch/polyfill'

const GET_TODOS = gql`
  query {
    todos {
      id
      created_at
      name
      completed
    }
  }
`

const UPDATE_TODO = gql`
  mutation($todo_id: uuid!, $done: Boolean) {
    update_todos_by_pk(
      pk_columns: { id: $todo_id }
      _set: { completed: $done }
    ) {
      id
    }
  }
`

let secretFound = ''

const run = async () => {
  try {
    const graphQLClient = new GraphQLClient(
      'https://hasura-MAGIC_STRING.nhost.app/v1/graphql',
      {
        headers: {
          'x-hasura-admin-secret': secretFound,
        },
      }
    )

    const data = await graphQLClient.request(GET_TODOS)
    if (data?.todos?.length > 0) {
      console.log(`Trying to update ${data.todos.length} todos.`)
      for (let todo of data.todos) {
        const res = await graphQLClient.request(UPDATE_TODO, {
          todo_id: todo.id,
          done: !todo.completed,
        })
        console.log(`Update of ${todo.name} returned`, res)
      }
    } else {
      console.log(`Null or empty data.todos returned.`)
    }
  } catch (err) {
    console.log(`Caught error ${err}`)
  }
}

run().then(() => console.log(`Done.`))
