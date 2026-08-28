import Toast from 'toastify-react-native';

export { Toast };

const ToastCaller: any = Toast;

export const showToast = {
  success: (message: string) => {
    try {
      if (ToastCaller?.success) {
        ToastCaller.success(message, 'top');
      }
    } catch {
      // safe fallback
    }
  },
  error: (message: string) => {
    try {
      if (ToastCaller?.error) {
        ToastCaller.error(message, 'top');
      }
    } catch {
      // safe fallback
    }
  },
  info: (message: string) => {
    try {
      if (ToastCaller?.info) {
        ToastCaller.info(message, 'top');
      }
    } catch {
      // safe fallback
    }
  },
  warn: (message: string) => {
    try {
      if (ToastCaller?.warn) {
        ToastCaller.warn(message, 'top');
      }
    } catch {
      // safe fallback
    }
  },
};
