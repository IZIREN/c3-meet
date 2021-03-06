/*
Copyright 2017 Ericsson AB.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {
  LEAVE_MEETING,
  MEETING_SETUP_COMPLETE,
  ROOM_MEMBER_PRESENCE_CHANGES,
  CONFERENCE_PEER_UPSERT,
  CONFERENCE_PEER_REMOVED,
} from 'actions/constants'

const initialState = {
  peers: {},
  onlineMembers: {},
}

export default function meetingHistory(state = initialState, action) {
  switch (action.type) {
    case LEAVE_MEETING: // intentional fallthough
    case MEETING_SETUP_COMPLETE: {
      return initialState
    }
    case CONFERENCE_PEER_UPSERT: {
      let {type: ignored, peerId, ...config} = action
      let currentConfig = state.peers[peerId] || {}
      return {...state, peers: {...state.peers, [peerId]: {...currentConfig, ...config}}}
    }
    case CONFERENCE_PEER_REMOVED: {
      let {[action.peerId]: ignored, ...peers} = state.peers
      return {...state, peers}
    }
    case ROOM_MEMBER_PRESENCE_CHANGES: {
      let {online, offline} = action
      let onlineMembers = {...state.onlineMembers}
      if (online) {
        online.forEach(user => {
          onlineMembers[user.id] = user
        })
      }
      if (offline) {
        offline.forEach(user => {
          delete onlineMembers[user.id]
        })
      }
      return {...state, onlineMembers}
    }
    default:
      return state
  }
}
