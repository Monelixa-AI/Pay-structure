import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailButton from '../components/Button';
import EmailCard from '../components/Card';

interface WelcomeEmailProps {
  name?: string;
  loginUrl?: string;
}

export default function WelcomeEmail({
  name = 'there',
  loginUrl = 'https://monelixa.com/login',
}: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to Monelixa">
      <EmailHeader title="Welcome" subtitle="Your account is ready" />
      <EmailCard>
        <Text style={styles.text}>Hi {name},</Text>
        <Text style={styles.text}>
          Welcome to Monelixa. Your account has been created successfully.
        </Text>
        <EmailButton href={loginUrl} label="Go to dashboard" />
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
    margin: '0 0 12px',
  },
};
