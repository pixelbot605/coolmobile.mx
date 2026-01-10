import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  CheckCircle, 
  ChevronRight, 
  Activity, 
  AlertCircle, 
  RefreshCcw, 
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Smile,
  Smartphone,
  XCircle,
  FileText,
  CreditCard,
  Globe,
  SwitchCamera
} from 'lucide-react';

/**
 * =============================================================================
 * GUÍA PARA DESARROLLADORES BACKEND
 * =============================================================================
 * Este frontend simula los tiempos de respuesta y validaciones.
 * Para integrar con la API real, busquen los comentarios marcados como:
 * "BACKEND INTEGRATION"
 * * Flujo de Datos:
 * 1. Validación Teléfono -> GET/POST a endpoint de validación.
 * 2. Datos Personales -> Validación local, se envían al final o paso a paso según arquitectura.
 * 3. Imágenes -> Se generan en Base64 (image/jpeg). 
 * - INE/Pasaporte: Usa cámara trasera (environment).
 * - Liveness: Usa cámara frontal (user).
 * =============================================================================
 */

// BACKEND INTEGRATION: Configuración de Endpoints
export const API_ENDPOINTS = {
  VALIDATE_PHONE: '/api/v1/user/validate-phone', 
  VALIDATE_USER_DATA: '/api/v1/user/validate-data',
  UPLOAD_DOCUMENT: '/api/v1/documents/upload', 
  LIVENESS_CHECK: '/api/v1/biometrics/liveness',
  FINAL_VERIFICATION: '/api/v1/verification/status'
};

