import * as React from 'react';
import * as ReactDOM from 'react-router-dom';

export function usePreventNavigation(
  shouldBlock: boolean,
  allowNavigationRef: React.MutableRefObject<boolean>
) {
  const blocker = ReactDOM.useBlocker(
    ({ currentLocation, nextLocation }) =>
      shouldBlock &&
      !allowNavigationRef.current
      && currentLocation.pathname !== nextLocation.pathname
  );

  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldBlock || allowNavigationRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    if (shouldBlock && !allowNavigationRef.current) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldBlock, allowNavigationRef.current]);

  return blocker;
}