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
  UPDATE_CREATE_MEETING_NAME_INPUT,
  CREATE_MEETING_STARTED,
  CREATE_MEETING_COMPLETE,
  CREATE_MEETING_FAILED,
  UPDATE_JOIN_MEETING_NAME_INPUT,
  MEETING_SETUP_STARTED,
  MEETING_SETUP_COMPLETE,
  MEETING_SETUP_FAILED,
  LEAVE_MEETING,
  CONFERENCE_PEER_UPSERT,
  CONFERENCE_PEER_REMOVED,
  CONFERENCE_CONNECTION_STATE,
  CONFERENCE_CONNECTION_ERROR,
  CONFERENCE_THUMBNAILS_ADDED,
  CONFERENCE_THUMBNAILS_REMOVED,
} from 'actions/constants'

import {MediaBroadcaster, ThumbnailBroadcaster} from '@cct/libcct'
import {push} from 'react-router-redux'

import {
  createMeeting as _createMeeting,
  joinMeeting as _joinMeeting,
} from 'modules/meetingSetup'
import namegen from 'modules/namegen'

export function generateCreateMeetingName() {
  return {type: UPDATE_CREATE_MEETING_NAME_INPUT, meetingName: namegen()}
}

export function updateCreateMeetingNameInput(meetingName) {
  return {type: UPDATE_CREATE_MEETING_NAME_INPUT, meetingName}
}

export function createMeeting(meetingName) {
  return (dispatch, getState) => {
    let {client, meetingSetup} = getState()
    if (meetingSetup.joinInProgress) {
      return
    }

    dispatch({type: LEAVE_MEETING})
    dispatch({type: MEETING_SETUP_STARTED, meetingName})
    dispatch(push(`/${meetingName}`))

    _createMeeting({client: client.client, meetingName}).then(room => {
      dispatch({type: MEETING_SETUP_COMPLETE, ...initializeConference(room, dispatch, getState)})
    }, error => {
      dispatch({type: MEETING_SETUP_FAILED, error})
    })
  }
}

export function updateJoinMeetingNameInput(meetingName) {
  return {type: UPDATE_JOIN_MEETING_NAME_INPUT, meetingName}
}

export function joinMeeting({meetingName, navigate = false}) {
  return (dispatch, getState) => {
    let {client, meetingSetup, meeting} = getState()
    if (meetingSetup.joinInProgress) {
      return
    }
    if (meeting.room && meeting.room.name === meetingName) {
      if (navigate) {
        dispatch(push(`/${meetingName}`))
      }
      return
    }

    dispatch({type: LEAVE_MEETING})
    dispatch({type: MEETING_SETUP_STARTED, meetingName})
    if (navigate) {
      dispatch(push(`/${meetingName}`))
    }

    _joinMeeting({client: client.client, meetingName}).then(room => {
      dispatch({type: MEETING_SETUP_COMPLETE, ...initializeConference(room, dispatch, getState)})
    }, error => {
      dispatch({type: MEETING_SETUP_FAILED, error})
    })
  }
}

export function leaveMeeting(meetingName) {
  return (dispatch, getState) => {
    let {meeting} = getState()
    if (meeting.room) {
      meeting.room.leave()
      dispatch({type: LEAVE_MEETING})
    }
  }
}

function initializeConference(room, dispatch, getState) {
  let conference = room.startConference({
    switcherMode: 'automatic',
  })
  let {connectionState} = conference

  let audioBroadcaster = new MediaBroadcaster()
  conference.attach('audio', audioBroadcaster)

  let thumbnailBroadcaster = new ThumbnailBroadcaster({
    projectionConfiguration: {
      width: 100,
      aspectRatio: 16 / 9,
      contentMode: 'aspectFill',
    },
    videoFrameRate: 10,
    imageFrameRate: 2,
  })
  conference.attach('thumbnails', thumbnailBroadcaster)
  let thumbnailRenderer = thumbnailBroadcaster.createRenderer(/*{elementClass: '...'}*/)

  function onPeerAdded(peerId, peer) {
    const onUpdate = () => {
      dispatch({
        type: CONFERENCE_PEER_UPSERT,
        peerId,
        errorState: peer.errorState,
        connectionState: peer.connectionState,
      })
    }
    peer.on('connectionState', onUpdate)
    peer.on('errorState', onUpdate)

    dispatch({
      type: CONFERENCE_PEER_UPSERT,
      peerId,
      errorState: peer.errorState,
      connectionState: peer.connectionState,
    })
  }
  function onPeerRemoved(peerId) {
    dispatch({type: CONFERENCE_PEER_REMOVED, peerId})
  }

  function onConnectionState(connectionState) {
    dispatch({type: CONFERENCE_CONNECTION_STATE, connectionState})
  }

  function onError(error) {
    log.error(LOG_TAG, `encountered conference error, ${error}`)
    dispatch({type: CONFERENCE_CONNECTION_ERROR, error})
  }

  function onThumbnailsAdded(elements) {
    dispatch({type: CONFERENCE_THUMBNAILS_ADDED, elements})
  }

  function onThumbnailsRemoved(elements) {
    dispatch({type: CONFERENCE_THUMBNAILS_REMOVED, elements})
  }

  conference.peers.on('added', onPeerAdded)
  conference.peers.on('removed', onPeerRemoved)
  conference.on('connectionState', onConnectionState)
  conference.on('error', onError)
  thumbnailRenderer.on('added', onThumbnailsAdded)
  thumbnailRenderer.on('removed', onThumbnailsRemoved)

  let unsubscribe = () => {
    conference.peers.off('added', onPeerAdded)
    conference.peers.off('removed', onPeerRemoved)
    conference.off('connectionState', onConnectionState)
    conference.off('error', onError)
    thumbnailRenderer.off('added', onThumbnailsAdded)
    thumbnailRenderer.off('removed', onThumbnailsRemoved)
  }
  return {
    room,
    conference,
    audioBroadcaster,
    thumbnailBroadcaster,
    thumbnailRenderer,
    connectionState,
    unsubscribe,
  }
}
