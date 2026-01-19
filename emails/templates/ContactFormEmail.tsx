import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export default function ContactFormEmail({
  name,
  email,
  subject,
  message,
}: ContactFormEmailProps) {
  return (
    <EmailLayout preview="New contact message">
      <EmailHeader title="New contact message" subtitle="Customer inquiry" />
      <EmailCard>
        <Text style={styles.text}>Name: {name}</Text>
        <Text style={styles.text}>Email: {email}</Text>
        {subject ? <Text style={styles.text}>Subject: {subject}</Text> : null}
        <Text style={styles.text}>Message:</Text>
        <Text style={styles.message}>{message}</Text>
      </EmailCard>
      <EmailFooter />
    </EmailLayout>
  );
}

const styles = {
  text: {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#e5e7eb',
    margin: '0 0 10px',
  },
  message: {
    fontSize: '13px',
    lineHeight: '20px',
    color: '#cbd5f5',
    backgroundColor: '#0f0f0f',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #222222',
  },
};
