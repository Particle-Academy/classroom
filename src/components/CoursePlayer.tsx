import { useMemo, useState } from 'react';
import {
    Action,
    Badge,
    Breadcrumbs,
    Card,
    cn,
    Heading,
    Progress,
    Sidebar,
    Text,
} from '@particle-academy/react-fancy';
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
    const lessons = course.lessons ?? [];
    const [selection, setSelection] = useState<Selection | null>(() => {
        const first = lessons[0];
        return first ? { kind: 'lesson', lesson: first } : null;
    });

    const completedLessonCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const totalCount = lessons.length + allTests.length;
    const completedCount = completedLessonCount;
    const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    function selectLesson(lesson: Lesson): void {
        setSelection({ kind: 'lesson', lesson });
    }

    async function selectTest(test: Test): Promise<void> {
        const attempt = await onStartAttempt(test);
        setSelection({ kind: 'test', test: attempt.test ?? test, attempt });
    }

    const currentLessonIdx =
        selection?.kind === 'lesson'
            ? lessons.findIndex((l) => l.id === selection.lesson.id)
            : -1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
            <Card
                variant="outlined"
                padding="none"
                className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm overflow-hidden md:sticky md:top-4"
            >
                <div className="px-5 py-4 border-b border-secondary-200">
                    <Heading as="h2" size="md" weight="bold" className="!text-secondary-900">
                        {course.title}
                    </Heading>
                    {course.description && (
                        <Text size="sm" color="muted" className="!mt-1 line-clamp-2">
                            {course.description}
                        </Text>
                    )}
                    <div className="mt-3 grid gap-1.5">
                        <Progress
                            value={percentComplete}
                            max={100}
                            color="red"
                            size="sm"
                            className="!bg-secondary-100"
                        />
                        <div className="flex items-center justify-between">
                            <Text size="xs" color="muted">
                                {completedLessonCount}/{lessons.length} lessons
                            </Text>
                            <Text size="xs" weight="semibold" className="!text-brand">
                                {percentComplete}%
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="px-2 py-3">
                    <Sidebar>
                        {lessons.length > 0 && (
                            <Sidebar.Group label="Lessons">
                                {lessons.map((lesson, i) => {
                                    const active =
                                        selection?.kind === 'lesson' &&
                                        selection.lesson.id === lesson.id;
                                    const done = completedLessonIds.has(lesson.id);
                                    return (
                                        <Sidebar.Item
                                            key={lesson.id}
                                            active={active}
                                            icon={
                                                <LessonNumber
                                                    n={i + 1}
                                                    done={done}
                                                    active={active}
                                                />
                                            }
                                            badge={
                                                done ? (
                                                    <Badge
                                                        color="green"
                                                        variant="soft"
                                                        size="sm"
                                                    >
                                                        ✓
                                                    </Badge>
                                                ) : undefined
                                            }
                                            onClick={() => selectLesson(lesson)}
                                            className={cn(
                                                active &&
                                                    '!bg-primary-50 !text-brand !font-semibold',
                                            )}
                                        >
                                            <span className="truncate">{lesson.title}</span>
                                        </Sidebar.Item>
                                    );
                                })}
                            </Sidebar.Group>
                        )}

                        {allTests.length > 0 && (
                            <Sidebar.Group label="Assessments">
                                {allTests.map((test) => {
                                    const active =
                                        selection?.kind === 'test' &&
                                        selection.test.id === test.id;
                                    return (
                                        <Sidebar.Item
                                            key={test.id}
                                            active={active}
                                            icon={<TestIcon />}
                                            badge={
                                                test.is_final ? (
                                                    <Badge
                                                        color="amber"
                                                        variant="soft"
                                                        size="sm"
                                                    >
                                                        Final
                                                    </Badge>
                                                ) : undefined
                                            }
                                            onClick={() => void selectTest(test)}
                                            className={cn(
                                                active &&
                                                    '!bg-primary-50 !text-brand !font-semibold',
                                            )}
                                        >
                                            <span className="truncate">{test.title}</span>
                                        </Sidebar.Item>
                                    );
                                })}
                            </Sidebar.Group>
                        )}
                    </Sidebar>
                </div>
            </Card>

            <div className="grid gap-4">
                <Breadcrumbs separator={<span className="text-secondary-300 mx-1">›</span>}>
                    <Breadcrumbs.Item href="/dashboard">
                        <span className="text-sm text-secondary-500 hover:text-brand">
                            Dashboard
                        </span>
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Item>
                        <span className="text-sm text-secondary-500">{course.title}</span>
                    </Breadcrumbs.Item>
                    {selection?.kind === 'lesson' && (
                        <Breadcrumbs.Item active>
                            <span className="text-sm font-semibold text-secondary-900">
                                {selection.lesson.title}
                            </span>
                        </Breadcrumbs.Item>
                    )}
                    {selection?.kind === 'test' && (
                        <Breadcrumbs.Item active>
                            <span className="text-sm font-semibold text-secondary-900">
                                {selection.test.title}
                            </span>
                        </Breadcrumbs.Item>
                    )}
                </Breadcrumbs>

                {!selection && (
                    <Card
                        variant="outlined"
                        padding="lg"
                        className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm text-center"
                    >
                        <Text>This course has no content yet.</Text>
                    </Card>
                )}

                {selection?.kind === 'lesson' && (
                    <>
                        <LessonView
                            lesson={selection.lesson}
                            completed={completedLessonIds.has(selection.lesson.id)}
                            onMarkComplete={onMarkLessonComplete}
                            onNext={() => {
                                const next = lessons[currentLessonIdx + 1];
                                if (next) selectLesson(next);
                                else if (allTests.length > 0) void selectTest(allTests[0]);
                            }}
                        />
                        <LessonFooter
                            prevLabel={lessons[currentLessonIdx - 1]?.title}
                            nextLabel={
                                lessons[currentLessonIdx + 1]?.title ??
                                allTests[0]?.title
                            }
                            onPrev={
                                lessons[currentLessonIdx - 1]
                                    ? () => selectLesson(lessons[currentLessonIdx - 1])
                                    : undefined
                            }
                            onNext={
                                lessons[currentLessonIdx + 1]
                                    ? () => selectLesson(lessons[currentLessonIdx + 1])
                                    : allTests[0]
                                    ? () => void selectTest(allTests[0])
                                    : undefined
                            }
                        />
                    </>
                )}

                {selection?.kind === 'test' && selection.attempt && (
                    <TestRunner
                        test={selection.test}
                        onSubmit={(answers) => onSubmitAttempt(selection.attempt!, answers)}
                    />
                )}

                {selection?.kind === 'test' && !selection.attempt && (
                    <Card
                        variant="outlined"
                        padding="lg"
                        className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm"
                    >
                        <div className="grid gap-3 text-center">
                            <Heading as="h3" size="lg" weight="bold">
                                Ready to begin?
                            </Heading>
                            <Text color="muted">
                                Once you start, your attempt will be recorded.
                            </Text>
                            <div className="flex justify-center">
                                <Action
                                    onClick={() => void selectTest(selection.test)}
                                    className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                                >
                                    Start test
                                </Action>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

function LessonNumber({
    n,
    done,
    active,
}: {
    n: number;
    done: boolean;
    active: boolean;
}) {
    return (
        <span
            className={cn(
                'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                done
                    ? 'bg-emerald-100 text-emerald-700'
                    : active
                    ? 'bg-brand text-white'
                    : 'bg-secondary-100 text-secondary-700',
            )}
        >
            {n}
        </span>
    );
}

function TestIcon() {
    return (
        <svg
            className="h-4 w-4 shrink-0 text-secondary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}

function LessonFooter({
    prevLabel,
    nextLabel,
    onPrev,
    onNext,
}: {
    prevLabel?: string;
    nextLabel?: string;
    onPrev?: () => void;
    onNext?: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            {onPrev ? (
                <Action
                    variant="ghost"
                    onClick={onPrev}
                    className="!text-secondary-700 hover:!text-brand"
                >
                    ← <span className="hidden sm:inline ml-1">{prevLabel ?? 'Previous'}</span>
                    <span className="sm:hidden ml-1">Previous</span>
                </Action>
            ) : (
                <span />
            )}
            {onNext && (
                <Action
                    onClick={onNext}
                    className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-5 !py-2.5 !rounded-md !shadow-sm"
                >
                    <span className="hidden sm:inline">Next: {nextLabel ?? 'Continue'}</span>
                    <span className="sm:hidden">Next</span> →
                </Action>
            )}
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
