// ./src/store/global/types.ts

// https://docs.opendota.com/#tag/heroes%2Fpaths%2F~1heroes%2Fget
// export interface Hero {
//     id: number
//     name: string
//     localized_name: string
//     primary_attr: string
//     attack_type: string
//     roles: string[]
//     legs: number
//   }
  
  // This type is basically shorthand for `{ [key: string]: any }`. Feel free to replace `any` with
  // the expected return type of your API response.
//   export type ApiResponse = Record<string, any>
  
  // Use `enum`s for better autocompletion of action type names. These will
  // be compiled away leaving only the final value in your compiled code.
  //
  // Define however naming conventions you'd like for your action types, but
  // personally, I use the `@@context/ACTION_TYPE` convention, to follow the convention
  // of Redux's `@@INIT` action.
  export enum GlobalActionTypes {
    SET_MEDIASTREAM = '@@global/SET_MEDIASTREAM',
    GET_MEDIASTREAM = '@@global/GET_MEDIASTREAM',
  }
  
  // Declare state types with `readonly` modifier to get compile time immutability.
  // https://github.com/piotrwitek/react-redux-typescript-guide#state-with-type-level-immutability
  export interface GlobalState {
    readonly mediaStream: any
  }