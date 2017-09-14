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

import PropTypes from 'prop-types'
import classNames from 'classnames'
import {connect} from 'react-redux'

import {togglePeerMute} from 'actions/meetingMedia'

import Thumbnail from 'components/Thumbnail'

const mapStateToProps = ({meeting, meetingMedia}) => ({
  muted: meetingMedia.muted,
  peerId: meeting.ownId,
  element: meetingMedia.thumbnailElements[meeting.ownId] || null,
  connectionState: 'connected',
  errorState: null,
  hasMutedSelf: !!meetingMedia.peersWithMute[meeting.ownId],
})

const mapDispatchToProps = (dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(Thumbnail)
