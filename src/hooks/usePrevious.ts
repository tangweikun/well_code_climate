import { useRef, useEffect } from 'react';

// FIXME: 尝试使用泛型
export function usePrevious(value: any): any {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
