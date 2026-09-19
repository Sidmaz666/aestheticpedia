'use client'

// react-audio-canvas (by Sidmaz666) ships a bundled copy of React 18's JSX runtime that reads
// React 18's internals object when the module loads. React 19 no longer has that object, so
// the import would throw. We only use the library's hooks (`useAudio`, `detectNote`), which
// render no elements, so a stand-in for the two fields that runtime reads is enough.
// Import this module on the line before `react-audio-canvas`: ESM evaluates imports in order.
import React from 'react'

type Internals = { ReactCurrentOwner: { current: null }; ReactDebugCurrentFrame: { getStackAddendum: () => string } }
const R = React as unknown as { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: Internals }
R.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ??= {
  ReactCurrentOwner: { current: null },
  ReactDebugCurrentFrame: { getStackAddendum: () => '' },
}

export {}
