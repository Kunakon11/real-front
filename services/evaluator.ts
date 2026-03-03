import api from './api';

export const getEvaluationsForEvaluator = async (evaluationId?: number) => {
    const url = evaluationId ? `/evaluator/evaluations/${evaluationId}` : `/evaluator/evaluations`;
    const response = await api.get(url);
    return response.data;
};

export const getAssignmentForEvaluator = async (assignmentId: number) => {
    const response = await api.get(`/evaluator/assignments/${assignmentId}`);
    return response.data;
};

export const giveScore = async (assignmentId: number, data: any) => {
    const response = await api.post(`/evaluator/assignments/${assignmentId}/score`, data);
    return response.data;
};