// --- ESTILOS Y COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', icon: Icon }: any) => {
  const baseStyle = "flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto";
  const variants = {
    primary: "bg-gradient-to-r from-[#011e29] via-[#004762] to-[#003242] hover:opacity-90 text-white shadow-lg shadow-[#004762]/30",
    secondary: "bg-white border-2 border-gray-200 text-[#004762] hover:border-[#004762] hover:text-[#003242]",
    outline: "border-2 border-white/30 text-white hover:bg-white/10",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {Icon && <Icon size={20} className="mr-2" />}
      {children}
    </button>
  );
};

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div 
          key={idx}
          className={`h-2 rounded-full transition-all duration-500 ${
            idx + 1 === currentStep ? 'w-8 bg-[#004762]' : 
            idx + 1 < currentStep ? 'w-2 bg-green-500' : 'w-2 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

// --- COMPONENTES LÓGICOS ---

// 1. Validación de Teléfono
const PhoneValidationStep = ({ onComplete }: any) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<'none' | 'invalid_carrier' | 'already_registered'>('none');

  const validatePhoneApi = async (phoneNumber: string) => {
    setIsLoading(true);
    setErrorState('none');
    
    // BACKEND: Reemplazar con fetch real
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        if (phoneNumber === '0000000000') resolve({ status: 'rejected', reason: 'invalid_carrier' });
        else if (phoneNumber === '1111111111') resolve({ status: 'rejected', reason: 'already_registered' });
        else resolve({ status: 'approved' });
      }, 1500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    const result: any = await validatePhoneApi(phone);
    if (result.status === 'approved') onComplete(phone);
    else setErrorState(result.reason);
  };

  if (errorState === 'invalid_carrier') {
    return (
      <div className="animate-fade-in-up text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Número no compatible</h2>
        <p className="text-gray-600 mb-6">Lo sentimos, este número no pertenece a la red <span className="font-bold text-[#004762]">Cool Mobile</span>.</p>
        <button onClick={() => setErrorState('none')} className="text-[#004762] hover:underline text-sm">Intentar con otro número</button>
      </div>
    );
  }

  if (errorState === 'already_registered') {
    return (
      <div className="animate-fade-in-up text-center">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Número ya registrado</h2>
        <p className="text-gray-600 mb-6">El número ingresado ya cuenta con un registro activo.</p>
        <button onClick={() => setErrorState('none')} className="text-[#004762] hover:underline text-sm">Intentar con otro número</button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Verificación de Línea</h2>
        <p className="text-gray-500">Ingresa tu número Cool Mobile para comenzar.</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Número de Celular</label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
              type="tel" maxLength={10} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004762] outline-none transition-all text-lg tracking-widest"
              placeholder="55 1234 5678" value={phone}
              onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setPhone(val); }}
            />
          </div>
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={phone.length !== 10 || isLoading} icon={isLoading ? Activity : ChevronRight}>
          {isLoading ? 'Verificando...' : 'Validar Número'}
        </Button>
      </form>
    </div>
  );
};

// 2. Formulario de Datos
const DataForm = ({ onComplete, initialData, validatedPhone }: any) => {
  const [formData, setFormData] = useState({ 
    ...initialData, 
    phone: validatedPhone,
    documentType: initialData.documentType || 'INE',
    documentNumber: initialData.documentNumber || '' 
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = "El nombre es requerido";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email inválido";
    
    if (formData.documentType === 'INE') {
        if (!formData.documentNumber || formData.documentNumber.length < 10) newErrors.documentNumber = "CURP inválida (mínimo 10 caracteres)";
    } else {
        if (!formData.documentNumber || formData.documentNumber.length < 5) newErrors.documentNumber = "Número de pasaporte inválido";
    }

    if (!termsAccepted) newErrors.terms = "Debes aceptar los Términos y Condiciones";
    if (!privacyAccepted) newErrors.privacy = "Debes aceptar el Aviso de Privacidad";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onComplete(formData);
    }
  };

  const handleDownload = (type: string) => alert(`Descargando PDF de ${type}...`);

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
        <p className="text-gray-500">Selecciona tu documento y completa el registro.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg mb-4">
            <button
                type="button"
                onClick={() => setFormData({...formData, documentType: 'INE', documentNumber: ''})}
                className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all ${
                    formData.documentType === 'INE' 
                    ? 'bg-white text-[#004762] shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <CreditCard size={18} className="mr-2" />
                INE / IFE
            </button>
            <button
                type="button"
                onClick={() => setFormData({...formData, documentType: 'PASSPORT', documentNumber: ''})}
                className={`flex items-center justify-center py-2.5 text-sm font-medium rounded-md transition-all ${
                    formData.documentType === 'PASSPORT' 
                    ? 'bg-white text-[#004762] shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Globe size={18} className="mr-2" />
                Pasaporte
            </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.documentType === 'INE' ? 'CURP' : 'Número de Pasaporte'}
          </label>
          <input 
            type="text" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004762] outline-none transition-all uppercase"
            placeholder={formData.documentType === 'INE' ? 'ABCD123456...' : 'G12345678'}
            value={formData.documentNumber}
            onChange={e => setFormData({...formData, documentNumber: e.target.value.toUpperCase()})}
          />
          {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input 
            type="text" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004762] outline-none transition-all"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
          <input 
            type="email" 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#004762] outline-none transition-all"
            placeholder="juan@ejemplo.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-100">
            <div className="flex items-start">
                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 text-[#004762] rounded" />
                <div className="ml-3 text-sm w-full">
                    <label htmlFor="terms" className="font-medium text-gray-700">Acepto los Términos y Condiciones</label>
                    <button type="button" onClick={() => handleDownload('Términos')} className="text-[#004762] hover:text-[#003242] text-xs flex items-center mt-1"><FileText size={12} className="mr-1" /> Descargar PDF</button>
                    {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                </div>
            </div>
            <div className="flex items-start">
                <input id="privacy" type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="mt-1 w-4 h-4 text-[#004762] rounded" />
                <div className="ml-3 text-sm w-full">
                    <label htmlFor="privacy" className="font-medium text-gray-700">Acepto el Aviso de Privacidad</label>
                    <button type="button" onClick={() => handleDownload('Privacidad')} className="text-[#004762] hover:text-[#003242] text-xs flex items-center mt-1"><FileText size={12} className="mr-1" /> Descargar PDF</button>
                    {errors.privacy && <p className="text-red-500 text-xs mt-1">{errors.privacy}</p>}
                </div>
            </div>
        </div>

        <div className="pt-4">
          <Button type="submit" variant="primary" className="w-full" icon={ChevronRight}>Continuar</Button>
        </div>
      </form>
    </div>
  );
};

