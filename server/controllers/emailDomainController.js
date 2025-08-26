import { EmailDomainMessages } from "../constants/enums.js";
import { 
    createEmailDomain, 
    getAllEmailDomainsService, 
    getEmailDomainByIdService, 
    updateEmailDomainByIdService, 
    deleteEmailDomainByIdService 
} from "../service/emailDomainService.js";

export const authorizeEmailDomain = async (req, res) => {
    const { companyName, emailDomain } = req.body; 
    try {
        const newEmailDomain = await createEmailDomain({ companyName, emailDomain });
        res.status(201).json({ message: EmailDomainMessages.EMAIL_AUTHORIZED_SUCCESSFULLY, data: newEmailDomain });
    } catch (error) {
        res.status(400).json({ message: EmailDomainMessages.EMAIL_AUTHORIZED_FAILED, error: error.message });
    }
};

export const getAllEmailDomains = async (req, res) => {
    try {
        const emailDomains = await getAllEmailDomainsService();
        res.status(200).json(emailDomains);
    } catch (error) {
        res.status(400).json({ message: EmailDomainMessages.ERROR_FETCHING_EMAIL_DOMAIN, error: error.message });
    }
};

export const getEmailDomainById = async (req, res) => {
    const { id } = req.params;
    try {
        const emailDomain = await getEmailDomainByIdService(id);
        if (!emailDomain) {
            return res.status(404).json({ message: EmailDomainMessages.EMAIL_DOMAIN_NOT_FOUND });
        }
        res.status(200).json(emailDomain);
    } catch (error) {
        res.status(400).json({ message: EmailDomainMessages.ERROR_FETCHING_EMAIL_DOMAIN, error: error.message });
    }
};

export const updateEmailDomainById = async (req, res) => {
    const { id } = req.params;
    const { companyName, emailDomain } = req.body;
    try {
        const updatedEmailDomain = await updateEmailDomainByIdService(id, { companyName, emailDomain });
        if (!updatedEmailDomain) {
            return res.status(404).json({ message: EmailDomainMessages.EMAIL_DOMAIN_NOT_FOUND });
        }
        res.status(200).json({ message: EmailDomainMessages.EMAIL_DOMAIN_UPDATED_SUCCESSFULLY, data: updatedEmailDomain });
    } catch (error) {
        res.status(400).json({ message: EmailDomainMessages.EMAIL_DOMAIN_UPDATE_FAILED, error: error.message });
    }
};

export const deleteEmailDomainById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEmailDomain = await deleteEmailDomainByIdService(id);
        if (!deletedEmailDomain) {
            return res.status(404).json({ message: EmailDomainMessages.EMAIL_DOMAIN_NOT_FOUND });
        }
        res.status(200).json({ message: EmailDomainMessages.EMAIL_DOMAIN_DELETED_SUCCESSFULLY });
    } catch (error) {
        res.status(400).json({ message: EmailDomainMessages.EMAIL_DOMAIN_DELETE_FAILED, error: error.message });
    }
};
