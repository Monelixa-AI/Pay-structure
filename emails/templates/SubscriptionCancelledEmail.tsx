import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface SubscriptionCancelledEmailProps {
  customerName?: string;
  productName?: string;
  endDate?: string;
}

export default function SubscriptionCancelledEmail({
  customerName = 'Customer',
  productName = 'Subscription',
  endDate,
}: SubscriptionCancelledEmailProps) {
  return (
    <EmailLayout preview="Subscription cancelled">
      <EmailHeader title="Subscription cancelled" subtitle="We are sorry to see you go" />
      <EmailCard>
        <Text style={styles.text}>Hi {customerName},</Text>
        <Text style={styles.text}>
          Your subscription for {productName} has been cancelled.
        </Text>
        {endDate ? (
          <Text style={styles.text}>Access ends on: {endDate}</Text>
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
