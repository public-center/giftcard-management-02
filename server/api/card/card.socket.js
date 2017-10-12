/**
 * Broadcast when a card update happens on the backend
 * @type {*|exports|module.exports}
 */
const card = require('./card.model');

/**
 * Expose socket
 * @type {{socket: null, setSocket: (function(*))}}
 */
const exposeSocket = {
  socket: null,
  setSocket(socket) {
    this.socket = socket;
  }
};

/**
 * Expose socket so that we can emit out of runs
 */
export const outOfRuns = Object.assign({}, exposeSocket, {
  outOfRuns(cardId) {
    if (this.socket) {
      this.socket.emit('card:outOfRuns', cardId);
    }
  }
});

/**
 * Update inventory
 */
export const updateInventory = Object.assign({}, exposeSocket, {
  socketUpdate(inventory) {
    if (this.socket) {
      this.socket.emit('inventory:updateInventory', inventory);
    }
  }
});

exports.register = function(socket) {
  card.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  card.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  // Expose socket for external methods
  outOfRuns.setSocket(socket);
  // Expose inventory update
  updateInventory.setSocket(socket);
};

function onSave(socket, doc, cb) {
  socket.emit('card:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('card:remove', doc);
}
