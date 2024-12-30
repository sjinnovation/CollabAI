// Required Imports
import xlsx from 'xlsx';
import multer from 'multer';
import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import TechStack from '../models/tech_stack.js';
import Teams from '../models/teamModel.js';
import Features from '../models/featureModel.js';
import Client from '../models/clientModel.js';
import ProjectTeam from '../models/projectTeamModel.js';
import User from '../models/user.js';

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed!'), false);
        }
    }
}).single('file');


const parseExcelFile = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
};

// Utility function to find or create a document in a collection
const findOrCreate = async (Model, query, data) => {
    try {
        const existing = await Model.findOne(query);
        if (existing) return existing._id;

        const newDocument = new Model(data);
        await newDocument.save();
        return newDocument._id;
    } catch (error) {
        console.error(`Error in findOrCreate (${Model.modelName}):`, error);
        throw error;
    }
};

// Controller function for importing Excel data
export const importExcelData = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const jsonDataArray = parseExcelFile(req.file.buffer);
            const results = [];

            for (const data of jsonDataArray) {
                try {
                    // Handle TechStack
                    const techStackIds = [];
                    if (typeof data.techStackName === 'string') {
                        const techStackArray = data.techStackName.split(',').map(tech => tech.trim()); // Split and trim
                        for (const techName of techStackArray) {
                            try {
                                const techId = await findOrCreate(TechStack, { name: techName }, { name: techName });
                                techStackIds.push(techId);
                            } catch (error) {
                                console.error(`Error creating tech stack "${techName}":`, error.message);
                            }
                        }
                    } else {
                        console.warn(`TechStack is not a string for project "${data.name}"`);
                    }

                    // Handle Team
                    const teamId = await findOrCreate(Teams, { teamTitle: data.teamTitle }, {
                        teamTitle: data.teamTitle,
                        teamDescriptions: data.teamDescriptions
                    });

                    // Handle Client
                    const clientId = await findOrCreate(Client, { name: data.client_name }, {
                        name: data.client_name,
                        description: data.client_description,
                        contact_info: data.client_contact_info,
                        point_of_contact: data.client_point_of_contact,
                        image: data.client_image
                    });

                    // Handle Features
                    const featureIds = [];
                    if (typeof data.feature === 'string') {
                        const featureArray = data.feature.split(',').map(feature => feature.trim());
                        for (const featureName of featureArray) {
                            try {
                                const featureId = await findOrCreate(Features, { name: featureName }, { name: featureName });
                                featureIds.push(featureId);
                            } catch (error) {
                                console.error(`Error processing feature "${featureName}" for project "${data.name}":`, error.message);
                            }
                        }
                    } else {
                        console.warn(`Feature is not a string for project "${data.name}"`);
                    }

                  
                    const membersData = data['Member Name and Role'] ? data['Member Name and Role'].split(',').map((entry) => {
                        const [memberName, role] = entry.trim().split(' - '); // Split by " - "
                        return { name: memberName.trim(), role: role.trim() };
                    }) : [];

                    const projectData = {
                        name: data.name,
                        description: data.description,
                        status: data.status,
                        start_time: new Date(data.start_time),
                        end_time: new Date(data.end_time),
                        budget: data.budget,
                        hr_taken: data.hr_taken,
                        client_id: clientId,
                        techStack: techStackIds,
                        links: {
                            links: data.links_url,
                            github: data.github_url
                        },
                        image_link: data.image_link,
                        team_id: teamId,
                        feature: featureIds
                    };

                    const project = new Project(projectData);
                    await project.save();


                    const projectId = project._id;

                    // Handle Member creation after Project creation
                    for (const member of membersData) {
                        if (!member.name || !member.role) {
                            console.warn(`Skipping member with missing name or role in project "${data.name}"`);
                            continue;
                        }

                        try {
                            let user = await User.findOne({ fname: member.name });
                            if (!user) {
                                console.error(`User "${member.name}" not found. Import process stopped.`);
                                return res.status(400).json({
                                    message: `User "${member.name}" not found. Import process stopped. No data imported.`
                                });
                            }

                          
                            const projectTeamData = {
                                project_id: projectId, // Now associating the user with the created project
                                user_id: user._id,
                                role_in_project: member.role, 
                                team_id: teamId
                            };

                            const projectTeam = new ProjectTeam(projectTeamData);
                            await projectTeam.save();
                        } catch (error) {
                            console.error(`Error processing member "${member.name}" in project "${data.name}":`, error.message);
                        }
                    }

                    results.push(`Project "${data.name}" imported successfully`);
                } catch (innerError) {
                    console.error(`Error importing project "${data.name}":`, innerError);
                    results.push(`Error importing project "${data.name}": ${innerError.message}`);
                }
            }

            res.status(200).json({
                message: 'Import completed',
                results
            });
        } catch (error) {
            console.error('Error during import:', error);
            res.status(500).json({
                message: 'Error during import',
                error: error.message
            });
        }
    });
};
