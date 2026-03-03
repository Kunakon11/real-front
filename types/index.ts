export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'EVALUATOR' | 'EVALUATEE';
    departmentId?: number;
}

export interface Department {
    id: number;
    name: string;
}

export interface Evaluation {
    id: number;
    name: string;
    startAt: string;
    endAt: string;
    creatorId: number;
    createdAt: string;
    creator?: Pick<User, 'id' | 'name'>;
    topics?: Topic[];
    assignments?: Assignment[];
}

export interface Topic {
    id: number;
    name: string;
    evaluationId: number;
    indicators?: Indicator[];
}

export interface Indicator {
    id: number;
    name: string;
    type: 'SCALE_1_4' | 'YES_NO';
    weight: number;
    requireEvidence: boolean;
    topicId: number;
}

export interface Assignment {
    id: number;
    evaluationId: number;
    evaluatorId: number;
    evaluateeId: number;
    evaluator?: Pick<User, 'id' | 'name'>;
    evaluatee?: Pick<User, 'id' | 'name'>;
}

export interface Result {
    id: number;
    assignmentId: number;
    indicatorId: number;
    score?: number;
    evidenceUrl?: string;
    indicator?: Indicator;
}
