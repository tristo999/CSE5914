// ./src/store/global/actions.ts

import { action } from 'typesafe-actions'
import { GlobalActionTypes } from './types'

// Here we use the `action` helper function provided by `typesafe-actions`.
// This library provides really useful helpers for writing Redux actions in a type-safe manner.
// For more info: https://github.com/piotrwitek/typesafe-actions
export const setMediaStream = () => action(GlobalActionTypes.SET_MEDIASTREAM)
export const getMediaStream = (data: any) => action(GlobalActionTypes.GET_MEDIASTREAM, data)

// Remember, you can also pass parameters into an action creator. Make sure to
// type them properly as well.
// export const fetchSuccess = (data: Hero[]) => action(GlobalActionTypes.SET_MEDIASTREAM, data)
// export const fetchError = (message: string) => action(GlobalActionTypes.GET_MEDIASTREAM, message)