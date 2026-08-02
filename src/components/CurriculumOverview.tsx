import { Badge, Button, Card, cn, Heading, Progress, Text, type Color } from '@particle-academy/react-fancy';
import type { Course, Curriculum } from '../types';

/** Per-slot class overrides. Every slot also carries a stable `data-*` handle. */
export interface CurriculumOverviewClassNames {
    root?: string;
    hero?: string;
    heroMeta?: string;
    grid?: string;
    card?: string;
    cardIndex?: string;
    cardTitle?: string;
    cardDescription?: string;
    cardMeta?: string;
    cardProgress?: string;
    cardAction?: string;
}

export interface CurriculumOverviewProps {
    curriculum: Curriculum;
    courseProgress?: Record<number, number>;
    onEnroll?: (curriculum: Curriculum) => void;
    onOpenCourse?: (course: Course) => void;
    /** Accent for buttons, progress and highlights. Any react-fancy Color. */
    accent?: Color;
    /** Class for the root element. */
    className?: string;
    /** Class overrides per slot. */
    classNames?: CurriculumOverviewClassNames;
    /** Label for the primary action on an unstarted course. */
    startLabel?: string;
}

/**
 * A curriculum and its courses.
 *
 * **Two styling rules this component exists to demonstrate, having broken both:**
 *
 * 1. **Colour comes from react-fancy PROPS**, never class overrides. An earlier
 *    version forced `!bg-brand hover:!bg-primary-600` — custom palette tokens a
 *    consumer has to define — so on a host that had not defined them the classes
 *    resolved to nothing and every button rendered as a bare grey slab.
 * 2. **Nothing cosmetic is forced with `!`.** A host has to be able to restyle
 *    this. Radius, shadow and spacing are left to react-fancy's defaults or to
 *    the `classNames` slots; an `!important` in a library is a decision taken
 *    away from the person consuming it.
 *
 * Restyle it three ways, in increasing specificity: `accent` for the colour,
 * `classNames` for per-slot classes, or the `data-classroom-*` attributes from
 * your own stylesheet.
 */
export function CurriculumOverview({
    curriculum,
    courseProgress = {},
    onEnroll,
    onOpenCourse,
    accent = 'violet',
    className,
    classNames = {},
    startLabel = 'Start',
}: CurriculumOverviewProps) {
    const courses = curriculum.courses ?? [];
    const started = courses.filter((c) => (courseProgress[c.id] ?? 0) > 0).length;
    const totalMinutes = courses.reduce((sum, c) => sum + (c.estimated_minutes ?? 0), 0);

    return (
        <div
            className={cn('grid gap-6', className, classNames.root)}
            data-classroom-curriculum={curriculum.slug}
        >
            <Card variant="outlined" padding="lg" className={classNames.hero} data-classroom-hero="">
                <div className="grid gap-3">
                    <div className={cn('flex flex-wrap items-center gap-2', classNames.heroMeta)}>
                        <Badge color={curriculum.is_published ? 'emerald' : 'zinc'} variant="soft" size="sm">
                            {curriculum.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge color="zinc" variant="soft" size="sm">
                            {courses.length} course{courses.length === 1 ? '' : 's'}
                        </Badge>
                        {totalMinutes > 0 && (
                            <Badge color="zinc" variant="soft" size="sm">
                                ~{Math.round(totalMinutes / 60)}h
                            </Badge>
                        )}
                        {started > 0 && (
                            <Badge color={accent} variant="soft" size="sm">
                                {started} in progress
                            </Badge>
                        )}
                    </div>

                    <Heading as="h1" size="2xl" weight="bold">
                        {curriculum.title}
                    </Heading>

                    {curriculum.description && (
                        <Text color="muted" className="max-w-2xl">
                            {curriculum.description}
                        </Text>
                    )}

                    {onEnroll && (
                        <div className="pt-1">
                            <Button
                                color={accent}
                                size="lg"
                                iconTrailing="arrow-right"
                                onClick={() => onEnroll(curriculum)}
                                data-classroom-enroll=""
                            >
                                Enroll in curriculum
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            <div
                className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', classNames.grid)}
                data-classroom-course-grid=""
            >
                {courses.map((course, index) => {
                    const percent = courseProgress[course.id] ?? 0;
                    const complete = percent >= 100;

                    return (
                        <Card
                            key={course.id}
                            variant="outlined"
                            padding="lg"
                            className={cn('flex flex-col transition hover:-translate-y-0.5', classNames.card)}
                            data-classroom-course={course.slug}
                            data-classroom-progress={percent}
                        >
                            <div className="flex items-baseline gap-2.5">
                                <span
                                    className={cn('text-sm font-semibold tabular-nums opacity-60', classNames.cardIndex)}
                                    data-classroom-course-index=""
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <Heading as="h3" size="md" weight="bold" className={classNames.cardTitle}>
                                    {course.title}
                                </Heading>
                            </div>

                            {course.description && (
                                <Text
                                    color="muted"
                                    size="sm"
                                    className={cn('mt-2 line-clamp-3', classNames.cardDescription)}
                                >
                                    {course.description}
                                </Text>
                            )}

                            {(course.estimated_minutes || complete) && (
                                <div className={cn('mt-3 flex flex-wrap gap-1.5', classNames.cardMeta)}>
                                    {course.estimated_minutes ? (
                                        <Badge color="zinc" variant="soft" size="sm">
                                            {course.estimated_minutes} min
                                        </Badge>
                                    ) : null}
                                    {complete && (
                                        <Badge color="emerald" variant="soft" size="sm">
                                            Complete
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/*
                             * A 0%-wide bar under every card is noise — it says
                             * nothing the "Start" button does not already say. The
                             * bar earns its place once there is progress to show.
                             */}
                            {percent > 0 && (
                                <div className={cn('mt-4', classNames.cardProgress)}>
                                    <Progress
                                        value={percent}
                                        max={100}
                                        color={complete ? 'emerald' : accent}
                                        size="sm"
                                        showValue
                                    />
                                </div>
                            )}

                            {onOpenCourse && (
                                <div className={cn('mt-auto pt-5', classNames.cardAction)}>
                                    <Button
                                        color={percent > 0 ? accent : 'zinc'}
                                        variant={percent > 0 ? 'default' : 'ghost'}
                                        iconTrailing="chevron-right"
                                        className="w-full justify-center"
                                        onClick={() => onOpenCourse(course)}
                                        data-classroom-open-course={course.slug}
                                    >
                                        {complete ? 'Review' : percent > 0 ? 'Continue' : startLabel}
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
