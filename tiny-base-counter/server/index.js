"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const synchronizer_ws_server_1 = require("tinybase/synchronizers/synchronizer-ws-server");
const ws_1 = require("ws");
// Something like this if you want to save Store state on the server:
// import {createMergeableStore} from 'tinybase';
// import {createFilePersister} from 'tinybase/persisters/persister-file';
const wsServer = (0, synchronizer_ws_server_1.createWsServer)(new ws_1.WebSocketServer({ port: 8043 }));
// -- Optional metrics handling hereon
wsServer.addClientIdsListener(null, () => updatePeakStats());
const stats = { paths: 0, clients: 0 };
(0, http_1.createServer)((request, response) => {
    if (request.url == '/metrics') {
        response.writeHead(200);
        response.write(`# HELP sub_domains The total number of sub-domains.\n`);
        response.write(`# TYPE sub_domains gauge\n`);
        response.write(`sub_domains 1\n`);
        response.write(`# HELP peak_paths The highest number of paths recently managed.\n`);
        response.write(`# TYPE peak_paths gauge\n`);
        response.write(`peak_paths ${stats.paths}\n`);
        response.write(`# HELP peak_clients The highest number of clients recently managed.\n`);
        response.write(`# TYPE peak_clients gauge\n`);
        response.write(`peak_clients ${stats.clients}\n`);
        updatePeakStats(1);
    }
    else {
        response.writeHead(404);
    }
    response.end();
}).listen(8044);
const updatePeakStats = (reset = 0) => {
    var _a, _b;
    if (reset) {
        stats.paths = 0;
        stats.clients = 0;
    }
    const newStats = wsServer.getStats();
    stats.paths = Math.max(stats.paths, (_a = newStats.paths) !== null && _a !== void 0 ? _a : 0);
    stats.clients = Math.max(stats.clients, (_b = newStats.clients) !== null && _b !== void 0 ? _b : 0);
};
