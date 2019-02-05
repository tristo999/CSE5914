// ./src/store/global/reducer.ts

import { Reducer } from 'redux'
import { GlobalState, GlobalActionTypes } from './types'

// Type-safe initialState!
const initialState: GlobalState = {
    mediaStream: null
}

// Thanks to Redux 4's much simpler typings, we can take away a lot of typings on the reducer side,
// everything will remain type-safe.
const reducer: Reducer<GlobalState> = (state = initialState, action) => {
  switch (action.type) {
    case GlobalActionTypes.GET_MEDIASTREAM: {
      return { ...state, loading: true }
    }
    case GlobalActionTypes.SET_MEDIASTREAM: {
      return { ...state, loading: false, data: action.payload }
    }
    default: {
      return state
    }
  }
}

// Instead of using default export, we use named exports. That way we can group these exports
// inside the `index.js` folder.
export { reducer as globalReducer }