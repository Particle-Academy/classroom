// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { answerValueToPayload } from "../src/components/QuestionRenderer";
import { CertificateView } from "../src/components/CertificateView";

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

describe("answerValueToPayload", () => {
    // This is the wire format a graded answer is submitted in. Getting a shape
    // wrong here does not throw — it submits an answer the server cannot read,
    // which surfaces as a learner's correct answer being marked wrong.

    it("wraps a single choice under option_id", () => {
        expect(answerValueToPayload(7, { kind: "option_id", value: 42 })).toEqual({
            question_id: 7,
            answer: { option_id: 42 },
        });
    });

    it("wraps a multi choice under option_ids, keeping order", () => {
        expect(answerValueToPayload(7, { kind: "option_ids", value: [3, 1, 2] })).toEqual({
            question_id: 7,
            answer: { option_ids: [3, 1, 2] },
        });
    });

    it("wraps free text under text", () => {
        expect(answerValueToPayload(7, { kind: "text", value: "because" })).toEqual({
            question_id: 7,
            answer: { text: "because" },
        });
    });

    it("sends a null answer for an unanswered question rather than omitting it", () => {
        // An omitted question and a deliberately skipped one are different
        // things to a grader; null is what says "seen, not answered".
        expect(answerValueToPayload(7, null)).toEqual({ question_id: 7, answer: null });
        expect(answerValueToPayload(7, undefined as never)).toEqual({ question_id: 7, answer: null });
    });

    it("keeps an empty multi-select as an empty list, not null", () => {
        // Deselecting every option is an answer — "none of these" — and must not
        // collapse into "did not answer".
        expect(answerValueToPayload(7, { kind: "option_ids", value: [] })).toEqual({
            question_id: 7,
            answer: { option_ids: [] },
        });
    });

    it("preserves an empty string, which is not the same as no answer", () => {
        expect(answerValueToPayload(7, { kind: "text", value: "" })).toEqual({
            question_id: 7,
            answer: { text: "" },
        });
    });

    it("produces JSON-serialisable output for every shape", () => {
        const shapes = [
            { kind: "option_id", value: 1 },
            { kind: "option_ids", value: [1, 2] },
            { kind: "text", value: "x" },
            null,
        ] as const;

        for (const s of shapes) {
            const payload = answerValueToPayload(1, s as never);
            expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
        }
    });
});

describe("CertificateView", () => {
    const certificate = {
        id: 1,
        enrollment_id: 2,
        verification_code: "CERT-123",
        issued_at: "2026-01-01T12:00:00Z",
        pdf_path: null,
        metadata: null,
    } as never;

    it("renders the learner and programme it certifies", () => {
        // A certificate that renders without its subject is worse than an error
        // — it still looks issued.
        const host = mount(
            <CertificateView
                certificate={certificate}
                pdfUrl="/c.pdf"
                recipientName="Ada Lovelace"
                programTitle="Analytical Engines"
            />,
        );

        expect(host.textContent).toContain("Ada Lovelace");
        expect(host.textContent).toContain("Analytical Engines");
    });

    it("shows the verification code, which is what makes a certificate checkable", () => {
        const host = mount(<CertificateView certificate={certificate} pdfUrl="/c.pdf" />);

        expect(host.textContent).toContain("CERT-123");
    });

    it("falls back to neutral wording when the name is not supplied", () => {
        // Both props are optional, so the component has to render something
        // rather than "undefined" on a certificate.
        const host = mount(<CertificateView certificate={certificate} pdfUrl="/c.pdf" />);

        expect(host.textContent).not.toContain("undefined");
    });

    it("links the PDF it was given", () => {
        const host = mount(<CertificateView certificate={certificate} pdfUrl="/certs/1.pdf" />);

        const link = host.querySelector<HTMLAnchorElement>('a[href="/certs/1.pdf"]');
        expect(link).not.toBeNull();
    });
});
