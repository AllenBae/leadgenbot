import socketio from 'socket.io';

let _the_io = null;

export default class SocketIoHelper {
  static startWebsocketServer(express_server) {
    _the_io = socketio(express_server);
    _the_io.on('connection', (_client) => {
    });
  }

  static sendJsonMessageToAllClients(msg, datajson) {
    if (_the_io) {
      _the_io.emit(msg, datajson);
    }
  }
}
