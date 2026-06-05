import {
    Badge,
    Action,
    Callout,
    Card,
    ContentRenderer,
    Heading,
    Text,
    Tooltip,
} from '@particle-academy/react-fancy';
import type { Lesson } from '../types';

export interface LessonViewProps {
    lesson: Lesson;
    completed?: boolean;
    onMarkComplete?: (lesson: Lesson) => void | Promise<void>;
    onNext?: (lesson: Lesson) => void;
}

export function LessonView({ lesson, completed, onMarkComplete, onNext: _onNext }: LessonViewProps) {
    const contentType = lesson.content_type ?? 'text';

    return (
        <Card
            variant="outlined"
            padding="none"
            className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm overflow-hidden"
        >
            <div className="px-6 py-5 border-b border-secondary-200 flex items-start justify-between gap-4">
                <div>
                    <Heading as="h1" size="xl" weight="bold" className="!text-secondary-900">
                        {lesson.title}
                    </Heading>
                    {lesson.estimated_minutes && (
                        <div className="mt-1 flex items-center gap-2">
                            <ClockIcon />
                            <Text size="sm" color="muted">
                                ~{lesson.estimated_minutes} min
                            </Text>
                        </div>
                    )}
                </div>
                {completed && (
                    <Tooltip content="You've completed this lesson">
                        <Badge color="green" variant="soft" size="md">
                            ✓ Completed
                        </Badge>
                    </Tooltip>
                )}
            </div>

            <div className="px-6 py-6 grid gap-5">
                {(contentType === 'video' || contentType === 'mixed') && lesson.video_url && (
                    <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-secondary-900 shadow-sm">
                        <iframe
                            src={lesson.video_url}
                            title={lesson.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                        />
                    </div>
                )}

                {(contentType === 'text' || contentType === 'mixed') && lesson.content && (
                    <div className="prose prose-secondary max-w-none prose-headings:font-bold prose-headings:text-secondary-900 prose-p:text-secondary-700 prose-strong:text-secondary-900 prose-a:text-brand">
                        <ContentRenderer value={lesson.content} format="html" />
                    </div>
                )}

                {completed && (
                    <Callout color="green">
                        <div className="flex items-center gap-2">
                            <Text weight="semibold">Lesson complete.</Text>
                            <Text size="sm">Move to the next item when you're ready.</Text>
                        </div>
                    </Callout>
                )}
            </div>

            {!completed && onMarkComplete && (
                <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50/50 flex items-center justify-end gap-3">
                    <Tooltip content="Confirms you've finished reading this lesson">
                        <Action
                            color="red"
                            icon="check"
                            onClick={() => onMarkComplete(lesson)}
                            className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-5 !py-2.5 !rounded-md !shadow-sm"
                        >
                            Mark complete
                        </Action>
                    </Tooltip>
                </div>
            )}
        </Card>
    );
}

function ClockIcon() {
    return (
        <svg
            className="h-4 w-4 text-secondary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );
}
