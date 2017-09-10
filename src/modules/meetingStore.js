/*
Copyright 2016 Ericsson AB.

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

import {LOG_TAG} from 'modules/config'
import {log} from '@cct/libcct'
import argCheck from '@cct/arg-check'

import {SingleValueStore} from 'modules/storage'

const meetingStore = new SingleValueStore({
  store: localStorage,
  key: 'meet-stored-meetings',
})

export function addMeeting({meetingId, meetingName, meetingTime}) {
  if (!meetingId) {
    throw new TypeError(`Invalid meetingId: '${meetingId}'`)
  }
  if (!meetingName) {
    throw new TypeError(`Invalid meetingName: '${meetingName}'`)
  }
  if (!meetingTime) {
    throw new TypeError(`Invalid meetingTime: '${meetingTime}'`)
  }

  let meetings = meetingStore.load()

  meetings[meetingId] = {meetingName, meetingTime}

  meetingStore.store(meetings)

  return meetings
}

export function removeMeeting(meetingId) {
  if (!meetingId) {
    throw new TypeError(`Invalid meetingId: '${meetingId}'`)
  }

  let meetings = meetingStore.load()

  let deleted = delete(meetings[meetingId])
  if (deleted) {
    meetingStore.store(meetings)
  }
  return deleted ? meetings : null
}

export function listMeetingsByTime(descending) {
  let order = Math.sign(descending - 0.5)
  let sorted = listMeetings().sort((a, b) => {
    return a.meetingTime - b.meetingTime * order
  })

  return sorted
}

export function listMeetingsByName(descending) {
  let order = Math.sign(descending - 0.5)
  let sorted = listMeetings().sort((a, b) => {
    if (a.meetingName < b.meetingName) {
      return -1 * order
    }
    if ( a.meetingName > b.meetingName) {
      return 1 * order
    }
    return 0
  })

  return sorted
}

export function clear() {
  meetingStore.clear()
}

function listMeetings() {
  let obj = meetingStore.load()
  let meetingList = []

  if (typeof(obj) !== 'object' || obj === null) {
    return meetingList
  }
  for (let meeting of Object.values(obj)) {
    meetingList.push(meeting)
  }

  return meetingList
}
