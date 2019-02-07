import { State } from '../reducers'
import { createSelector } from 'reselect'

/*
 * Get the todos state from the root state
 */
// const getTodosState = ((state: State) => state.todos)
const getMediaState = ((state: State) => state.mediaStream)

/*
 * Getting todos array from todos State
 */
// export const getTodos = createSelector([getTodosState], s => s.todos)
export const getMediaStream = createSelector([getMediaState], s => s.mediaStream)

// Followed this example: https://github.com/Nemak121/react-redux-todo-ts