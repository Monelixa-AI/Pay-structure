import { Section } from '@react-email/components';

interface EmailCardProps {
  children: React.ReactNode;
}

export default function EmailCard({ children }: EmailCardProps) {
  return <Section style={styles.card}>{children}</Section>;
}

const styles = {
  card: {
    backgroundColor: '#111111',
    borderRadius: '12px',
    border: '1px solid #222222',
    padding: '20px',
    marginBottom: '16px',
  },
};
