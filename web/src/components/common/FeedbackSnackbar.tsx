import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import type { Feedback } from '../../hooks/useFeedback';

type FeedbackSnackbarProps = {
  feedback: Feedback | null;
  onClose: () => void;
};

export function FeedbackSnackbar({ feedback, onClose }: FeedbackSnackbarProps) {
  return (
    <Snackbar
      open={feedback !== null}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {feedback ? (
        <Alert severity={feedback.severity} variant="filled" onClose={onClose}>
          {feedback.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
