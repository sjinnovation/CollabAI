import { meeting_summary } from "../service/assistantService.js";

// Map of assistant functions for tools - function callings
export const assistantFuncMap = {
    'meeting_summary': async (argument) => await meeting_summary(argument.start_date, argument.end_date, argument.meeting_type || []),
};