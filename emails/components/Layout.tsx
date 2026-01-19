import { Html, Body, Container, Section, Text, Preview } from '@react-email/components';

interface EmailLayoutProps {
  preview?: string;
  title?: string;
  children: React.ReactNode;
}

export default function EmailLayout({
  preview = 'Monelixa notification',
  title = 'Monelixa',
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </Section>
          {children}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This email was sent by Monelixa.
            </Text>
            <Text style={styles.footerText}>
              If you did not request this email, you can ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#0a0a0a',
    color: '#f5f5f5',
    fontFamily: 'Arial, Helvetica, sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    margin: '0 auto',
    padding: '24px',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: '#111111',
    padding: '18px 20px',
    borderRadius: '10px 10px 0 0',
    border: '1px solid #222222',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#ef4444',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #222222',
  },
  footerText: {
    margin: '6px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
};
