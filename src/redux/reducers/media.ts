import { ActionTypes, Action } from '../actions/media'

// Define our State interface for the current reducer
export interface State {
  mediaStream: any
}

// Define our initialState
export const initialState: State = {
  mediaStream: null
}

/* 
 * Reducer takes 2 arguments
 * state: The state of the reducer. By default initialState ( if there was no state provided)
 * action: Action to be handled. Since we are in todos reducer, action type is Action defined in our actions/todos file.
 */
export function reducer(state: State = initialState, action: Action) {
  switch (action.type) {

    case ActionTypes.SET_MEDIASTREAM: {
      /*
       * We have autocompletion here
       * Typescript knows the action is type of AddTodoAction thanks to the ActionTypes enum
       * todo is type of Todo
       */
      const mediaStream = action.payload.mediaStream

      return {
        ...state,
        mediaStream: mediaStream 
      }
    }
    default: {
      return initialState
    }
  }
}
// Followed this example: https://github.com/Nemak121/react-redux-todo-ts