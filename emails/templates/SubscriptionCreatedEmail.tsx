import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface SubscriptionCreatedEmailProps {
  customerName?: string;
  productName?: string;
  amount?: number;
  currency?: string;
}

export default function SubscriptionCreatedEmail({
  customerName = 'Customer',
  productName = 'Subscription',
  amount,
  currency,
}: SubscriptionCreatedEmailProps) {
  return (
    <EmailLayout preview="Subscription started">
      <EmailHeader title="Subscription active" subtitle="You are all set" />
      <EmailCard>
        <Text style={styles.text}>Hi {customerName},</Text>
        <Text style={styles.text}>
          Your subscription for {productName} is now active.
        </Text>
        {amount && currency ? (
          <Text style={styles.text}>
            Amount: {amount} {currency}
          </Text>
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
    margin: '0 0 12px',
  },
};
