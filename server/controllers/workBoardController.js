
import { StatusCodes } from 'http-status-codes';
import { fetchWorkBoardAccessToken,  fetchWorkBoardUserInfo, getWorkBoardActivityService, getWorkBoardGoalService, getWorkBoardTeamService, getWorkBoardUserGoalService } from '../service/workBoardService.js';
import { WorkBoardMessages } from '../constants/enums.js';

export const getWorkBoardAccess = async (req, res) => {
  const { code, redirectUri } = req.body;
  try {
    const response = await fetchWorkBoardAccessToken(code, redirectUri);

    if (response.data.success) {
      const { access_token, refresh_token, scope, token_type } = response.data;
      res.status(StatusCodes.OK).json({
        accessToken: access_token,
        refreshToken: refresh_token,
        scope: scope,
        tokenType: token_type,
        message: WorkBoardMessages.WORKBOARD_FETCHED_SUCCESSFULLY,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN,
    });
  }
};


export const getWorkBoardUserInfo = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await fetchWorkBoardUserInfo(accessToken);

    if (response.data.success) {
      res.status(StatusCodes.OK).json({
        ...response.data,
        message: WorkBoardMessages.USER_INFO_FETCHED_SUCCESSFULLY,
      });
    } else {
      console.error(WorkBoardMessages.FETCH_USER_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_USER_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_INFO_ERROR,
    });
  }
};

// 

//----------------
export const getWorkBoardGoal = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const data = await getWorkBoardGoalService(accessToken);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_GOAL_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_GOAL_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_GOAL_INFO_ERROR,
    });
  }
};

//----------------
export const getWorkBoardActivity = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const data = await getWorkBoardActivityService(accessToken);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_ACTIVITY_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_ACTIVITY_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_ACTIVITY_INFO_ERROR,
    });
  }
};

//----------------
export const getWorkBoardTeam = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const data = await getWorkBoardTeamService(accessToken);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_TEAM_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_TEAM_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_TEAM_INFO_ERROR,
    });
  }
};

//----------------
export const getWorkBoardUserGoal = async (req, res) => {
  const { accessToken, userId } = req.body;

  try {
    const data = await getWorkBoardUserGoalService(accessToken, userId);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_USER_GOALS_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_USER_GOALS_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_GOALS_ERROR,
    });
  }
};