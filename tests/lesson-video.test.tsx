// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { isEmbeddableVideo, LessonView } from "../src/components/LessonView";
import type { Lesson } from "../src/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const roots: Root[] = [];

function mount(el: ReactElement): HTMLElement {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    act(() => root.render(el));
    return host;
}

afterEach(() => {
    act(() => roots.splice(0).forEach((r) => r.unmount()));
    document.body.innerHTML = "";
});

const HOSTS = ["youtube.com", "player.vimeo.com"];

const lesson = (over: Partial<Lesson> = {}): Lesson =>
    ({
        id: 1,
        title: "Ohm's Law",
        content_type: "video",
        video_url: "https://www.youtube.com/embed/abc",
        estimated_minutes: 5,
        ...over,
    }) as unknown as Lesson;

describe("isEmbeddableVideo", () => {
    it("allows an exact host and its subdomains", () => {
        expect(isEmbeddableVideo("https://youtube.com/embed/x", HOSTS)).toBe(true);
        expect(isEmbeddableVideo("https://www.youtube.com/embed/x", HOSTS)).toBe(true);
    });

    it("rejects a lookalike that merely ENDS WITH an allowed host", () => {
        // The classic allowlist hole: "evil-youtube.com".endsWith("youtube.com")
        // is true. Matching has to be exact or on a dot boundary.
        expect(isEmbeddableVideo("https://evil-youtube.com/embed/x", HOSTS)).toBe(false);
        expect(isEmbeddableVideo("https://notyoutube.com/embed/x", HOSTS)).toBe(false);
    });

    it("rejects a host that only APPEARS in the path or query", () => {
        expect(isEmbeddableVideo("https://evil.example/youtube.com/x", HOSTS)).toBe(false);
        expect(isEmbeddableVideo("https://evil.example/?x=youtube.com", HOSTS)).toBe(false);
    });

    it("rejects an allowed host used as userinfo", () => {
        // https://youtube.com@evil.example/ is served by evil.example.
        expect(isEmbeddableVideo("https://youtube.com@evil.example/x", HOSTS)).toBe(false);
    });

    it("requires https", () => {
        expect(isEmbeddableVideo("http://youtube.com/embed/x", HOSTS)).toBe(false);
    });

    it("rejects non-http schemes outright", () => {
        // An iframe src of javascript: or data: is script execution in the page.
        expect(isEmbeddableVideo("javascript:alert(1)", HOSTS)).toBe(false);
        expect(isEmbeddableVideo("data:text/html,<script>alert(1)</script>", HOSTS)).toBe(false);
    });

    it("rejects junk rather than throwing", () => {
        expect(isEmbeddableVideo("not a url", HOSTS)).toBe(false);
        expect(isEmbeddableVideo("", HOSTS)).toBe(false);
        expect(isEmbeddableVideo(null, HOSTS)).toBe(false);
        expect(isEmbeddableVideo(undefined, HOSTS)).toBe(false);
    });

    it("is case-insensitive on the host", () => {
        expect(isEmbeddableVideo("https://WWW.YouTube.COM/embed/x", HOSTS)).toBe(true);
    });

    it("allows nothing when the allowlist is empty", () => {
        expect(isEmbeddableVideo("https://youtube.com/embed/x", [])).toBe(false);
    });
});

describe("LessonView video", () => {
    it("frames an allowed video, sandboxed", () => {
        const host = mount(<LessonView lesson={lesson()} allowedVideoHosts={HOSTS} />);
        const frame = host.querySelector("iframe")!;

        expect(frame.getAttribute("src")).toBe("https://www.youtube.com/embed/abc");
        // Without a sandbox the framed page runs with no restrictions at all.
        expect(frame.getAttribute("sandbox")).toContain("allow-scripts");
        expect(frame.getAttribute("sandbox")).not.toContain("allow-top-navigation");
        expect(frame.getAttribute("referrerPolicy") ?? frame.getAttribute("referrerpolicy"))
            .toBe("strict-origin-when-cross-origin");
    });

    it("refuses to frame a URL that is not on the allowlist", () => {
        const host = mount(
            <LessonView lesson={lesson({ video_url: "https://evil.example/pwn" })} allowedVideoHosts={HOSTS} />,
        );

        expect(host.querySelector("iframe")).toBeNull();
    });

    it("says so loudly instead of rendering an empty lesson", () => {
        // A blocked embed that rendered nothing looks like a lesson with no
        // video, and nobody would know to fix the URL.
        const host = mount(
            <LessonView lesson={lesson({ video_url: "https://evil.example/pwn" })} allowedVideoHosts={HOSTS} />,
        );

        expect(host.textContent).toContain("cannot be shown here");
    });

    it("offers the blocked URL as a plain link, with the opener detached", () => {
        const host = mount(
            <LessonView lesson={lesson({ video_url: "https://evil.example/pwn" })} allowedVideoHosts={HOSTS} />,
        );
        const link = host.querySelector<HTMLAnchorElement>('a[href="https://evil.example/pwn"]')!;

        expect(link).not.toBeNull();
        expect(link.rel).toContain("noopener");
        expect(link.rel).toContain("noreferrer");
    });

    it("renders no video block at all for a text lesson", () => {
        const host = mount(
            <LessonView lesson={lesson({ content_type: "text", content: "<p>words</p>" })} allowedVideoHosts={HOSTS} />,
        );

        expect(host.querySelector("iframe")).toBeNull();
        expect(host.textContent).not.toContain("cannot be shown here");
    });
});
