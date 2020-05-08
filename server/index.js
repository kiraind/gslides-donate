process.title = 'dayte-denyak'

const httpFileServer = require('./httpFilesNReg')
const { clientWebSocket, SendToClients } = require('./clientWebSocket')
const { SendToExt } = require('./extensionServer')
const MessageHandlers = require('./confirmer')

// start

MessageHandlers.push(SendToClients, SendToExt)

httpFileServer.listen(1488)