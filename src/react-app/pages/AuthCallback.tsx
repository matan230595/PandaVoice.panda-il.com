import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    window.location.replace('/');
  }, []);
  return null;
}