// 3. Componente de Cámara (Ahora soporta cambio de cámara)
const CameraCapture = ({ onCapture, label, instruction, overlayType = 'rect', facingMode = 'user' }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

  // Efecto para iniciar la cámara correcta según el prop o el cambio manual
  useEffect(() => {
    setCurrentFacingMode(facingMode);
  }, [facingMode]);

  const startCamera = async (mode: string) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      // Configuración crítica para móviles: pedir exactamente 'environment' o 'user'
      const constraints = {
        video: { 
          facingMode: { exact: mode }, // Intentar forzar el modo exacto
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      };

      // Fallback: si 'exact' falla (ej. en desktop), usar el modo simple
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
      }

      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudo acceder a la cámara. Verifica los permisos o intenta cambiar de cámara.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Iniciar cámara al montar o cambiar de modo
  useEffect(() => { 
    startCamera(currentFacingMode); 
    return () => stopCamera(); 
  }, [currentFacingMode]);

  useEffect(() => {
    if (!capturedImage && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [capturedImage, stream]);

  const toggleCamera = () => {
    setCurrentFacingMode((prev: string) => prev === 'user' ? 'environment' : 'user');
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Si es cámara frontal (user), invertir horizontalmente para que sea como un espejo
        // Si es cámara trasera (environment), NO invertir para que el texto se lea bien
        if (currentFacingMode === 'user') {
            context.translate(canvasRef.current.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    if (!stream) startCamera(currentFacingMode);
  };

  const confirm = () => {
    if (capturedImage) {
      stopCamera();
      onCapture(capturedImage);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-sm text-gray-500 mb-4">{instruction}</p>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center mb-4"><AlertCircle className="mr-2" /> {error}</div>
      ) : (
        <div className="relative w-full max-w-md aspect-[3/4] sm:aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-6 group">
          {!capturedImage ? (
            <>
              {/* Solo aplicamos efecto espejo (CSS) si es modo 'user' */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${currentFacingMode === 'user' ? 'transform scale-x-[-1]' : ''}`} 
              />
              
              {/* Botón flotante para cambiar cámara manualmente si el usuario lo necesita */}
              <button 
                onClick={toggleCamera}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-30"
                title="Cambiar cámara"
              >
                <SwitchCamera size={20} />
              </button>

              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50 z-10"></div>
              {overlayType === 'rect' && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-[85%] h-[60%] border-2 border-white/80 rounded-lg shadow-[0_0_0_999px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#004762] -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#004762] -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#004762] -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#004762] -mb-1 -mr-1"></div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <img src={capturedImage} alt="Captura" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="flex gap-4 w-full max-w-md justify-center">
        {!capturedImage ? (
          <Button onClick={capture} icon={Camera} variant="primary" className="flex-1">Capturar</Button>
        ) : (
          <>
            <Button onClick={retake} icon={RefreshCcw} variant="secondary" className="flex-1">Repetir</Button>
            <Button onClick={confirm} icon={CheckCircle} variant="success" className="flex-1">Confirmar</Button>
          </>
        )}
      </div>
    </div>
  );
};

// 4. Prueba de Vida (Mantiene cámara 'user')
const LivenessTest = ({ onComplete }: any) => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState("Centra tu rostro");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const challenges = [
    { id: 'center', text: 'Mira al frente', icon: Smile },
    { id: 'left', text: 'Gira a la Izquierda', icon: ArrowLeft },
    { id: 'right', text: 'Gira a la Derecha', icon: ArrowRight },
    { id: 'up', text: 'Mira hacia Arriba', icon: ArrowUp },
  ];

  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        runSimulation();
      } catch (e) { setFeedback("Error de cámara"); }
    };
    startCam();
    return () => { if (videoRef.current && videoRef.current.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); };
  }, []);

  const runSimulation = () => {
    let step = 0;
    const nextStep = () => {
      if (step >= challenges.length) {
        setIsDetecting(false);
        setFeedback("¡Verificación Exitosa!");
        setTimeout(() => onComplete(true), 1000);
        return;
      }
      setCurrentChallenge(step);
      setIsDetecting(true);
      setTimeout(() => {
        setIsDetecting(false);
        setTimeout(() => { step++; nextStep(); }, 800); 
      }, 2500); 
    };
    setTimeout(nextStep, 1000);
  };

  const current = challenges[currentChallenge] || challenges[0];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center animate-fade-in-up">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Prueba de Vida</h3>
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-4 border-gray-200 shadow-2xl mb-6 bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
        <div className={`absolute inset-0 border-4 rounded-full transition-colors duration-300 ${isDetecting ? 'border-[#004762]' : 'border-green-500'}`}></div>
        {!isDetecting && currentChallenge < challenges.length && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"><CheckCircle className="text-green-500 w-16 h-16 animate-bounce" /></div>
        )}
      </div>
      <div className="text-center h-24">
        <div className="flex items-center justify-center space-x-2 text-2xl font-semibold text-gray-700 mb-2">
            <Icon className={`w-8 h-8 ${isDetecting ? 'animate-pulse text-[#004762]' : 'text-gray-400'}`} />
            <span>{current.text}</span>
        </div>
        <p className="text-sm text-gray-500">{isDetecting ? "Detectando..." : feedback}</p>
      </div>
      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-4">
        <div className="bg-[#004762] h-2 rounded-full transition-all duration-500" style={{ width: `${((currentChallenge) / challenges.length) * 100}%` }}></div>
      </div>
    </div>
  );
};

// 5. Pantalla Final
const ResultScreen = ({ status, onRestart }: any) => {
  const isSuccess = status === 'success';
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in-up">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isSuccess ? <ShieldCheck size={48} /> : <AlertCircle size={48} />}
      </div>
      <h2 className="text-3xl font-bold mb-2 text-gray-800">{isSuccess ? 'Verificación Completada' : 'Error en Verificación'}</h2>
      <p className="text-gray-600 max-w-md mb-8">{isSuccess ? 'Tus datos biométricos y documentos han sido enviados correctamente.' : 'Hubo un problema al procesar tus datos.'}</p>
      <Button onClick={onRestart} variant={isSuccess ? 'primary' : 'secondary'}>{isSuccess ? 'Finalizar' : 'Intentar de Nuevo'}</Button>
    </div>
  );
};

// --- APP PRINCIPAL ---

export default function App() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(null);

  const [appData, setAppData] = useState({
    phone: '',
    personalData: { 
        name: '', 
        email: '', 
        documentType: 'INE' as 'INE' | 'PASSPORT',
        documentNumber: '' 
    },
    docImage1: null as string | null, 
    docImage2: null as string | null,
    livenessPassed: false
  });

  const TOTAL_STEPS = appData.personalData.documentType === 'PASSPORT' ? 4 : 5;

  const submitToBackend = async (finalData: any) => {
    setIsLoading(true);
    console.log("Payload para Backend:", finalData);
    return new Promise((resolve) => setTimeout(() => { setIsLoading(false); resolve('ok'); }, 3000));
  };

  useEffect(() => {
    console.log("Sistema iniciado. Configuración de Endpoints:", API_ENDPOINTS);
  }, []);

  const handlePhoneSuccess = (phone: string) => {
    setAppData(prev => ({ ...prev, phone: phone }));
    setStep(2);
  };

  const handleDataSubmit = (data: any) => {
    setAppData(prev => ({ ...prev, personalData: data }));
    setStep(3);
  };

  const handleDocCapture1 = (img: string) => {
    setAppData(prev => ({ ...prev, docImage1: img }));
    if (appData.personalData.documentType === 'PASSPORT') {
        setStep(4); 
    } else {
        setStep(4);
    }
  };

  const handleDocCapture2 = (img: string) => {
    setAppData(prev => ({ ...prev, docImage2: img }));
    setStep(5);
  };

  const handleLivenessComplete = async (success: boolean) => {
    const updatedData = { ...appData, livenessPassed: success };
    setAppData(updatedData);
    if (success) {
      await submitToBackend(updatedData);
      setResultStatus('success');
      setStep(TOTAL_STEPS + 1);
    } else {
      setResultStatus('error');
      setStep(TOTAL_STEPS + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        
        <div className="bg-gradient-to-r from-[#011e29] via-[#004762] to-[#003242] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-white/70" /> Vincula tú linea</h1>
            <p className="text-white/50 text-xs mt-1">Validación de Identidad Digital</p>
          </div>
          <div className="text-right text-sm text-white/70">
            {step <= TOTAL_STEPS ? `Paso ${step} de ${TOTAL_STEPS}` : 'Finalizado'}
          </div>
        </div>

        <div className="flex-1 p-6 md:p-10 flex flex-col">
          {step <= TOTAL_STEPS && <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />}

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#004762] rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700">Procesando información...</h3>
            </div>
          ) : (
            <>
              {step === 1 && <PhoneValidationStep onComplete={handlePhoneSuccess} />}

              {step === 2 && (
                <DataForm 
                  validatedPhone={appData.phone}
                  initialData={appData.personalData} 
                  onComplete={handleDataSubmit} 
                />
              )}

              {/* Paso 3: Captura de Documento Frente (Usa cámara trasera 'environment') */}
              {step === 3 && (
                <CameraCapture 
                  label={appData.personalData.documentType === 'INE' ? "INE / IFE - Frente" : "Pasaporte - Página de Datos"} 
                  instruction={appData.personalData.documentType === 'INE' ? "Coloca el frente de tu INE dentro del recuadro." : "Coloca la página de datos de tu pasaporte."}
                  overlayType="rect"
                  facingMode="environment" // <--- FORZAMOS CÁMARA TRASERA
                  onCapture={handleDocCapture1}
                />
              )}

              {/* Paso 4: Captura de Documento Reverso o Liveness */}
              {step === 4 && (
                appData.personalData.documentType === 'INE' ? (
                    <CameraCapture 
                      label="INE / IFE - Reverso" 
                      instruction="Ahora captura el reverso de tu identificación."
                      overlayType="rect"
                      facingMode="environment" // <--- FORZAMOS CÁMARA TRASERA
                      onCapture={handleDocCapture2}
                    />
                ) : (
                    <LivenessTest onComplete={handleLivenessComplete} />
                )
              )}

              {step === 5 && appData.personalData.documentType === 'INE' && (
                <LivenessTest onComplete={handleLivenessComplete} />
              )}

              {step > TOTAL_STEPS && (
                <ResultScreen status={resultStatus} onRestart={() => window.location.reload()} />
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1"><Activity size={12} /> Powered by AWAN TECHNOLGY SERVICES Security</p>
        </div>
      </div>
    </div>
  );
}