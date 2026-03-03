import api from './api';

export const getMyEvaluations = async () => {
    const response = await api.get('/me/evaluations');
    return response.data;
};

export const getMyEvaluationDetails = async (id: number) => {
    const response = await api.get(`/me/evaluations/${id}`);
    return response.data;
};

export const uploadEvidence = async (evaluationId: number, formData: FormData) => {
    const response = await api.post(`/me/evaluations/${evaluationId}/evidence`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
