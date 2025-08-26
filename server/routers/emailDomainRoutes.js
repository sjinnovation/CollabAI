import express from 'express';
import { 
    authorizeEmailDomain, 
    getAllEmailDomains, 
    getEmailDomainById, 
    updateEmailDomainById, 
    deleteEmailDomainById 
} from '../controllers/emailDomainController.js';
import authenticateUser from '../middlewares/login.js';

const emailDomainRoutes = express.Router();

emailDomainRoutes.post('/authorize', authenticateUser, authorizeEmailDomain);
emailDomainRoutes.get('/', getAllEmailDomains);
emailDomainRoutes.get('/:id',authenticateUser, getEmailDomainById);
emailDomainRoutes.patch('/:id',authenticateUser, updateEmailDomainById);
emailDomainRoutes.delete('/:id',authenticateUser, deleteEmailDomainById);

export default emailDomainRoutes;
