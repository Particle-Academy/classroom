import {
    Badge,
    Button,
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
    /**
     * Hosts a lesson video may be embedded from. Defaults to the common
     * providers below; pass your own to allow a self-hosted player.
     *
     * `lesson.video_url` is admin-supplied and validated on the server as
     * nothing more than a URL, so without this the component would frame
     * whatever a compromised or careless admin put in that column.
     */
    allowedVideoHosts?: string[];
}

/**
 * The default embed allowlist — the hosts a course video actually comes from.
 *
 * Deliberately not "anything https". An `<iframe>` runs a third party's code in
 * the learner's browser inside your page, so the set of origins allowed to do
 * that should be a decision someone made, not a side effect of what an admin
 * typed into a text field.
 */
const DEFAULT_VIDEO_HOSTS = [
    'youtube.com',
    'www.youtube.com',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'youtu.be',
    'player.vimeo.com',
    'vimeo.com',
    'fast.wistia.net',
    'iframe.mediadelivery.net',
    'player.cloudinary.com',
];

/**
 * Whether a URL is safe to frame: https, and a host on the allowlist.
 *
 * Subdomain matching is exact or a dotted suffix, never `endsWith` on the bare
 * name — `evil-youtube.com`.endsWith(`youtube.com`) is true, and that is the
 * usual way an allowlist turns out not to be one.
 */
export function isEmbeddableVideo(url: string | null | undefined, allowed: string[]): boolean {
    if (!url) return false;

    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (parsed.protocol !== 'https:') return false;

    const host = parsed.hostname.toLowerCase();

    return allowed.some((entry) => {
        const allowedHost = entry.toLowerCase();

        return host === allowedHost || host.endsWith(`.${allowedHost}`);
    });
}

export function LessonView({
    lesson,
    completed,
    onMarkComplete,
    onNext: _onNext,
    allowedVideoHosts = DEFAULT_VIDEO_HOSTS,
}: LessonViewProps) {
    const contentType = lesson.content_type ?? 'text';
    const embeddable = isEmbeddableVideo(lesson.video_url, allowedVideoHosts);

    return (
        <Card
            variant="outlined"
            padding="none"
            className="!rounded-xl !shadow-sm overflow-hidden"
        >
            <div className="px-6 py-5 border-b border-secondary-200 flex items-start justify-between gap-4">
                <div>
                    <Heading as="h1" size="xl" weight="bold">
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
                    embeddable ? (
                        <div className="relative pt-[56.25%] rounded-xl overflow-hidden bg-secondary-900 shadow-sm">
                            <iframe
                                src={lesson.video_url}
                                title={lesson.title}
                                // allow-same-origin refers to the FRAME's own origin, not
                                // this page's, so a cross-origin player still cannot reach
                                // into the host document. Both it and allow-scripts are
                                // required for any real video player to run.
                                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                referrerPolicy="strict-origin-when-cross-origin"
                                loading="lazy"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                            />
                        </div>
                    ) : (
                        // Loud, not silent. A blocked embed that rendered nothing would
                        // look like a lesson with no video, and nobody would know to fix
                        // the URL.
                        <Callout color="amber" data-lesson-video-blocked>
                            <p className="font-medium">This lesson&apos;s video cannot be shown here.</p>
                            <p className="text-sm">
                                It is hosted somewhere this course is not configured to embed from. Ask an
                                administrator to use an approved video host, or open it directly:{' '}
                                <a
                                    href={lesson.video_url}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="underline"
                                >
                                    open the video
                                </a>
                                .
                            </p>
                        </Callout>
                    )
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
                        <Button
                            color="red"
                            icon="check"
                            onClick={() => onMarkComplete(lesson)}
                            className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-5 !py-2.5 !rounded-md !shadow-sm"
                        >
                            Mark complete
                        </Button>
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
