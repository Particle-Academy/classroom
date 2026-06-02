// Types mirroring the laravel-courses API. Kept hand-authored so the
// package isn't coupled to a generator.

export type Iso = string;

export interface CertificateTemplate {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    blade_view: string | null;
    html: string | null;
    css: string | null;
    is_default: boolean;
    variables_schema: Record<string, unknown> | null;
}

export interface Curriculum {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    sort_order: number;
    is_published: boolean;
    metadata: Record<string, unknown> | null;
    courses?: Course[];
    certificate_template?: CertificateTemplate;
}

export interface Course {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    sort_order: number;
    is_published: boolean;
    estimated_minutes: number | null;
    metadata: Record<string, unknown> | null;
    modules?: Module[];
    lessons?: Lesson[];
    tests?: Test[];
    pivot?: { sort_order: number; is_required: boolean };
}

export interface Module {
    id: number;
    course_id: number;
    slug: string;
    title: string;
    description: string | null;
    sort_order: number;
    lessons?: Lesson[];
    tests?: Test[];
}

export type LessonContentType = 'text' | 'video' | 'mixed';

export interface Lesson {
    id: number;
    course_id: number;
    module_id: number | null;
    slug: string;
    title: string;
    content_type: LessonContentType | null;
    content: string | null;
    video_url: string | null;
    sort_order: number;
    estimated_minutes: number | null;
    tests?: Test[];
}

export interface Test {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    course_id: number | null;
    module_id: number | null;
    lesson_id: number | null;
    passing_score: number;
    time_limit_seconds: number | null;
    max_attempts: number | null;
    is_final: boolean;
    randomize_questions: boolean;
    questions?: Question[];
}

export type QuestionType =
    | 'multiple_choice'
    | 'multiple_select'
    | 'true_false'
    | 'short_answer';

export interface Question {
    id: number;
    test_id: number;
    prompt: string;
    type: QuestionType;
    points: number;
    sort_order: number;
    explanation?: string | null;
    options?: QuestionOption[];
}

export interface QuestionOption {
    id: number;
    label: string;
    is_correct?: boolean;
    sort_order: number;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface ProgressSummary {
    lessons_total: number;
    lessons_completed: number;
    lessons_percent: number;
    tests_total: number;
    tests_passed: number;
    tests_percent: number;
    overall_percent: number;
}

export interface Enrollment {
    id: number;
    user_id: number | string;
    status: EnrollmentStatus;
    started_at: Iso;
    completed_at: Iso | null;
    enrollable_type: string;
    enrollable_id: number;
    target_kind: 'curriculum' | 'course' | null;
    target: Curriculum | Course | null;
    progress?: ProgressSummary;
    lesson_completions?: LessonCompletion[];
    test_attempts?: TestAttempt[];
    certificate?: Certificate | null;
    metadata: Record<string, unknown> | null;
}

export interface LessonCompletion {
    id: number;
    enrollment_id: number;
    lesson_id: number;
    completed_at: Iso;
    lesson?: Lesson;
}

export interface TestAttempt {
    id: number;
    enrollment_id: number;
    test_id: number;
    attempt_number: number;
    started_at: Iso;
    finished_at: Iso | null;
    score: number | null;
    points_awarded: number | null;
    max_score: number | null;
    passed: boolean | null;
    test?: Test;
    answers?: AttemptAnswer[];
}

export interface AttemptAnswer {
    id: number;
    test_attempt_id: number;
    question_id: number;
    answer: unknown;
    is_correct: boolean | null;
    points_awarded: number;
    question?: Question;
}

export interface Certificate {
    id: number;
    enrollment_id: number;
    verification_code: string;
    issued_at: Iso;
    pdf_path: string | null;
    template?: CertificateTemplate;
    metadata: Record<string, unknown> | null;
}

// Answer payload submitted from the UI to the API.
export type AnswerInput =
    | { question_id: number; answer: { option_id: number } }
    | { question_id: number; answer: { option_ids: number[] } }
    | { question_id: number; answer: { text: string } };
