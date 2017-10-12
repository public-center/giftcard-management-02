import io from 'socket.io-client';

export class SocketService {
  constructor(socketFactory) {
    'ngInject';

    // Listen on API port
    const ioSocket = io('http://localhost:9000', {
      path: '/socket.io-client',
      secure: true
    });

    // Socket
    this.socket = socketFactory({
      ioSocket: ioSocket
    });
  }

  syncCardUpdates(modelName, callBacks) {
    /**
     * Syncs item creation/updates on 'model:save'
     */
    this.socket.on(modelName + ':save', function (item) {
      callBacks.save(item);
    });

    this.socket.on('card:outOfRuns', cardId => {
      callBacks.outOfRuns(cardId);
    })
  }

  /**
   * Sync inventory from socket
   * @param callbacks
   */
  syncInventory(callbacks) {
    this.socket.on('inventory:updateInventory', function (inventory) {
      callbacks.updateInventory(inventory);
    })
  }

  /**
   * Removes listeners for a models updates on the socket
   *
   * @param modelName
   */
  unsyncUpdates(modelName) {
    this.socket.removeAllListeners(modelName + ':save');
    this.socket.removeAllListeners(modelName + ':remove');
  }
}
