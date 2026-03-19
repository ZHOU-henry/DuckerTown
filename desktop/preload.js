const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("duckertown", {
  platform: process.platform
});
