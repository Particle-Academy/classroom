import { Action, Card, Heading, Text } from '@particle-academy/react-fancy';
import type { Certificate } from '../types';

export interface CertificateViewProps {
    certificate: Certificate;
    pdfUrl: string;
    recipientName?: string;
    programTitle?: string;
}

export function CertificateView({
    certificate,
    pdfUrl,
    recipientName,
    programTitle,
}: CertificateViewProps) {
    return (
        <Card
            variant="outlined"
            padding="none"
            className="!rounded-xl !border-secondary-200 !bg-white !shadow-sm overflow-hidden"
        >
            <div
                className="text-center p-8 sm:p-12 bg-[#fdfaf3] m-3 rounded-lg"
                style={{ border: '8px double #b08d57' }}
            >
                <Text
                    size="sm"
                    weight="semibold"
                    className="uppercase tracking-[0.4em] !text-[#8a6d3b]"
                >
                    Certificate of Completion
                </Text>
                <Heading
                    as="h1"
                    size="2xl"
                    weight="bold"
                    className="mt-4 !text-secondary-900 !text-3xl sm:!text-4xl"
                >
                    {programTitle ?? 'Course Completion'}
                </Heading>
                <Text className="mt-6 !text-secondary-700">This is to certify that</Text>
                <Heading
                    as="h2"
                    size="xl"
                    weight="bold"
                    className="!mt-3 !text-secondary-900"
                    style={{ fontStyle: 'italic' }}
                >
                    {recipientName ?? 'Learner'}
                </Heading>
                <Text className="mt-3 !text-secondary-700">
                    has successfully completed the program.
                </Text>
                <Text size="sm" color="muted" className="!mt-6">
                    Issued {new Date(certificate.issued_at).toLocaleDateString()} · Verification{' '}
                    <span className="font-mono">{certificate.verification_code}</span>
                </Text>
            </div>
            <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50/50 flex justify-center gap-3">
                <Action
                    href={pdfUrl}
                    className="!bg-brand hover:!bg-primary-600 !text-white !font-semibold !px-6 !py-2.5 !rounded-md !shadow-sm"
                >
                    Download PDF
                </Action>
            </div>
        </Card>
    );
}
