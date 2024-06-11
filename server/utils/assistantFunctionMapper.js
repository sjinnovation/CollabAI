import { createCompanyData, deleteCompanyData, getCompanyData, updateCompanyData } from "../service/postgreService.js";
import { meeting_summary } from "./assistant.js";

export const assistantFuncMap = {
    'meeting_summary': async (argument) => await meeting_summary(argument.start_date, argument.end_date, argument.meeting_type || []),
    'query_for_get_data': async (argument) => await getCompanyData(argument.query),
    'query_for_create_data': async (argument) => await createCompanyData(argument.query),
    'query_for_update_data': async (argument) => await updateCompanyData(argument.query),
    'query_for_delete_data': async (argument) => await deleteCompanyData(argument.query),
};