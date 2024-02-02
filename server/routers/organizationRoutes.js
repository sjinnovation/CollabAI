import express from 'express';
import authenticateUser from '../middlewares/login.js';

// controllers
import * as organization_controllers from '../controllers/organizationController.js';

const router = express.Router();

router.get('/', authenticateUser, organization_controllers.getAllOrganizations);
router.post('/', authenticateUser, organization_controllers.createOrganization);
router.patch('/:id', authenticateUser, organization_controllers.updateOrganization);
router.delete('/:id', authenticateUser, organization_controllers.deleteOrganizationById);

export default router;
