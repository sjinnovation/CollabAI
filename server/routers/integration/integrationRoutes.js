import express from 'express';
import authenticateUser from '../../middlewares/login.js';
import multer from 'multer';
import { getServiceList, addService , addServiceCredentials, deleteServiceCreds, addApiEndpoint, deleteApiEndpoint, getServiceCredentials, getService, oauthConnect, handleRedirect, updateServiceStatus, deleteService, updateService, getServiceCredentialsId} from '../../controllers/integration/integrationController.js';
import { getServiceApis, getUsersApiList,checkServiceUser, getServiceApiDetails  } from '../../controllers/integration/apilistController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "icons/"); 
    },
    filename: (req, file, cb) => {
      const uniqueFilename = file.originalname;
      cb(null, uniqueFilename);
    },
  });
const upload = multer({ storage: storage });
const integrationRouter = express.Router();

integrationRouter.post('/service/integrate',authenticateUser,addServiceCredentials);
integrationRouter.post('/service/oauth/connect',authenticateUser,oauthConnect);
integrationRouter.get('/service/oauth/connect',handleRedirect);
integrationRouter.post("/service/check",authenticateUser, checkServiceUser);

integrationRouter.post('/service/disconnect',authenticateUser,deleteServiceCreds);
integrationRouter.post('/service/verify',getServiceCredentials);
integrationRouter.post('/service/id/verify',getServiceCredentialsId);

integrationRouter.get('/service/list',authenticateUser,getServiceList);
integrationRouter.get('/service/:service_id',authenticateUser,getService);
integrationRouter.delete('/service/:service_id',authenticateUser,deleteService);


integrationRouter.post('/service/add',authenticateUser,upload.single('service_icon'),addService);
integrationRouter.patch('/service/update/:id',authenticateUser,upload.single('service_icon'),updateService);
integrationRouter.post('/service/add/endpoint',addApiEndpoint);


integrationRouter.post('/service/api/list',authenticateUser,getServiceApis);
integrationRouter.post('/service/users/api/list',authenticateUser,getUsersApiList);
integrationRouter.delete('/service/api/delete/:api_id',authenticateUser,deleteApiEndpoint);
integrationRouter.patch('/update-service-status/:service_id',authenticateUser, updateServiceStatus);
integrationRouter.get('/get-service-api-details',getServiceApiDetails);


export default integrationRouter;