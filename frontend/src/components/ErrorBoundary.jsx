import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debug, mas não trava o app
    console.warn('Error caught by boundary:', error);
    console.warn('Error info:', errorInfo);
    
    // Se for erro de extensão, ignora
    if (error?.stack?.includes('chrome-extension://') || 
        error?.message?.includes('chrome-extension://')) {
      console.log('Extension error ignored:', error.message);
      this.setState({ hasError: false, error: null });
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      // Só mostra erro se não for de extensão
      if (this.state.error?.stack?.includes('chrome-extension://')) {
        return this.props.children;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700"
            >
              Recarregar Página
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-gray-500 text-sm">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs text-gray-400 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;