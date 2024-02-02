import Company from "../models/companyModel.js";

export const getOrganizationById = async (orgId) => {
    const organization = await Company.findById(orgId);

    return organization;
}