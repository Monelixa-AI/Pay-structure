import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface SubscriptionRenewalEmailProps {
  customerName?: string;
  productName?: string;
  amount?: number;
  currency?: string;
  nextBillingDate?: string;
}

export default function SubscriptionRenewalEmail({
  customerName = 'Customer',
  productName = 'Subscription',
  amount,
  currency,
  nextBillingDate,
}: SubscriptionRenewalEmailProps) {
  return (
    <EmailLayout preview="Subscription renewed">
      <EmailHeader title="Subscription renewed" subtitle="Your plan continues" />
      <EmailCard>
        <Text style={styles.text}>Hi {customerName},</Text>
        <Text style={styles.text}>
          Your subscription for {productName} has been renewed.
        </Text>
        {amount && currency ? (
          <Text style={styles.text}>
            Amount: {amount} {currency}
          </Text>
        ) : null}
        {nextBillingDate ? (
          <Text style={styles.text}>Next billing date: {nextBillingDate}</Text>
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
