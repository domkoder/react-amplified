import React from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createTodo, updateTodo, deleteTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react'
import TodoList from './TodoList'

import '@aws-amplify/ui-react/styles.css'

import awsExports from './aws-exports'
Amplify.configure(awsExports)

const initialState = { name: '', description: '' }

function App({ signOut, user }) {
	const [formState, setFormState] = React.useState(initialState)
	const [todos, setTodos] = React.useState([])
	const [isEditing, setIsEditing] = React.useState(false)

	React.useEffect(() => {
		fetchTodos()
	}, [])

	const handleEditTodo = (todoId) => {
		const selectedTodo = todos.find((todo) => todo.id === todoId)
		setFormState({
			id: selectedTodo.id,
			name: selectedTodo.name,
			description: selectedTodo.description,
		})
		setIsEditing(true)
	}

	const handleCancelTodo = () => {
		setFormState(initialState)
		setIsEditing(false)
	}

	function setInput(key, value) {
		setFormState({ ...formState, [key]: value })
	}

	async function fetchTodos() {
		try {
			const todoData = await API.graphql(graphqlOperation(listTodos))
			const todos = todoData.data.listTodos.items
			setTodos(todos)
		} catch (error) {
			console.log('error fetching todos')
		}
	}

	async function addTodo() {
		try {
			if (!formState.name || !formState.description) return
			const todo = { ...formState }
			setTodos([todo, ...todos])
			setFormState(initialState)
			await API.graphql(graphqlOperation(createTodo, { input: todo }))
		} catch (error) {
			console.log('error creating todos:', error)
		}
	}

	async function editTodo(todoId) {
		try {
			if (!formState.name || !formState.description) return
			const todo = { ...formState }
			const result = await API.graphql(
				graphqlOperation(updateTodo, { input: todo })
			)

			const updatedTodo = result.data.updateTodo

			setTodos(
				todos.map((todo) => {
					if (todo.id === updatedTodo.id) {
						return updatedTodo
					} else {
						return todo
					}
				})
			)
			setFormState(initialState)
		} catch (error) {
			console.log('error updating todos:', error)
		}
	}

	async function removeTodo(todoId) {
		try {
			if (!todoId) return
			setTodos(todos.filter((todo) => todo.id !== todoId))
			setFormState(initialState)
			await API.graphql(graphqlOperation(deleteTodo, { input: { id: todoId } }))
		} catch (error) {
			console.log('error deleting todos:', error)
		}
	}

	return (
		<>
			<div style={styles.container}>
				<div>
					<Heading level={3}>Hello {user.username}</Heading>
					<Button onClick={signOut}>Sign out</Button>
				</div>

				<h2>Amplify Todos</h2>
				<input
					onChange={(event) => setInput('name', event.target.value)}
					style={styles.input}
					value={formState.name}
					placeholder="Name"
				/>
				<input
					onChange={(event) => setInput('description', event.target.value)}
					style={styles.input}
					value={formState.description}
					placeholder="Description"
				/>
				{!isEditing ? (
					<button style={styles.button} onClick={addTodo}>
						Create Todo
					</button>
				) : (
					<div style={styles.buttonContainer}>
						<button style={styles.button} onClick={editTodo}>
							Update Todo
						</button>
						<button style={styles.button} onClick={handleCancelTodo}>
							Cancel
						</button>
					</div>
				)}

				<TodoList
					todos={todos}
					onDeleteTodo={removeTodo}
					onEditTodo={handleEditTodo}
					styles={styles}
				/>
			</div>
		</>
	)
}

export default withAuthenticator(App)

const styles = {
	container: {
		maxWidth: 500,
		margin: '0 auto',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 20,
	},
	todo: { marginBottom: 15 },
	input: {
		border: 'none',
		backgroundColor: '#ddd',
		marginBottom: 10,
		padding: 8,
		fontSize: 18,
	},
	todoList: {
		marginTop: 20,
		padding: 0,
		listStyle: 'none',
		display: 'flex',
		gap: 20,
		flexDirection: 'column',
	},
	todoName: { fontSize: 20, fontWeight: 'bold', margin: 0 },
	todoDescription: { margin: 0, marginBottom: 10 },
	buttonContainer: { display: 'flex', gap: 10 },
	button: {
		backgroundColor: 'black',
		color: 'white',
		outline: 'none',
		fontSize: 18,
		padding: '10px 0px',
		border: 'none',
		width: '100%',
		cursor: 'pointer',
	},
	editButton: {
		border: 'none',
		marginRight: '10px',
		fontSize: 14,
		padding: 5,
		cursor: 'pointer',
	},
	deleteButton: {
		border: 'none',
		marginRight: '10px',
		fontSize: 14,
		padding: 5,
		color: '#ff0000',
		cursor: 'pointer',
	},
}
