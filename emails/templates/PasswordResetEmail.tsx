import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailButton from '../components/Button';
import EmailCard from '../components/Card';

interface PasswordResetEmailProps {
  name?: string;
  resetUrl: string;
}

export default function PasswordResetEmail({
  name = 'there',
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Password reset">
      <EmailHeader title="Reset your password" subtitle="Secure access" />
      <EmailCard>
        <Text style={styles.text}>Hi {name},</Text>
        <Text style={styles.text}>
          Click the button below to reset your password.
        </Text>
        <EmailButton href={resetUrl} label="Reset password" />
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
