import { Action, Badge, Card, ContentRenderer, Heading, Text } from '@particle-academy/react-fancy';
import type { Lesson } from '../types';

export interface LessonViewProps {
    lesson: Lesson;
    completed?: boolean;
    onMarkComplete?: (lesson: Lesson) => void | Promise<void>;
    onNext?: (lesson: Lesson) => void;
}

export function LessonView({ lesson, completed, onMarkComplete, onNext }: LessonViewProps) {
    const contentType = lesson.content_type ?? 'text';

    return (
        <Card padding="lg">
            <div style={{ display: 'grid', gap: '1rem' }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <Heading as="h2" size="xl">{lesson.title}</Heading>
                    {completed && <Badge color="green" variant="soft">Completed</Badge>}
                </div>

                {lesson.estimated_minutes && (
                    <Text color="muted" size="sm">~{lesson.estimated_minutes} min</Text>
                )}

                {(contentType === 'video' || contentType === 'mixed') && lesson.video_url && (
                    <div
                        style={{
                            position: 'relative',
                            paddingTop: '56.25%',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            background: '#000',
                        }}
                    >
                        <iframe
                            src={lesson.video_url}
                            title={lesson.title}
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                border: 0,
                            }}
                        />
                    </div>
                )}

                {(contentType === 'text' || contentType === 'mixed') && lesson.content && (
                    <ContentRenderer value={lesson.content} format="html" />
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!completed && onMarkComplete && (
                        <Action onClick={() => onMarkComplete(lesson)}>Mark complete</Action>
                    )}
                    {onNext && (
                        <Action variant="ghost" onClick={() => onNext(lesson)}>
                            Skip ahead
                        </Action>
                    )}
                </div>
            </div>
        </Card>
    );
}
