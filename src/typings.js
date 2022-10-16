/**
 * @typedef TypeChatMessageIncoming
 * @property {string} author - Message author OR Message content itself, if current user is the author
 * @property {string} content - Message content
 * @property {string} provider - Message provider, e.g. YouTube, Trovo and so on
 */

/**
 * @typedef TypeChatMessageOutgoing
 * @property {string} content - Message content
 */

/**
 * @typedef TypeWebSocketPongMessage
 */

/**
 * @typedef TypeWebSocketMessage
 * @property {string} type - Message type
 * @property {TypeChatMessageIncoming} message - Message itself
 */

/**
 * @typedef TypeWindowConfig
 * @property {number} width - Window width
 * @property {number} height - Window height
 * @property {string} folder - Valid window folder name
 * @property {string} [template] - Window HTML template name without extension
 */
