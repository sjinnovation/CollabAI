import express from 'express';
import { getAllProjects } from '../controllers/projectController.js';
import { getAllClients } from '../controllers/clientController.js';
import { getAllTeams } from '../controllers/projectTeamController.js';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const [projects, clients, teams] = await Promise.all([
      getAllProjects(req, { json: (data) => data }),
      getAllClients(req, { json: (data) => data }),
      getAllTeams(req, { json: (data) => data })
    ]);

    const searchData = [
      ...projects.map(p => ({ id: p._id, name: p.name, type: 'project' })),
      ...clients.map(c => ({ id: c._id, name: c.name, type: 'client' })),
      ...teams.map(t => ({ id: t._id, name: t.teamTitle, type: 'team' }))
    ];

    res.status(200).json(searchData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching search data", error: error.message });
  }
});

export default router;