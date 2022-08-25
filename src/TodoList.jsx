import React from 'react'

export default function TodoList({ todos, onDeleteTodo, onEditTodo, styles }) {
	return (
		<ul style={styles.todoList}>
			{todos.map((todo, index) => (
				<li key={todo.id ? todo.id : index} style={styles.todoListItem}>
					<Todo
						todo={todo}
						onDelete={onDeleteTodo}
						onEdit={onEditTodo}
						styles={styles}
					/>
				</li>
			))}
		</ul>
	)
}

function Todo({ todo, onDelete, onEdit, styles }) {
	return (
		<>
			<p style={styles.todoName}>{todo.name}</p>
			<p style={styles.todoDescription}>{todo.description}</p>
			<button style={styles.editButton} onClick={() => onEdit(todo.id)}>
				Edit
			</button>
			<button style={styles.deleteButton} onClick={() => onDelete(todo.id)}>
				Delete
			</button>
		</>
	)
}
