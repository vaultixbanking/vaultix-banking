import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Eye, EyeOff, 
  Upload, AlertCircle, ChevronLeft, ChevronRight,
  Lock, Mail, Phone, User, Calendar, MapPin, Globe,
  Briefcase, DollarSign, CreditCard, Shield
} from 'lucide-react';

interface FormData {
  // Step 1: Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  residentialAddress: string;
  email: string;
  phone: string;
  alternatePhone: string;
  
  // Step 2: Employment & Financial
  employmentStatus: string;
  occupation: string;
  incomeRange: string;
  sourceOfFunds: string;
  
  // Step 3: Security & Verification
  username: string;
  password: string;
  confirmPassword: string;
  pin: string;
  accountType: string;
  currencyType: string;
  idType: string;
  idNumber: string;
  idExpiryDate: string;
  photoID: File | null;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    // Step 1
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    country: '',
    city: '',
    state: '',
    zipCode: '',
    residentialAddress: '',
    email: '',
    phone: '',
    alternatePhone: '',
    
    // Step 2
    employmentStatus: '',
    occupation: '',
    incomeRange: '',
    sourceOfFunds: '',
    
    // Step 3
    username: '',
    password: '',
    confirmPassword: '',
    pin: '',
    accountType: '',
    currencyType: '',
    idType: '',
    idNumber: '',
    idExpiryDate: '',
    photoID: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<{ accountNumber: string; username: string; fullName: string } | null>(null);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photoID: 'File size must be less than 5MB' }));
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, photoID: 'Please upload JPG, PNG, or PDF file' }));
        return;
      }
      setFormData(prev => ({ ...prev, photoID: file }));
      setFileName(file.name);
      setErrors(prev => ({ ...prev, photoID: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State/Province is required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP/Postal code is required';
    if (!formData.residentialAddress) newErrors.residentialAddress = 'Address is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (!formData.incomeRange) newErrors.incomeRange = 'Income range is required';
    if (!formData.sourceOfFunds) newErrors.sourceOfFunds = 'Source of funds is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    }
    if (!formData.accountType) newErrors.accountType = 'Account type is required';
    if (!formData.currencyType) newErrors.currencyType = 'Currency type is required';
    if (!formData.idType) newErrors.idType = 'ID type is required';
    if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
    if (!formData.idExpiryDate) newErrors.idExpiryDate = 'ID expiry date is required';
    if (!formData.photoID) newErrors.photoID = 'Photo ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch(currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      if (!agreeTerms) {
        setErrors({ terms: 'You must agree to the terms and conditions' });
        return;
      }

      setIsSubmitting(true);
      setSubmitError('');

      try {
        const payload = new FormData();
        // Step 1 — Personal
        payload.append('fullName', formData.fullName);
        payload.append('email', formData.email);
        if (formData.dateOfBirth) payload.append('dateOfBirth', formData.dateOfBirth);
        if (formData.gender) payload.append('gender', formData.gender);
        if (formData.nationality) payload.append('nationality', formData.nationality);
        if (formData.country) payload.append('country', formData.country);
        if (formData.city) payload.append('city', formData.city);
        if (formData.state) payload.append('state', formData.state);
        if (formData.zipCode) payload.append('zipCode', formData.zipCode);
        if (formData.residentialAddress) payload.append('residentialAddress', formData.residentialAddress);
        payload.append('phone', formData.phone);
        if (formData.alternatePhone) payload.append('alternatePhone', formData.alternatePhone);

        // Step 2 — Employment
        if (formData.employmentStatus) payload.append('employmentStatus', formData.employmentStatus);
        if (formData.occupation) payload.append('occupation', formData.occupation);
        if (formData.incomeRange) payload.append('incomeRange', formData.incomeRange);
        if (formData.sourceOfFunds) payload.append('sourceOfFunds', formData.sourceOfFunds);

        // Step 3 — Security
        payload.append('username', formData.username);
        payload.append('password', formData.password);
        payload.append('pin', formData.pin);
        if (formData.accountType) payload.append('accountType', formData.accountType);
        if (formData.currencyType) payload.append('currencyType', formData.currencyType);
        if (formData.idType) payload.append('idType', formData.idType);
        if (formData.idNumber) payload.append('idNumber', formData.idNumber);
        if (formData.idExpiryDate) payload.append('idExpiryDate', formData.idExpiryDate);

        // File upload
        if (formData.photoID) {
          payload.append('photoID', formData.photoID);
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/auth/signup`, {
          method: 'POST',
          body: payload, // FormData — browser sets multipart/form-data automatically
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Signup failed. Please try again.');
        }

        setSubmitSuccess(true);
        setCreatedAccount(data.data);

        // Redirect to login after 5 seconds (user needs to verify email first)
        setTimeout(() => {
          navigate('/login', { state: { signupSuccess: true, accountNumber: data.data.accountNumber, needsVerification: true } });
        }, 5000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Open Your Vaultix Account
          </h1>
          <p className="text-secondary-600">
            Join thousands of satisfied customers enjoying modern banking
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-t-2xl p-6 shadow-sm border-b border-secondary-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep > step 
                    ? 'bg-primary-600 text-white' 
                    : currentStep === step 
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100' 
                      : 'bg-secondary-200 text-secondary-600'}
                `}>
                  {currentStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
                <span className={`
                  text-xs mt-2 font-medium
                  ${currentStep >= step ? 'text-primary-600' : 'text-secondary-400'}
                `}>
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Employment'}
                  {step === 3 && 'Security'}
                  {step === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl p-6 md:p-8 shadow-lg">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Personal Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.fullName ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Date of Birth <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.dateOfBirth ? 'border-red-500' : 'border-secondary-200'
                      }`}
                    />
                  </div>
                  {formData.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> You must be at least 18 years old
                    </p>
                  )}
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Gender <span className="text-primary-600">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.gender ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Nationality <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.nationality ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="e.g., American"
                    />
                  </div>
                  {errors.nationality && (
                    <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Country <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.country ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="United States"
                    />
                  </div>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    City <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.city ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    State/Province <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.state ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    ZIP/Postal Code <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.zipCode ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Residential Address <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="residentialAddress"
                    value={formData.residentialAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.residentialAddress ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="123 Main St, Apt 4B"
                  />
                  {errors.residentialAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.residentialAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.phone ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Alternate Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment & Financial Info */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Employment & Financial Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Employment Status <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.employmentStatus ? 'border-red-500' : 'border-secondary-200'
                      }`}
                    >
                      <option value="">Select Status</option>
                      <option value="Employed">Employed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  {errors.employmentStatus && (
                    <p className="mt-1 text-sm text-red-600">{errors.employmentStatus}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Occupation <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.occupation ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="Software Engineer"
                  />
                  {errors.occupation && (
                    <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Income Range <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <select
                      name="incomeRange"
                      value={formData.incomeRange}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.incomeRange ? 'border-red-500' : 'border-secondary-200'
                      }`}
                    >
                      <option value="">Select Income Range</option>
                      <option value="Below $20,000">Below $20,000</option>
                      <option value="$20,000 - $50,000">$20,000 - $50,000</option>
                      <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                      <option value="Above $100,000">Above $100,000</option>
                    </select>
                  </div>
                  {errors.incomeRange && (
                    <p className="mt-1 text-sm text-red-600">{errors.incomeRange}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Source of Funds <span className="text-primary-600">*</span>
                  </label>
                  <select
                    name="sourceOfFunds"
                    value={formData.sourceOfFunds}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.sourceOfFunds ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  >
                    <option value="">Select Source</option>
                    <option value="Employment">Employment</option>
                    <option value="Business">Business</option>
                    <option value="Investments">Investments</option>
                    <option value="Savings">Savings</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.sourceOfFunds && (
                    <p className="mt-1 text-sm text-red-600">{errors.sourceOfFunds}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account Security & Verification */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Account Security & Verification
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Username <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.username ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="johndoe123"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Password <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-secondary-300'}`} />
                        <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-secondary-500'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-secondary-300'}`} />
                        <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-secondary-500'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-secondary-300'}`} />
                        <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-secondary-500'}>
                          One number
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirm Password <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.confirmPassword ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    4-Digit PIN <span className="text-primary-600">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type={showPin ? "text" : "password"}
                      name="pin"
                      value={formData.pin}
                      onChange={handleInputChange}
                      maxLength={4}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                        errors.pin ? 'border-red-500' : 'border-secondary-200'
                      }`}
                      placeholder="••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-secondary-500">Enter exactly 4 digits</p>
                  {errors.pin && (
                    <p className="mt-1 text-sm text-red-600">{errors.pin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Type <span className="text-primary-600">*</span>
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.accountType ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  >
                    <option value="">Select Account Type</option>
                    <option value="Checking">Checking Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Business">Business Account</option>
                    <option value="Premium">Premium Account</option>
                  </select>
                  {errors.accountType && (
                    <p className="mt-1 text-sm text-red-600">{errors.accountType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Currency Type <span className="text-primary-600">*</span>
                  </label>
                  <select
                    name="currencyType"
                    value={formData.currencyType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.currencyType ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                  {errors.currencyType && (
                    <p className="mt-1 text-sm text-red-600">{errors.currencyType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    ID Type <span className="text-primary-600">*</span>
                  </label>
                  <select
                    name="idType"
                    value={formData.idType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.idType ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  >
                    <option value="">Select ID Type</option>
                    <option value="Passport">Passport</option>
                    <option value="DriversLicense">Driver's License</option>
                    <option value="NationalID">National ID Card</option>
                    <option value="StateID">State ID</option>
                  </select>
                  {errors.idType && (
                    <p className="mt-1 text-sm text-red-600">{errors.idType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    ID Number <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.idNumber ? 'border-red-500' : 'border-secondary-200'
                    }`}
                    placeholder="Enter ID number"
                  />
                  {errors.idNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    ID Expiry Date <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="idExpiryDate"
                    value={formData.idExpiryDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.idExpiryDate ? 'border-red-500' : 'border-secondary-200'
                    }`}
                  />
                  {errors.idExpiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.idExpiryDate}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Upload Photo ID <span className="text-primary-600">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    errors.photoID ? 'border-red-300 bg-red-50' : 'border-secondary-200 hover:border-primary-400'
                  }`}>
                    <input
                      type="file"
                      id="photoID"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="photoID" className="cursor-pointer">
                      <Upload className="w-10 h-10 text-secondary-400 mx-auto mb-3" />
                      <p className="text-sm text-secondary-600 mb-1">
                        {fileName || 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-secondary-400">
                        JPG, PNG, or PDF (max 5MB)
                      </p>
                    </label>
                  </div>
                  {fileName && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> {fileName} uploaded
                    </p>
                  )}
                  {errors.photoID && (
                    <p className="mt-1 text-sm text-red-600">{errors.photoID}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                Review Your Information
              </h2>
              
              <div className="bg-secondary-50 rounded-xl p-6 space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-600" />
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">Full Name</p>
                      <p className="font-medium text-secondary-900">{formData.fullName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Date of Birth</p>
                      <p className="font-medium text-secondary-900">{formData.dateOfBirth || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Gender</p>
                      <p className="font-medium text-secondary-900">{formData.gender || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Nationality</p>
                      <p className="font-medium text-secondary-900">{formData.nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Country</p>
                      <p className="font-medium text-secondary-900">{formData.country || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">City</p>
                      <p className="font-medium text-secondary-900">{formData.city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">State/Province</p>
                      <p className="font-medium text-secondary-900">{formData.state || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">ZIP/Postal Code</p>
                      <p className="font-medium text-secondary-900">{formData.zipCode || '—'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-secondary-500">Residential Address</p>
                      <p className="font-medium text-secondary-900">{formData.residentialAddress || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Email</p>
                      <p className="font-medium text-secondary-900">{formData.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Phone</p>
                      <p className="font-medium text-secondary-900">{formData.phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Employment Section */}
                <div className="border-t border-secondary-200 pt-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary-600" />
                    Employment & Financial
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">Employment Status</p>
                      <p className="font-medium text-secondary-900">{formData.employmentStatus || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Occupation</p>
                      <p className="font-medium text-secondary-900">{formData.occupation || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Income Range</p>
                      <p className="font-medium text-secondary-900">{formData.incomeRange || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Source of Funds</p>
                      <p className="font-medium text-secondary-900">{formData.sourceOfFunds || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Account & Verification Section */}
                <div className="border-t border-secondary-200 pt-4">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-600" />
                    Account & Verification
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary-500">Username</p>
                      <p className="font-medium text-secondary-900">{formData.username || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Account Type</p>
                      <p className="font-medium text-secondary-900">{formData.accountType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Currency</p>
                      <p className="font-medium text-secondary-900">{formData.currencyType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">ID Type</p>
                      <p className="font-medium text-secondary-900">{formData.idType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">ID Number</p>
                      <p className="font-medium text-secondary-900">{formData.idNumber || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">ID Expiry</p>
                      <p className="font-medium text-secondary-900">{formData.idExpiryDate || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="border-t border-secondary-200 pt-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="terms" className="text-sm text-secondary-700">
                      I confirm that all information provided is accurate and complete. I have read and agree to the{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                        Terms & Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.terms}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-secondary-100">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'text-secondary-400 cursor-not-allowed'
                  : 'text-secondary-700 hover:bg-secondary-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>

          {/* API Error */}
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Signup failed</p>
                <p className="text-sm text-red-600 mt-1">{submitError}</p>
              </div>
            </div>
          )}
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-secondary-600">
            Already have an account?{' '}
            <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {/* Success Overlay */}
      {submitSuccess && createdAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center animate-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Account Created!</h2>
            <p className="text-secondary-600 mb-4">
              Welcome, <span className="font-semibold">{createdAccount.fullName}</span>
            </p>
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-secondary-500 mb-1">Your Account Number</p>
              <p className="text-xl font-bold text-primary-700 tracking-wider">{createdAccount.accountNumber}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">Check Your Email</p>
              </div>
              <p className="text-sm text-blue-700">
                We've sent a verification link to your email address. Please verify your email to activate your account.
              </p>
            </div>
            <p className="text-sm text-secondary-500 mb-4">
              Please save your account number. You&apos;ll be redirected to login shortly.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-secondary-400">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirecting to login...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;