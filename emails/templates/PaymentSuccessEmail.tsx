import { Text } from '@react-email/components';
import EmailLayout from '../components/Layout';
import EmailHeader from '../components/Header';
import EmailFooter from '../components/Footer';
import EmailCard from '../components/Card';

interface PaymentSuccessEmailProps {
  customerName?: string;
  productName: string;
  amount: number;
  currency: string;
  orderId?: string;
}

export default function PaymentSuccessEmail({
  customerName = 'Customer',
  productName,
  amount,
  currency,
  orderId,
}: PaymentSuccessEmailProps) {
  return (
    <EmailLayout preview="Payment received">
      <EmailHeader title="Payment successful" subtitle="Your order is confirmed" />
      <EmailCard>
        <Text style={styles.text}>Hi {customerName},</Text>
        <Text style={styles.text}>
          We have received your payment for {productName}.
        </Text>
        {orderId ? (
          <Text style={styles.text}>Order ID: {orderId}</Text>
        ) : null}
        <Text style={styles.text}>
          Amount: {amount} {currency}
        </Text>
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
