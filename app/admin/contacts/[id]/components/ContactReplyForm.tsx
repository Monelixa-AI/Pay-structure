'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Textarea } from '@/components/ui';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactReplyFormProps {
  contactId: string;
  contactEmail: string;
  originalSubject: string;
  originalMessage: string;
}

export default function ContactReplyForm({
  contactId,
  contactEmail,
  originalSubject,
  originalMessage,
}: ContactReplyFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please write a reply');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/contacts/${contactId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      toast.success('Reply sent');
      setMessage('');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Reply failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Reply message
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your reply..."
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-2">
          This reply will be sent to <span className="text-white">{contactEmail}</span>.
        </p>
      </div>

      <div className="bg-dark-800 rounded-lg p-4 text-sm text-gray-400">
        <p className="font-medium text-white mb-2">Original</p>
        {originalSubject ? <p>Subject: {originalSubject}</p> : null}
        <p className="mt-2">{originalMessage}</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} leftIcon={<Send className="w-4 h-4" />}>
          Send reply
        </Button>
      </div>
    </form>
  );
}
