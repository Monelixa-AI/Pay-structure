import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  label: string;
}

export default function EmailButton({ href, label }: EmailButtonProps) {
  return (
    <Button href={href} style={styles.button}>
      {label}
    </Button>
  );
}

const styles = {
  button: {
    display: 'inline-block',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    padding: '12px 18px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
};
