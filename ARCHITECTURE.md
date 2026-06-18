# LivePoly Client Architecture

## Frontend Concerns

- Room mobile layout must keep the primary room actions visible without pushing
  Start game and related controls below the fold.
- Room lobby membership/start state updates through the room SSE stream, which
  invalidates room, current-room, and live-room queries when the backend
  publishes `room.updated`.
- Game mobile layout should prioritize the board and action flow; game state
  belongs below the main play surface on small screens.
- Auction and trade need dedicated flows or panels instead of sharing the roll
  action space or hiding trade inside the properties panel.
- Trade should be discoverable before users need it, and involved human users
  should get clear feedback when a trade is sent, accepted, rejected, or
  cancelled.
- Square inspection should show whether a square is unowned or who owns it, and
  should show house/hotel state for buildable properties.
- Build and mortgage actions should prevent impossible choices where practical,
  and command rejections should be surfaced as clear user-facing feedback.
- Finished games need a cleaner results state: no "you are not part of this
  game" copy when the viewer just finished playing, and results should feel
  immediate once saved.
- Stats copy should make clear that only ranked games change rating, while
  games played and placements include completed casual games too.
