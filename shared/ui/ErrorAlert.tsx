import Alert from '@/shared/ui/Alert';

type ErrorAlertProps = {
  children: React.ReactNode;
};

export default function ErrorAlert({ children }: ErrorAlertProps) {
  return (
    <Alert className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      {children}
    </Alert>
  );
}
