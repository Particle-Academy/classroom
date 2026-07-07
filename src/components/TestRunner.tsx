import { useMemo, useState } from 'react';
import {
    Action,
    Badge,
    Callout,
    Card,
    cn,
    Heading,
    Modal,
    Progress,
    Text,
} from '@particle-academy/react-fancy';
import {
    QuestionRenderer,
    type AnswerValue,
    answerValueToPayload,
} from './QuestionRenderer';
import type { AnswerInput, Test, TestAttempt } from '../types';

export interface TestRunnerProps {
    test: Test;
    onSubmit: (answers: AnswerInput[]) => Promise<TestAttempt>;
    onFinished?: (attempt: TestAttempt) => void;
}

export function TestRunner({ test, onSubmit, onFinished }: TestRunnerProps) {
    const questions = useMemo(() => test.questions ?? [], [test.questions]);
    const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<TestAttempt | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const answeredCount = Object.values(answers).filter(
        (a) => a !== null && a !== undefined,
    ).length;
    const percent = questions.length
        ? Math.round((answeredCount / questions.length) * 100)
        : 0;
    const allAnswered = answeredCount === questions.length && questions.length > 0;

    async function handleSubmit(): Promise<void> {
        setConfirmOpen(false);
        setSubmitting(true);
        setError(null);
        try {
            const payload: AnswerInput[] = questions.map(
                (q) => answerValueToPayload(q.id, answers[q.id] ?? null) as AnswerInput,
            );
            const attempt = await onSubmit(payload);
            setResult(attempt);
            onFinished?.(attempt);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (result) {
        return <TestResult attempt={result} />;
    }

    return (
        <>
            <Card
                variant="outlined"
                padding="none"
                className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-secondary-200">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Heading as="h1" size="xl" weight="bold" className="!text-secondary-900">
                                {test.title}
                            </Heading>
                            {test.description && (
                                <Text className="!mt-1" color="muted">
                                    {test.description}
                                </Text>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {test.is_final && (
                                <Badge color="amber" variant="soft" size="md">
                                    Final exam
                                </Badge>
                            )}
                            <Text size="xs" color="muted">
                                Pass at {test.passing_score}%
                            </Text>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-1.5">
                        <Progress
                            value={percent}
                            max={100}
                            color="red"
                            size="sm"
                            className="!bg-secondary-100"
                        />
                        <div className="flex items-center justify-between">
                            <Text size="xs" color="muted">
                                {answeredCount} of {questions.length} answered
                            </Text>
                            <Text size="xs" weight="semibold" className="!text-brand">
                                {percent}%
                            </Text>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 grid gap-5">
                    {questions.map((q, i) => (
                        <Card
                            key={q.id}
                            variant="outlined"
                            padding="md"
                            className="!rounded-lg !border-secondary-200 !bg-secondary-50/50"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Text size="xs" weight="semibold" className="uppercase tracking-wide" color="muted">
                                    Question {i + 1} of {questions.length}
                                </Text>
                                <Badge color="zinc" variant="soft" size="sm">
                                    {q.points} pt{q.points === 1 ? '' : 's'}
                                </Badge>
                            </div>
                            <QuestionRenderer
                                question={q}
                                value={answers[q.id] ?? null}
                                onChange={(next) =>
                                    setAnswers((prev) => ({ ...prev, [q.id]: next }))
                                }
                            />
                        </Card>
                    ))}
                </div>

                {error && (
                    <div className="px-6 pb-4">
                        <Callout color="red">{error}</Callout>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50/50 flex items-center justify-between gap-3">
                    <Text size="sm" color="muted">
                        {allAnswered
                            ? "You've answered every question."
                            : `${questions.length - answeredCount} question${questions.length - answeredCount === 1 ? '' : 's'} remaining`}
                    </Text>
                    <Action
                        loading={submitting}
                        disabled={submitting || answeredCount === 0}
                        onClick={() => setConfirmOpen(true)}
                        className="!bg-brand hover:!bg-primary-600 disabled:!bg-secondary-300 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                    >
                        {submitting ? 'Submitting…' : 'Submit test'}
                    </Action>
                </div>
            </Card>

            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} size="sm">
                <Card variant="flat" padding="lg" className="!bg-white">
                    <Heading as="h2" size="lg" weight="bold" className="!text-secondary-900">
                        Submit your answers?
                    </Heading>
                    <Text color="muted" className="!mt-2">
                        {allAnswered
                            ? `You've answered all ${questions.length} questions. You can't change your answers after submitting.`
                            : `You have ${questions.length - answeredCount} unanswered question${questions.length - answeredCount === 1 ? '' : 's'}. Unanswered questions count as zero.`}
                    </Text>
                    <div className="mt-6 flex justify-end gap-3">
                        <Action
                            variant="ghost"
                            onClick={() => setConfirmOpen(false)}
                            className="!text-secondary-700 hover:!text-brand !px-4 !py-2"
                        >
                            Keep working
                        </Action>
                        <Action
                            onClick={handleSubmit}
                            className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-5 !py-2 !rounded-md"
                        >
                            Submit
                        </Action>
                    </div>
                </Card>
            </Modal>
        </>
    );
}

function TestResult({ attempt }: { attempt: TestAttempt }) {
    const passed = attempt.passed === true;
    const pending = attempt.passed === null;
    const score = attempt.score !== null ? Number(attempt.score) : null;

    return (
        <Card
            variant="outlined"
            padding="none"
            className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm overflow-hidden"
        >
            <div
                className={cn(
                    'px-6 py-5',
                    pending ? 'bg-blue-50' : passed ? 'bg-emerald-50' : 'bg-red-50',
                )}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold',
                            pending
                                ? 'bg-blue-100 text-blue-700'
                                : passed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700',
                        )}
                    >
                        {pending ? '…' : passed ? '✓' : '✕'}
                    </div>
                    <div>
                        <Heading as="h2" size="xl" weight="bold" className="!text-secondary-900">
                            {pending ? 'Awaiting grading' : passed ? 'You passed!' : 'Did not pass'}
                        </Heading>
                        <Text className="!mt-0.5" color="muted">
                            {pending
                                ? 'Some answers require manual review.'
                                : passed
                                ? 'Nice work. Your certificate is being issued.'
                                : 'Review the material and try again.'}
                        </Text>
                    </div>
                </div>
            </div>

            <div className="px-6 py-5 grid sm:grid-cols-3 gap-4">
                <Stat label="Score" value={score !== null ? `${score}%` : '—'} highlight />
                <Stat
                    label="Points awarded"
                    value={
                        attempt.points_awarded !== null && attempt.max_score !== null
                            ? `${attempt.points_awarded} / ${attempt.max_score}`
                            : '—'
                    }
                />
                <Stat label="Attempt" value={`#${attempt.attempt_number}`} />
            </div>
        </Card>
    );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="rounded-lg border border-secondary-200 bg-secondary-50/50 px-4 py-3">
            <Text size="xs" weight="semibold" className="uppercase tracking-wide" color="muted">
                {label}
            </Text>
            <div
                className={cn(
                    'mt-1 text-2xl font-bold',
                    highlight ? 'text-brand' : 'text-secondary-900',
                )}
            >
                {value}
            </div>
        </div>
    );
}
