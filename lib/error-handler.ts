// Global error handler for filtering out extension and external errors
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // List of error patterns to suppress
  const suppressedErrorPatterns = [
    'Extension context invalidated',
    'polyfill.js',
    'knock.app',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'Non-Error promise rejection captured',
  ];

  // Override console.error to filter extension errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };

  // Global error event handler
  window.addEventListener('error', (event) => {
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      event.message.toLowerCase().includes(pattern.toLowerCase()) ||
      (event.filename && event.filename.includes(pattern))
    );
    
    if (shouldSuppress) {
      event.preventDefault();
      return false;
    }
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.toString() || '';
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (shouldSuppress) {
      event.preventDefault();
      return false;
    }
  });
}
