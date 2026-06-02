import axios, { AxiosInstance } from 'axios';
import type {
    AnswerInput,
    Certificate,
    Curriculum,
    Enrollment,
    Test,
    TestAttempt,
} from '../types';

export interface CoursesClientOptions {
    baseUrl?: string;
    learnerId?: number | string;
    bearerToken?: string;
}

type ResourceEnvelope<T> = { data: T };

export class CoursesClient {
    private readonly http: AxiosInstance;
    private learnerId: number | string | undefined;

    constructor(options: CoursesClientOptions = {}) {
        this.http = axios.create({
            baseURL: options.baseUrl ?? '/api/courses',
            headers: {
                Accept: 'application/json',
                ...(options.bearerToken ? { Authorization: `Bearer ${options.bearerToken}` } : {}),
                ...(options.learnerId !== undefined ? { 'X-Learner-Id': String(options.learnerId) } : {}),
            },
        });
        this.learnerId = options.learnerId;
    }

    setLearner(id: number | string | undefined): void {
        this.learnerId = id;
        if (id === undefined) {
            delete this.http.defaults.headers.common['X-Learner-Id'];
        } else {
            this.http.defaults.headers.common['X-Learner-Id'] = String(id);
        }
    }

    async listCurriculums(params: { published_only?: boolean } = {}): Promise<Curriculum[]> {
        const { data } = await this.http.get<ResourceEnvelope<Curriculum[]>>('curriculums', { params });
        return data.data;
    }

    async getCurriculum(slug: string): Promise<Curriculum> {
        const { data } = await this.http.get<ResourceEnvelope<Curriculum>>(`curriculums/${slug}`);
        return data.data;
    }

    async getCourse(slug: string): Promise<Curriculum | Test> {
        const { data } = await this.http.get<ResourceEnvelope<Curriculum>>(`courses/${slug}`);
        return data.data;
    }

    async listEnrollments(): Promise<Enrollment[]> {
        const { data } = await this.http.get<ResourceEnvelope<Enrollment[]>>('enrollments');
        return data.data;
    }

    async enroll(input: {
        target_kind: 'curriculum' | 'course';
        target_slug?: string;
        target_id?: number;
    }): Promise<Enrollment> {
        const { data } = await this.http.post<ResourceEnvelope<Enrollment>>('enrollments', {
            ...input,
            ...(this.learnerId !== undefined ? { user_id: this.learnerId } : {}),
        });
        return data.data;
    }

    async getEnrollment(id: number): Promise<Enrollment> {
        const { data } = await this.http.get<ResourceEnvelope<Enrollment>>(`enrollments/${id}`);
        return data.data;
    }

    async markLessonComplete(enrollmentId: number, lessonId: number): Promise<void> {
        await this.http.post(`enrollments/${enrollmentId}/lessons/${lessonId}/complete`);
    }

    async getTest(slug: string): Promise<Test> {
        const { data } = await this.http.get<ResourceEnvelope<Test>>(`tests/${slug}`, {
            params: { hide_answers: true },
        });
        return data.data;
    }

    async startAttempt(enrollmentId: number, testId: number): Promise<TestAttempt> {
        const { data } = await this.http.post<ResourceEnvelope<TestAttempt>>(
            `enrollments/${enrollmentId}/tests/${testId}/attempts`,
        );
        return data.data;
    }

    async submitAttempt(attemptId: number, answers: AnswerInput[]): Promise<TestAttempt> {
        const { data } = await this.http.post<ResourceEnvelope<TestAttempt>>(
            `attempts/${attemptId}/submit`,
            { answers },
        );
        return data.data;
    }

    async issueCertificate(enrollmentId: number): Promise<Certificate> {
        const { data } = await this.http.post<ResourceEnvelope<Certificate>>(
            `enrollments/${enrollmentId}/certificate`,
        );
        return data.data;
    }

    certificatePdfUrl(certificateId: number): string {
        const base = this.http.defaults.baseURL?.replace(/\/$/, '') ?? '';
        return `${base}/certificates/${certificateId}/pdf`;
    }
}
