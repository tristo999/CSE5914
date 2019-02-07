import { combineReducers } from 'redux'
import * as fromMedia from './media'

/*
 * This is the root state of the app
 * It contains every substate of the app
 */
export interface State {
    mediaStream: fromMedia.State
}

/*
 * initialState of the app
 */
export const initialState: State = {
    mediaStream: fromMedia.initialState
}

/*
 * Root reducer of the app
 * Returned reducer will be of type Reducer<State>
 */
export const reducer = combineReducers<State>({
    mediaStream: fromMedia.reducer
})

// Followed this example: https://github.com/Nemak121/react-redux-todo-ts