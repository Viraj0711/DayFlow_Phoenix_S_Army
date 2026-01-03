import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  DollarSign, 
  BarChart3, 
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'benefits', 'about'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            return;
          }
        }
      }
      
      if (window.scrollY < 100) {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Centralized employee database with comprehensive profiles, documents, and quick access to all information.'
    },
    {
      icon: ClipboardCheck,
      title: 'Leave Management',
      description: 'Streamlined leave request and approval workflow with real-time status tracking and notifications.'
    },
    {
      icon: Calendar,
      title: 'Attendance Tracking',
      description: 'Monitor daily attendance, work hours, and generate detailed attendance reports effortlessly.'
    },
    {
      icon: DollarSign,
      title: 'Payroll Management',
      description: 'Complete payroll processing with salary structures, deductions, and automated calculations.'
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Powerful insights with visual charts, customizable reports, and data export capabilities.'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control ensuring employees and admins see only what they need to see.'
    }
  ];

  const benefits = [
    'Save 10+ hours per week on HR administrative tasks',
    'Reduce payroll errors by 95% with automated calculations',
    'Improve employee satisfaction with self-service portal',
    'Get real-time insights into workforce analytics',
    'Ensure compliance with automated leave tracking',
    'Scale effortlessly as your organization grows'
  ];

  const stats = [
    { value: '500+', label: 'Organizations' },
    { value: '50k+', label: 'Employees' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Dayflow</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                className={`relative transition-all duration-300 ${
                  activeSection === 'features' 
                    ? 'text-primary-600 font-semibold nav-link-active' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Features
              </a>
              <a 
                href="#benefits" 
                className={`relative transition-all duration-300 ${
                  activeSection === 'benefits' 
                    ? 'text-primary-600 font-semibold nav-link-active' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Benefits
              </a>
              <a 
                href="#about" 
                className={`relative transition-all duration-300 ${
                  activeSection === 'about' 
                    ? 'text-primary-600 font-semibold nav-link-active' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                About
              </a>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Login
              </button>
            </nav>
            <button 
              onClick={() => navigate('/login')}
              className="md:hidden px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-primary-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 border-4 border-primary-200 rounded-lg rotate-12 opacity-50"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-primary-100 rounded-full opacity-40"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border-4 border-purple-200 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 right-10 w-24 h-24 border-4 border-pink-200 rotate-45 opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Every workday,{' '}
              <span className="text-primary-600">perfectly aligned.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your HR operations with Dayflow's comprehensive HRMS platform. 
              Manage employees, track attendance, process payroll, and gain insights — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-0 w-72 h-72 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-10 left-0 w-72 h-72 bg-gradient-to-br from-pink-100 to-primary-100 rounded-full filter blur-3xl opacity-20"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your workforce
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to simplify HR operations and empower your team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
          
          {/* Dots Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <div className="grid grid-cols-8 gap-4">
              {[...Array(64)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-primary-600 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transform your HR operations
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Dayflow helps organizations of all sizes streamline their human resource management, 
                reduce administrative overhead, and focus on what matters most — their people.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
                <TrendingUp className="w-12 h-12 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
                <p className="mb-6 text-primary-100">
                  Join hundreds of organizations already using Dayflow to manage their workforce efficiently.
                </p>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-primary-100 to-transparent rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-gradient-to-l from-purple-100 to-transparent rounded-full filter blur-3xl opacity-30"></div>
          
          {/* Geometric Decorations */}
          <div className="absolute top-10 right-1/4 w-16 h-16 border-2 border-primary-200 rotate-45 opacity-30"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 border-2 border-purple-200 rounded-full opacity-30"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Built for modern organizations
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Dayflow is a comprehensive Human Resource Management System designed to digitize and 
            streamline essential HR operations. From employee onboarding to payroll processing, 
            we provide the tools you need to manage your workforce with confidence.
          </p>
          <p className="text-lg text-gray-600">
            Our platform combines powerful features with an intuitive interface, ensuring that 
            both HR administrators and employees have a seamless experience. With role-based 
            access control, real-time analytics, and automated workflows, Dayflow helps you 
            make better decisions faster.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white rotate-45 animate-spin-slow"></div>
            <div className="absolute bottom-10 left-1/4 w-20 h-20 border-4 border-white rounded-full animate-bounce-slow"></div>
            <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-white rotate-12 animate-pulse"></div>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to streamline your HR operations?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Get started with Dayflow today and experience the difference.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold inline-flex items-center"
          >
            Login to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Dayflow</span>
              </div>
              <p className="text-sm">
                Every workday, perfectly aligned.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Benefits</a></li>
                <li><a href="#about" className="hover:text-white transition">About</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Dayflow HRMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
