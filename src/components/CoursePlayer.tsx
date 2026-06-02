import { useMemo, useState, type CSSProperties } from 'react';
import { Action, Badge, Card, Heading, Text } from '@particle-academy/react-fancy';
import { LessonView } from './LessonView';
import { TestRunner } from './TestRunner';
import type {
    AnswerInput,
    Course,
    Enrollment,
    Lesson,
    Test,
    TestAttempt,
} from '../types';

export interface CoursePlayerProps {
    course: Course;
    enrollment: Enrollment;
    completedLessonIds: Set<number>;
    onMarkLessonComplete: (lesson: Lesson) => void | Promise<void>;
    onStartAttempt: (test: Test) => Promise<TestAttempt>;
    onSubmitAttempt: (attempt: TestAttempt, answers: AnswerInput[]) => Promise<TestAttempt>;
}

type Selection =
    | { kind: 'lesson'; lesson: Lesson }
    | { kind: 'test'; test: Test; attempt: TestAttempt | null };

export function CoursePlayer({
    course,
    completedLessonIds,
    onMarkLessonComplete,
    onStartAttempt,
    onSubmitAttempt,
}: CoursePlayerProps) {
    const allTests = useMemo(() => collectTests(course), [course]);
    const [selection, setSelection] = useState<Selection | null>(() => {
        const first = course.lessons?.[0];
        return first ? { kind: 'lesson', lesson: first } : null;
    });

    function selectLesson(lesson: Lesson): void {
        setSelection({ kind: 'lesson', lesson });
    }

    async function selectTest(test: Test): Promise<void> {
        const attempt = await onStartAttempt(test);
        setSelection({ kind: 'test', test: attempt.test ?? test, attempt });
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '260px 1fr',
                gap: '1rem',
                alignItems: 'start',
            }}
        >
            <Card padding="md">
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <Heading as="h4" size="md">{course.title}</Heading>
                    {course.lessons && course.lessons.length > 0 && (
                        <section style={{ display: 'grid', gap: '0.125rem' }}>
                            <Text size="sm" color="muted">Lessons</Text>
                            {course.lessons.map((lesson) => (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => selectLesson(lesson)}
                                    style={listItemStyle(
                                        selection?.kind === 'lesson' &&
                                            selection.lesson.id === lesson.id,
                                    )}
                                >
                                    <span>{lesson.title}</span>
                                    {completedLessonIds.has(lesson.id) && (
                                        <Badge color="green" variant="soft" size="sm">
                                            Done
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </section>
                    )}
                    {allTests.length > 0 && (
                        <section style={{ display: 'grid', gap: '0.125rem', marginTop: '0.75rem' }}>
                            <Text size="sm" color="muted">Tests</Text>
                            {allTests.map((test) => (
                                <button
                                    key={test.id}
                                    type="button"
                                    onClick={() => void selectTest(test)}
                                    style={listItemStyle(
                                        selection?.kind === 'test' &&
                                            selection.test.id === test.id,
                                    )}
                                >
                                    <span>{test.title}</span>
                                    {test.is_final && (
                                        <Badge color="amber" variant="soft" size="sm">
                                            Final
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </section>
                    )}
                </div>
            </Card>

            <div>
                {!selection && (
                    <Card padding="lg">
                        <Text>This course has no content yet.</Text>
                    </Card>
                )}
                {selection?.kind === 'lesson' && (
                    <LessonView
                        lesson={selection.lesson}
                        completed={completedLessonIds.has(selection.lesson.id)}
                        onMarkComplete={onMarkLessonComplete}
                        onNext={() => {
                            const idx =
                                course.lessons?.findIndex((l) => l.id === selection.lesson.id) ??
                                -1;
                            const next = idx >= 0 ? course.lessons?.[idx + 1] : undefined;
                            if (next) selectLesson(next);
                        }}
                    />
                )}
                {selection?.kind === 'test' && selection.attempt && (
                    <TestRunner
                        test={selection.test}
                        onSubmit={(answers) => onSubmitAttempt(selection.attempt!, answers)}
                    />
                )}
                {selection?.kind === 'test' && !selection.attempt && (
                    <Card padding="lg">
                        <Action onClick={() => void selectTest(selection.test)}>Start test</Action>
                    </Card>
                )}
            </div>
        </div>
    );
}

function collectTests(course: Course): Test[] {
    return [
        ...(course.tests ?? []),
        ...(course.modules ?? []).flatMap((m) => m.tests ?? []),
        ...(course.lessons ?? []).flatMap((l) => l.tests ?? []),
    ];
}

function listItemStyle(active: boolean): CSSProperties {
    return {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        textAlign: 'left',
        padding: '0.5rem 0.625rem',
        margin: '0.125rem 0',
        background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
        border: 0,
        borderRadius: '0.5rem',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
    };
}
