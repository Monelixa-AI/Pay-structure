import { Section, Text } from '@react-email/components';

interface EmailFooterProps {
  supportEmail?: string;
  company?: string;
}

export default function EmailFooter({
  supportEmail = 'support@monelixa.com',
  company = 'Monelixa',
}: EmailFooterProps) {
  return (
    <Section style={styles.wrapper}>
      <Text style={styles.text}>Need help? Contact {supportEmail}</Text>
      <Text style={styles.text}>{company} - All rights reserved.</Text>
    </Section>
  );
}

const styles = {
  wrapper: {
    marginTop: '20px',
    paddingTop: '12px',
    borderTop: '1px solid #222222',
  },
  text: {
    margin: '6px 0',
    fontSize: '12px',
    color: '#9ca3af',
  },
};
