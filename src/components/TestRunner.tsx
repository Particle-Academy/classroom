import { useMemo, useState } from 'react';
import { Action, Badge, Callout, Card, Heading, Progress, Text } from '@particle-academy/react-fancy';
import { QuestionRenderer, type AnswerValue, answerValueToPayload } from './QuestionRenderer';
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

    const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
    const percent = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

    async function handleSubmit(): Promise<void> {
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
        <Card padding="lg">
            <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <Heading as="h2" size="xl">{test.title}</Heading>
                    {test.is_final && <Badge color="amber" variant="soft">Final</Badge>}
                </div>
                {test.description && <Text color="muted">{test.description}</Text>}

                <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <Progress value={percent} max={100} />
                    <Text size="sm">
                        {answeredCount} of {questions.length} answered · pass at {test.passing_score}%
                    </Text>
                </div>

                <div style={{ display: 'grid', gap: '1.25rem' }}>
                    {questions.map((q, i) => (
                        <Card key={q.id} variant="flat" padding="md">
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <Text size="sm" color="muted">
                                    Question {i + 1} · {q.points} pt{q.points === 1 ? '' : 's'}
                                </Text>
                                <QuestionRenderer
                                    question={q}
                                    value={answers[q.id] ?? null}
                                    onChange={(next) =>
                                        setAnswers((prev) => ({ ...prev, [q.id]: next }))
                                    }
                                />
                            </div>
                        </Card>
                    ))}
                </div>

                {error && <Callout color="red">{error}</Callout>}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Action
                        onClick={handleSubmit}
                        disabled={submitting || answeredCount === 0}
                        loading={submitting}
                    >
                        {submitting ? 'Submitting…' : 'Submit test'}
                    </Action>
                </div>
            </div>
        </Card>
    );
}

function TestResult({ attempt }: { attempt: TestAttempt }) {
    const passed = attempt.passed === true;
    const pending = attempt.passed === null;

    return (
        <Card padding="lg">
            <div style={{ display: 'grid', gap: '1rem' }}>
                <Heading as="h2" size="xl">Results</Heading>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {pending ? (
                        <Badge color="zinc" variant="soft">Awaiting manual grading</Badge>
                    ) : passed ? (
                        <Badge color="green" variant="soft">Passed</Badge>
                    ) : (
                        <Badge color="red" variant="soft">Did not pass</Badge>
                    )}
                    {attempt.score !== null && <Text>Score: {attempt.score}%</Text>}
                </div>
                {attempt.points_awarded !== null && attempt.max_score !== null && (
                    <Text color="muted" size="sm">
                        {attempt.points_awarded} / {attempt.max_score} points
                    </Text>
                )}
            </div>
        </Card>
    );
}
