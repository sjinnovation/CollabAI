import EmailDomain from "../models/emailDomainModel.js";

export const createEmailDomain = async (data) => {
    const newEmailDomain = new EmailDomain(data);
    return await newEmailDomain.save();
};

export const getAllEmailDomainsService = async () => {
    return await EmailDomain.find({}).sort({ _id: -1 }); 
};

export const getEmailDomainByIdService = async (id) => {
    return await EmailDomain.findById(id);
};

export const updateEmailDomainByIdService = async (id, data) => {
    return await EmailDomain.findByIdAndUpdate(id, data, { new: true });
};

export const deleteEmailDomainByIdService = async (id) => {
    return await EmailDomain.findByIdAndDelete(id);
};
