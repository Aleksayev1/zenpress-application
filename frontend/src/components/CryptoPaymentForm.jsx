import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const CryptoPaymentForm = ({ subscriptionType, onPaymentCreated, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated, token, user } = useAuth();
  const [selectedCrypto, setSelectedCrypto] = useState('PIX');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('selecting'); // selecting, payment_created, confirming, confirmed
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [txHash, setTxHash] = useState('');

  // Check authentication on mount
  useEffect(() => {
    console.log('🔐 CRYPTO PAYMENT - Auth check:', {
      authenticated: isAuthenticated,
      hasToken: !!token,
      tokenType: token ? (token.startsWith('eyJ') ? 'JWT' : 'LOCAL') : 'NONE',
      user: user?.email || 'None'
    });
    
    if (!isAuthenticated || !token || !token.startsWith('eyJ')) {
      setError('Para efetuar pagamentos, você precisa estar logado com uma conta válida.');
    }
  }, [isAuthenticated, token, user]);

  // Preços das assinaturas
  const prices = {
    premium_monthly: { brl: 29.90, usd: 5.99 },
    premium_yearly: { brl: 299.90, usd: 59.99 }
  };

  // Informações das criptomoedas
  const cryptoInfo = {
    BTC: {
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      network: 'Bitcoin Network',
      description: 'Rede Bitcoin Principal'
    },
    USDT_TRC20: {
      name: 'USDT (TRC20)',
      symbol: 'USDT',
      icon: '₮',
      network: 'TRON Network',
      description: 'USDT na rede TRON (TRC20)'
    },
    USDT_ERC20: {
      name: 'USDT (ERC20)', 
      symbol: 'USDT',
      icon: '₮',
      network: 'Ethereum Network',
      description: 'USDT na rede Ethereum (ERC20)'
    },
    PIX: {
      name: 'PIX',
      symbol: 'PIX',
      icon: '🏦',
      network: 'Sistema de Pagamentos Instantâneos',
      description: 'Pagamento instantâneo brasileiro'
    }
  };

  const createPayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.post('/crypto/create-payment', {
        subscription_type: subscriptionType,
        crypto_currency: selectedCrypto
      });
      
      setPaymentData(response.data);
      setPaymentStatus('payment_created');
      
      if (onPaymentCreated) {
        onPaymentCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentData?.transaction_id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.post(`/crypto/confirm-payment/${paymentData.transaction_id}`, {
        tx_hash: txHash,
        message: confirmationMessage
      });
      
      setPaymentStatus('confirmed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao confirmar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar um toast de sucesso
  };

  if (paymentStatus === 'confirmed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('crypto.payment_confirmed')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('crypto.verification_message')}
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {t('crypto.payment_title')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Seleção de Criptomoeda */}
          {paymentStatus === 'selecting' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('crypto.select_currency')}</h3>
              
              {/* Resumo do Plano */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {subscriptionType === 'premium_monthly' ? t('premium.monthly') : t('premium.yearly')}
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('crypto.price_brl')}:</span>
                  <span className="font-medium">R$ {prices[subscriptionType]?.brl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('crypto.price_usd')}:</span>
                  <span className="font-medium text-blue-600">${prices[subscriptionType]?.usd}</span>
                </div>
              </div>

              {/* Opções de Criptomoeda */}
              <div className="space-y-3 mb-6">
                {Object.entries(cryptoInfo).map(([key, crypto]) => (
                  <label key={key} className="cursor-pointer">
                    <div className={`border rounded-lg p-4 transition-all ${
                      selectedCrypto === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="crypto"
                          value={key}
                          checked={selectedCrypto === key}
                          onChange={(e) => setSelectedCrypto(e.target.value)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{crypto.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{crypto.name}</div>
                              <div className="text-sm text-gray-500">{crypto.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={createPayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? t('common.loading') : t('crypto.generate_payment')}
              </button>
            </div>
          )}

          {/* Dados do Pagamento */}
          {paymentStatus === 'payment_created' && paymentData && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('crypto.payment_instructions')}</h3>
              
              {/* Valor e Moeda */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {selectedCrypto === 'PIX' 
                      ? `R$ ${paymentData.amount_brl}` 
                      : `$${paymentData.amount_usd} USD`
                    }
                  </div>
                  <div className="text-sm text-blue-700">
                    {t('crypto.send_exactly')} {cryptoInfo[selectedCrypto]?.name}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {paymentData.qr_code && (
                <div className="text-center mb-6">
                  <img 
                    src={paymentData.qr_code} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto border rounded-lg"
                  />
                  <p className="text-sm text-gray-600 mt-2">{t('crypto.scan_qr')}</p>
                </div>
              )}

              {/* Endereço */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedCrypto === 'PIX' ? 'Chave PIX:' : t('crypto.wallet_address') + ':'}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={paymentData.wallet_address}
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentData.wallet_address)}
                    className="px-4 py-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300"
                    title={t('crypto.copy_address')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Formulário de Confirmação */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">{t('crypto.confirm_payment')}</h4>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('crypto.tx_hash')} ({t('crypto.optional')}):
                    </label>
                    <input
                      type="text"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder={t('crypto.tx_hash_placeholder')}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('crypto.message')} ({t('crypto.optional')}):
                    </label>
                    <textarea
                      value={confirmationMessage}
                      onChange={(e) => setConfirmationMessage(e.target.value)}
                      placeholder={t('crypto.message_placeholder')}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={confirmPayment}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? t('common.loading') : t('crypto.confirm_payment')}
                </button>
                
                <p className="text-sm text-gray-600 text-center mt-4">
                  {t('crypto.verification_time')}
                </p>
              </div>

              {/* Tempo de Expiração */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    {t('crypto.expires_at')}: {new Date(paymentData.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentForm;