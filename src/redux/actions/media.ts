/*
 * We're defining every action name constant here
 * We're using Typescript's enum
 * Typescript understands enum better 
 */
export enum ActionTypes {
  SET_MEDIASTREAM = '[Media] SET_MEDIASTREAM',
}

/*
 * Define return types of our actions 
 * Every action returns a type and a payload
 */
// export class AddMediaStreamAction implements Action{ 
//   readonly type: string =  ActionTypes.SET_MEDIASTREAM;
//   payload: { mediaStream: any } 
//   constructor(public payload: any = null) { }
// }
export interface AddMediaStreamAction { 
  type: ActionTypes.SET_MEDIASTREAM;
  payload?: any;
}

/*
 * Define our actions creators
 * We are returning the right Action for each function
 */
export function setMediaStream(mediaStreamObj: any): AddMediaStreamAction {

  return {
    type: ActionTypes.SET_MEDIASTREAM,
    payload: {
      mediaStream: mediaStreamObj
    }
  }
}

/*
 * Define the Action type
 * It can be one of the types defining in our action/todos file
 * It will be useful to tell typescript about our types in our reducer
 */
export type Action = AddMediaStreamAction

// Followed this example: https://github.com/Nemak121/react-redux-todo-ts