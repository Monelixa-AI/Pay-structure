import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface PaymentFailedEmailProps {
  customerName?: string;
  productName: string;
  reason?: string;
  orderId?: string;
}

export default function PaymentFailedEmail({
  customerName = 'Customer',
  productName,
  reason,
  orderId,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview="Payment failed">
      <EmailHeader title="Payment failed" subtitle="Action required" />
      <EmailCard>
        <Text style={styles.text}>Hi {customerName},</Text>
        <Text style={styles.text}>
          Your payment for {productName} could not be completed.
        </Text>
        {orderId ? (
          <Text style={styles.text}>Order ID: {orderId}</Text>
        ) : null}
        {reason ? (
          <Text style={styles.text}>Reason: {reason}</Text>
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
