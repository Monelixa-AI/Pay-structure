import { Section, Text } from '@react-email/components';

interface EmailHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function EmailHeader({
  title = 'Monelixa',
  subtitle,
}: EmailHeaderProps) {
  return (
    <Section style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Section>
  );
}

const styles = {
  wrapper: {
    padding: '16px 20px',
    backgroundColor: '#111111',
    borderRadius: '12px',
    border: '1px solid #222222',
    marginBottom: '16px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '13px',
    color: '#9ca3af',
  },
};
