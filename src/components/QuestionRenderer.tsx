import { CheckboxGroup, RadioGroup, Text, Textarea } from '@particle-academy/react-fancy';
import type { Question } from '../types';

export type AnswerValue =
    | { kind: 'option_id'; value: number }
    | { kind: 'option_ids'; value: number[] }
    | { kind: 'text'; value: string }
    | null;

export interface QuestionRendererProps {
    question: Question;
    value: AnswerValue;
    onChange: (next: AnswerValue) => void;
    disabled?: boolean;
}

export function QuestionRenderer({ question, value, onChange, disabled }: QuestionRendererProps) {
    const options = question.options ?? [];

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const selected = value?.kind === 'option_id' ? String(value.value) : undefined;

        return (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <Text weight="medium">{question.prompt}</Text>
                <RadioGroup<string>
                    name={`q-${question.id}`}
                    list={options.map((o) => ({ value: String(o.id), label: o.label }))}
                    value={selected}
                    onValueChange={(next) =>
                        onChange({ kind: 'option_id', value: Number(next) })
                    }
                    disabled={disabled}
                />
            </div>
        );
    }

    if (question.type === 'multiple_select') {
        const selected = value?.kind === 'option_ids' ? value.value.map(String) : undefined;

        return (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <Text weight="medium">{question.prompt}</Text>
                <Text color="muted" size="sm">Select all that apply</Text>
                <CheckboxGroup<string>
                    name={`q-${question.id}`}
                    list={options.map((o) => ({ value: String(o.id), label: o.label }))}
                    value={selected}
                    onValueChange={(next) =>
                        onChange({ kind: 'option_ids', value: next.map(Number) })
                    }
                    disabled={disabled}
                />
            </div>
        );
    }

    // short_answer
    const text = value?.kind === 'text' ? value.value : '';
    return (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
            <Text weight="medium">{question.prompt}</Text>
            <Textarea
                value={text}
                onChange={(e) =>
                    onChange({ kind: 'text', value: (e.target as HTMLTextAreaElement).value })
                }
                disabled={disabled}
                rows={4}
                placeholder="Your answer..."
            />
        </div>
    );
}

export function answerValueToPayload(
    questionId: number,
    value: AnswerValue,
): { question_id: number; answer: unknown } {
    if (!value) return { question_id: questionId, answer: null };
    switch (value.kind) {
        case 'option_id':
            return { question_id: questionId, answer: { option_id: value.value } };
        case 'option_ids':
            return { question_id: questionId, answer: { option_ids: value.value } };
        case 'text':
            return { question_id: questionId, answer: { text: value.value } };
    }
}
