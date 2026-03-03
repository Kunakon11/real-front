import api from './api';

export const getAdminEvaluations = async () => {
    const response = await api.get('/admin/evaluations');
    return response.data;
};

export const createAdminEvaluation = async (data: any) => {
    const response = await api.post('/admin/evaluations', data);
    return response.data;
};

export const updateAdminEvaluation = async (id: number, data: any) => {
    const response = await api.patch(`/admin/evaluations/${id}`, data);
    return response.data;
};

export const deleteAdminEvaluation = async (id: number) => {
    const response = await api.delete(`/admin/evaluations/${id}`);
    return response.data;
};

// ... topics, indicators, assignments
export const createTopic = async (evaluationId: number, data: any) => {
    const response = await api.post(`/admin/evaluations/${evaluationId}/topics`, data);
    return response.data;
};

export const updateTopic = async (topicId: number, data: any) => {
    const response = await api.patch(`/admin/topics/${topicId}`, data);
    return response.data;
};

export const deleteTopic = async (topicId: number) => {
    const response = await api.delete(`/admin/topics/${topicId}`);
    return response.data;
};

export const createIndicator = async (topicId: number, data: any) => {
    const response = await api.post(`/admin/topics/${topicId}/indicators`, data);
    return response.data;
};

export const updateIndicator = async (indicatorId: number, data: any) => {
    const response = await api.patch(`/admin/indicators/${indicatorId}`, data);
    return response.data;
};

export const deleteIndicator = async (indicatorId: number) => {
    const response = await api.delete(`/admin/indicators/${indicatorId}`);
    return response.data;
};

export const createAssignment = async (data: any) => {
    const response = await api.post(`/admin/assignments`, data);
    return response.data;
};

export const deleteAssignment = async (assignmentId: number) => {
    const response = await api.delete(`/admin/assignments/${assignmentId}`);
    return response.data;
};

export const getEvaluationDetails = async (id: number) => {
    const response = await api.get(`/admin/evaluations/${id}`);
    return response.data;
};

export const getUsersByRole = async (role?: string) => {
    const url = role ? `/admin/users?role=${role}` : `/admin/users`;
    const response = await api.get(url);
    return response.data;
};
