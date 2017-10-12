'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Broadcast when a card update happens on the backend
 * @type {*|exports|module.exports}
 */
var card = require('./card.model');

/**
 * Expose socket
 * @type {{socket: null, setSocket: (function(*))}}
 */
var exposeSocket = {
  socket: null,
  setSocket: function setSocket(socket) {
    this.socket = socket;
  }
};

/**
 * Expose socket so that we can emit out of runs
 */
var outOfRuns = exports.outOfRuns = Object.assign({}, exposeSocket, {
  outOfRuns: function outOfRuns(cardId) {
    if (this.socket) {
      this.socket.emit('card:outOfRuns', cardId);
    }
  }
});

/**
 * Update inventory
 */
var updateInventory = exports.updateInventory = Object.assign({}, exposeSocket, {
  socketUpdate: function socketUpdate(inventory) {
    if (this.socket) {
      this.socket.emit('inventory:updateInventory', inventory);
    }
  }
});

exports.register = function (socket) {
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
//# sourceMappingURL=card.socket.js.map
