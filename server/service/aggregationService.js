//TODO: Delete file as none of its functions are called
import User from '../models/user.js';
import Uprompt from '../models/userPromptModel.js';
import promptModel from '../models/promptModel.js';
import Company from '../models/companyModel.js';

export const getCompanyProposalCount = async (companyId) => {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let promptdate = year + "-" + month + "-" + date;

    const users = await User.find({companyId: companyId}, {_id: 1});
    const userIds = users.map(user => user._id);
    const prompts = await Uprompt.find({userid: {$in: userIds}, promptdate: promptdate});
    const promptCount = prompts.map(prompt => prompt.count);
    const total = promptCount.reduce((a, b) => a + b, 0);
    return total;
}

export const getCompanyPromptCount = async (companyId) => {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let promptdate = year + "-" + month + "-" + date;
    const users = await User.find({companyId: companyId}, {_id: 1});
    const userIds = users.map(user => user._id);
    const promtCount = await promptModel.countDocuments({userid: {$in: userIds}, promptdate: promptdate});
    console.log(promtCount);
    return promtCount;

}

export const getCompanyPromptsByDate = async (date) => {
    let promptdate = date;
    if(!date){
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        promptdate = year + "-" + month + "-" + date;
    }
    const companies = await Company.find({});
    let companyPrompts = [];
    for(let i = 0; i < companies.length; i++){
        const company = companies[i];
        const users = await User.find({companyId: company._id}, {_id: 1});
        const userIds = users.map(user => user._id);
        const prompts = await Uprompt.find({userid: {$in: userIds}, promptdate: promptdate});
        const promptCount = prompts.map(prompt => prompt.count);
        const total = promptCount.reduce((a, b) => a + b, 0);
        companyPrompts.push({name: company.name, email:company.email, status :company.status, prompts: total});
        
    }
    companyPrompts.sort((a, b) => (a.prompts > b.prompts) ? -1 : 1);
    return companyPrompts;

}

export const getUsersPromptCountByDate = async (date) => {
    let promptdate = date;
    if(!date){
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        promptdate = year + "-" + month + "-" + date;
    }
    const users = await User.find({});
    let userPrompts = [];
    for(let i = 0; i < users.length; i++){
        const prompts = await Uprompt.findOne({userid: users[i]._id, promptdate: promptdate});
        const promptCount = prompts?.count || 0;
        userPrompts.push({name: users[i].fname +" "+ users[i].lname, email:users[i].email, status :users[i].status, prompts: promptCount});
    }
    userPrompts.sort((a, b) => (a.prompts > b.prompts) ? -1 : 1);
    return userPrompts;
}
//export default {getCompanyProposalCount, getCompanyPromptCount}; 