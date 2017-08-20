import { addUserHandler, disconnectHandler, newMessageHandler, stopTypingHandler, typingHandler } from './handlers'

export const urls = new Map([
  ['new message', newMessageHandler],
  ['add user', addUserHandler],
  ['typing', typingHandler],
  ['stop typing', stopTypingHandler],
  ['disconnect', disconnectHandler]
  // ['disconnecting', disconnectingHandler]
  // ['error', disconnectHandler]
])
