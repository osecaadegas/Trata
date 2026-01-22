import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Home } from 'lucide-react';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Link inválido - token não encontrado');
      return;
    }

    // The unsubscribe happens on the API side, this page just shows the result
    // But we can also trigger it from here for client-side rendering
    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/unsubscribe?token=${token}`);
        
        if (response.ok) {
          setStatus('success');
        } else {
          const text = await response.text();
          // Check if it's an HTML error page
          if (text.includes('Token inválido')) {
            setStatus('error');
            setErrorMessage('Token inválido ou expirado');
          } else {
            setStatus('success'); // The API might return HTML success page
          }
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
        setErrorMessage('Erro ao processar pedido');
      }
    };

    // Small delay to show loading state
    setTimeout(unsubscribe, 500);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center">
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              A processar...
            </h1>
            <p className="text-gray-600">
              Aguarde enquanto cancelamos a sua subscrição.
            </p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Subscrição cancelada
            </h1>
            <p className="text-gray-600 mb-6">
              O seu email foi removido com sucesso da nossa lista de comunicações de marketing.
              Já não receberá alertas de novos imóveis.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">
                Se isto foi um erro, pode voltar a subscrever a qualquer momento.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Voltar ao site
            </Link>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Erro
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage || 'Não foi possível processar o seu pedido.'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              O link de cancelamento pode ser inválido ou já foi utilizado.
              Se pretende cancelar a sua subscrição, entre em contacto connosco.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Voltar ao site
            </Link>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            Trata Imobiliária · Braga, Portugal
          </p>
        </div>
      </div>
    </div>
  );
}
