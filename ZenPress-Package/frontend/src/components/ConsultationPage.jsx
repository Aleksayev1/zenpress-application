import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Shield
} from 'lucide-react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';

const ConsultationPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    urgency: '',
    condition: '',
    duration: '',
    previousTreatments: '',
    currentMedications: '',
    symptoms: '',
    preferredTime: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWhatsAppContact = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.condition || !formData.symptoms) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Format WhatsApp message
    const message = `
🏥 *CONSULTA ZENPRESS - CASO COMPLEXO*

👤 *Dados Pessoais:*
• Nome: ${formData.name}
• Email: ${formData.email}
• Telefone: ${formData.phone}

⚡ *Urgência:* ${formData.urgency}

🩺 *Condição Principal:*
${formData.condition}

⏰ *Duração dos Sintomas:*
${formData.duration}

📋 *Sintomas Detalhados:*
${formData.symptoms}

💊 *Tratamentos Anteriores:*
${formData.previousTreatments || 'Nenhum informado'}

💉 *Medicamentos Atuais:*
${formData.currentMedications || 'Nenhum informado'}

🕐 *Preferência de Horário:*
${formData.preferredTime}

---
Enviado pelo App ZenPress
`.trim();

    // WhatsApp number - número real
    const whatsappNumber = '5562983316363'; // Número correto: (62) 98331-6363
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Consulta Especializada</h1>
          <p className="text-gray-600">Para casos complexos que precisam de atenção personalizada</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Information Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Atendimento Especializado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Profissional Qualificado</h4>
                  <p className="text-sm text-gray-600">Alexandre Pinheiro - 15 anos de experiência</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Resposta Rápida</h4>
                  <p className="text-sm text-gray-600">Retorno em até 2 horas durante horário comercial</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">WhatsApp Direto</h4>
                  <p className="text-sm text-gray-600">Atendimento personalizado via mensagem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quando Procurar?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Dores crônicas que não melhoram</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Condições neurológicas complexas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Casos que não respondem ao tratamento padrão</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <span>Necessidade de protocolo personalizado</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex justify-center space-x-1 mb-2">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-green-700 font-medium">
                  "Atendimento excepcional! Resolveu minha dor crônica em poucas sessões."
                </p>
                <p className="text-xs text-green-600 mt-1">- Maria S., São Paulo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consultation Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Formulário de Consulta</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para receber atendimento personalizado via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Dados Pessoais</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="urgency">Nível de Urgência *</Label>
                    <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">🟢 Baixa - Posso aguardar alguns dias</SelectItem>
                        <SelectItem value="media">🟡 Média - Gostaria de resposta hoje</SelectItem>
                        <SelectItem value="alta">🟠 Alta - Preciso de resposta urgente</SelectItem>
                        <SelectItem value="emergencia">🔴 Emergência - Dor insuportável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Informações Médicas</span>
                </h3>

                <div>
                  <Label htmlFor="condition">Condição Principal *</Label>
                  <Input
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    placeholder="Ex: Enxaqueca crônica, Fibromialgia, Dor lombar..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Há quanto tempo tem esses sintomas?</Label>
                  <Select onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Duração dos sintomas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-7-dias">1-7 dias</SelectItem>
                      <SelectItem value="1-4-semanas">1-4 semanas</SelectItem>
                      <SelectItem value="1-6-meses">1-6 meses</SelectItem>
                      <SelectItem value="6-12-meses">6-12 meses</SelectItem>
                      <SelectItem value="mais-1-ano">Mais de 1 ano</SelectItem>
                      <SelectItem value="varios-anos">Vários anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="symptoms">Descreva seus sintomas detalhadamente *</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    placeholder="Descreva: intensidade da dor (1-10), quando piora/melhora, sintomas associados, etc."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="previousTreatments">Tratamentos já realizados</Label>
                  <Textarea
                    id="previousTreatments"
                    value={formData.previousTreatments}
                    onChange={(e) => handleInputChange('previousTreatments', e.target.value)}
                    placeholder="Ex: Fisioterapia, medicamentos, outras terapias..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="currentMedications">Medicamentos atuais</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    placeholder="Liste medicamentos que usa regularmente..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="preferredTime">Preferência de horário para retorno</Label>
                  <Select onValueChange={(value) => handleInputChange('preferredTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quando prefere ser contactado?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">Manhã (8h-12h)</SelectItem>
                      <SelectItem value="tarde">Tarde (12h-18h)</SelectItem>
                      <SelectItem value="noite">Noite (18h-22h)</SelectItem>
                      <SelectItem value="qualquer">Qualquer horário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Disclaimer */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Importante:</strong> Este serviço não substitui consulta médica. 
                  Em casos de emergência, procure atendimento médico imediatamente.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className="space-y-4">
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full" 
                  size="lg"
                  disabled={!formData.name || !formData.phone || !formData.condition || !formData.symptoms}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enviar via WhatsApp
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Ao enviar, você será redirecionado para o WhatsApp com sua mensagem pré-formatada
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default ConsultationPage;