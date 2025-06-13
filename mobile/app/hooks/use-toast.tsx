import { useCallback } from 'react';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    Toast.show({
      type: variant === 'destructive' ? 'error' : 'success',
      text1: title,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  }, []);

  return { toast };
}

export default useToast; 