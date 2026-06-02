import { Action, Badge, Card, Heading, Progress, Text } from '@particle-academy/react-fancy';
import type { Course, Curriculum } from '../types';

export interface CurriculumOverviewProps {
    curriculum: Curriculum;
    courseProgress?: Record<number, number>;
    onEnroll?: (curriculum: Curriculum) => void;
    onOpenCourse?: (course: Course) => void;
}

export function CurriculumOverview({
    curriculum,
    courseProgress = {},
    onEnroll,
    onOpenCourse,
}: CurriculumOverviewProps) {
    const courses = curriculum.courses ?? [];

    return (
        <div className="fc-curriculum-overview" style={{ display: 'grid', gap: '1.25rem' }}>
            <Card padding="lg">
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <Heading as="h1" size="2xl">{curriculum.title}</Heading>
                    {curriculum.description && <Text>{curriculum.description}</Text>}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Badge color={curriculum.is_published ? 'green' : 'zinc'} variant="soft">
                            {curriculum.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Text color="muted" size="sm">
                            {courses.length} course{courses.length === 1 ? '' : 's'}
                        </Text>
                    </div>
                    {onEnroll && (
                        <div>
                            <Action onClick={() => onEnroll(curriculum)}>Enroll in curriculum</Action>
                        </div>
                    )}
                </div>
            </Card>

            <div
                style={{
                    display: 'grid',
                    gap: '0.75rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
            >
                {courses.map((course) => {
                    const percent = courseProgress[course.id] ?? 0;
                    return (
                        <Card key={course.id} padding="md">
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <Heading as="h3" size="lg">{course.title}</Heading>
                                {course.description && (
                                    <Text color="muted" size="sm">{course.description}</Text>
                                )}
                                <Progress value={percent} max={100} />
                                <Text size="sm">{percent}% complete</Text>
                                {onOpenCourse && (
                                    <Action variant="ghost" onClick={() => onOpenCourse(course)}>
                                        {percent > 0 ? 'Continue' : 'Start'}
                                    </Action>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
