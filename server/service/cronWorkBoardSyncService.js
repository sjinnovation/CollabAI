import { syncWorkBoardStream, syncWorkBoardStreamWithCron } from "../controllers/workBoardController.js";
import connectAppsAuth from "../models/connectAppsAuthModel.js";
import { getWorkStreamListWithInfo } from "./workBoardService.js";

// Helper to call syncWorkBoardStream as a function, not as an Express handler
async function syncStreamForUser(userId, wsId, wsTitle) {
  // Fake req/res objects for controller
  const req = { params: { userId }, body: { wsId, wsTitle } };
  const res = {
    status: () => ({ json: () => {} }),
    json: () => {},
  };
  await syncWorkBoardStream(req, res);
}

export const cronSyncAllWorkBoardStreams = async ()=>{
  const allConnections = await connectAppsAuth.find({ appName: 'work-board' });
  for (const conn of allConnections) {
    const userId = conn.userId.toString();
    const accessToken = conn.accessToken;
    const workStreams = await getWorkStreamListWithInfo(accessToken, userId);
    for (const ws of workStreams) {
      await syncWorkBoardStreamWithCron(userId, ws.ws_id, ws.ws_name);
    }
  }
}