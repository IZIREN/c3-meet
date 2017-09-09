
import {
  UPDATE_CLIENT,
  AUTHENTICATE_CLIENT_STARTED,
  AUTHENTICATE_CLIENT_COMPLETE,
  AUTHENTICATE_CLIENT_FAILED,
  SET_STORED_DISPLAY_NAME,
  UPDATE_DISPLAY_NAME_INPUT,
  SET_DISPLAY_NAME_STARTED,
  SET_DISPLAY_NAME_COMPLETE,
  SET_DISPLAY_NAME_FAILED,
} from 'actions/constants'

const initialState = {
  client: null,
  ownUser: null,
  displayName: null,
  connectionState: null,

  authenticated: false,
  authenticateInProgress: false,
  authenticateClientError: null,

  storedDisplayName: '',
  displayNameInput: '',
  setDisplayNameInProgress: false,
  setDisplayNameError: null,
}

export default function client(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CLIENT: {
      let {client, ownUser, displayName, connectionState} = action
      return {...state, client, ownUser, displayName, connectionState}
    }
    case AUTHENTICATE_CLIENT_STARTED: {
      return {...state, authenticateInProgress: true, authenticateClientError: null}
    }
    case AUTHENTICATE_CLIENT_COMPLETE: {
      return {...state, authenticateInProgress: false, authenticateClientError: null}
    }
    case AUTHENTICATE_CLIENT_FAILED: {
      let {error} = action
      return {...state, authenticateInProgress: false, authenticateClientError: error}
    }
    case SET_STORED_DISPLAY_NAME: {
      let {storedDisplayName} = action
      return {...state, storedDisplayName}
    }
    case UPDATE_DISPLAY_NAME_INPUT: {
      let {displayName} = action
      return {...state, displayNameInput: displayName}
    }
    case SET_DISPLAY_NAME_STARTED: {
      return {...state, setDisplayNameInProgress: true, displayNameInput: initialState.displayNameInput}
    }
    case SET_DISPLAY_NAME_COMPLETE: {
      // This should really happen through an UPDATE_CLIENT action, but synapse doesn't give us
      // presence events for ourselves unless we're in a room.
      let {displayName} = action
      return {...state, setDisplayNameInProgress: false, setDisplayNameError: null, displayName}
    }
    case SET_DISPLAY_NAME_FAILED: {
      let {error} = action
      return {...state, setDisplayNameInProgress: false, setDisplayNameError: error}
    }
    default:
      return state
  }
}
