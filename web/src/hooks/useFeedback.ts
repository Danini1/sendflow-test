import { useCallback, useState } from 'react';

export type Feedback = {
  message: string;
  severity: 'success' | 'error';
};

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showSuccess = useCallback(
    (message: string) => setFeedback({ message, severity: 'success' }),
    [],
  );
  const showError = useCallback(
    (message: string) => setFeedback({ message, severity: 'error' }),
    [],
  );
  const clearFeedback = useCallback(() => setFeedback(null), []);

  return { feedback, showSuccess, showError, clearFeedback };
}
