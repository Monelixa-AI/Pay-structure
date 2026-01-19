import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface ContactReplyEmailProps {
  name?: string;
  originalSubject?: string;
  originalMessage?: string;
  replyMessage: string;
  repliedBy?: string;
}

export default function ContactReplyEmail({
  name = 'Customer',
  originalSubject,
  originalMessage,
  replyMessage,
  repliedBy,
}: ContactReplyEmailProps) {
  return (
    <EmailLayout preview="We replied to your message">
      <EmailHeader title="We replied" subtitle="Support response" />
      <EmailCard>
        <Text style={styles.text}>Hi {name},</Text>
        {originalSubject ? (
          <Text style={styles.text}>Subject: {originalSubject}</Text>
        ) : null}
        {originalMessage ? (
          <Text style={styles.message}>Original: {originalMessage}</Text>
        ) : null}
        <Text style={styles.text}>Reply:</Text>
        <Text style={styles.message}>{replyMessage}</Text>
        {repliedBy ? (
          <Text style={styles.text}>Replied by: {repliedBy}</Text>
        ) : null}
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
    margin: '0 0 12px',
  },
};
