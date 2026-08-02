import { Badge, Button, Card, Heading, Progress, Text } from '@particle-academy/react-fancy';
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
        <div className="grid gap-5">
            <Card
                variant="outlined"
                padding="lg"
                className="!rounded-xl !shadow-sm"
            >
                <div className="grid gap-3">
                    <div className="flex items-center gap-2">
                        <Badge
                            color={curriculum.is_published ? 'green' : 'zinc'}
                            variant="soft"
                            size="sm"
                        >
                            {curriculum.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Text size="sm" color="muted">
                            {courses.length} course{courses.length === 1 ? '' : 's'}
                        </Text>
                    </div>
                    <Heading as="h1" size="2xl" weight="bold">
                        {curriculum.title}
                    </Heading>
                    {curriculum.description && (
                        <Text color="muted" className="!text-base">
                            {curriculum.description}
                        </Text>
                    )}
                    {onEnroll && (
                        <div className="pt-2">
                            <Button
                                onClick={() => onEnroll(curriculum)}
                                className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                            >
                                Enroll in curriculum
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => {
                    const percent = courseProgress[course.id] ?? 0;
                    return (
                        <Card
                            key={course.id}
                            variant="outlined"
                            padding="lg"
                            className="!rounded-xl !shadow-sm hover:!shadow-md transition flex flex-col"
                        >
                            <Heading as="h3" size="lg" weight="bold">
                                {course.title}
                            </Heading>
                            {course.description && (
                                <Text color="muted" size="sm" className="!mt-2 line-clamp-2">
                                    {course.description}
                                </Text>
                            )}
                            <div className="mt-4 grid gap-1.5">
                                <Progress
                                    value={percent}
                                    max={100}
                                    color="red"
                                    size="sm"
                                />
                                <Text size="xs" color="muted">
                                    {percent}% complete
                                </Text>
                            </div>
                            {onOpenCourse && (
                                <div className="mt-auto pt-5">
                                    <Button
                                        onClick={() => onOpenCourse(course)}
                                        className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !w-full !justify-center !py-2.5 !rounded-md !shadow-sm"
                                    >
                                        {percent > 0 ? 'Continue' : 'Start'}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
