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
        <Card padding="lg">
            <div
                style={{
                    padding: '2.5rem',
                    display: 'grid',
                    gap: '1rem',
                    textAlign: 'center',
                    border: '6px double #b08d57',
                    borderRadius: '0.75rem',
                    background: '#fdfaf3',
                    color: '#1a1a1a',
                }}
            >
                <Text
                    size="sm"
                    style={{
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        color: '#8a6d3b',
                    }}
                >
                    Certificate of Completion
                </Text>
                <Heading as="h1" size="2xl">{programTitle ?? 'Course Completion'}</Heading>
                <Text>This is to certify that</Text>
                <Heading as="h2" size="xl" style={{ fontStyle: 'italic' }}>
                    {recipientName ?? 'Learner'}
                </Heading>
                <Text>has successfully completed the program.</Text>
                <Text size="sm" color="muted">
                    Issued {new Date(certificate.issued_at).toLocaleDateString()} · Verification{' '}
                    {certificate.verification_code}
                </Text>
            </div>
            <div
                style={{
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                }}
            >
                <Action href={pdfUrl}>Download PDF</Action>
            </div>
        </Card>
    );
}
