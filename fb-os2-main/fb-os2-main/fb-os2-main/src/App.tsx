import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ServiceOrderList } from './components/ServiceOrderList';
import { CompanyInfo } from './components/CompanyInfo';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import type { User } from './lib/supabase';
import { Wrench, ClipboardList, Calculator, Settings, List, Building2, LogOut } from 'lucide-react';
import { ServiceOrderForm } from './components/ServiceOrderForm';
import { MaterialsManagement } from './components/MaterialsManagement';
import { AccountingDashboard } from './components/AccountingDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('orders');

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth onAuthSuccess={() => {}} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-sm hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Wrench className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">Sistema OS</span>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setCurrentTab('orders')}
                  className={`${
                    currentTab === 'orders'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <ClipboardList className="h-5 w-5 mr-1" />
                  Nova OS
                </button>
                <button
                  onClick={() => setCurrentTab('order-list')}
                  className={`${
                    currentTab === 'order-list'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <List className="h-5 w-5 mr-1" />
                  Lista de OS
                </button>
                <button
                  onClick={() => setCurrentTab('materials')}
                  className={`${
                    currentTab === 'materials'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Settings className="h-5 w-5 mr-1" />
                  Materiais
                </button>
                <button
                  onClick={() => setCurrentTab('accounting')}
                  className={`${
                    currentTab === 'accounting'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Calculator className="h-5 w-5 mr-1" />
                  Financeiro
                </button>
                <button
                  onClick={() => setCurrentTab('company')}
                  className={`${
                    currentTab === 'company'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Building2 className="h-5 w-5 mr-1" />
                  Empresa
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sm:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Wrench className="h-6 w-6 text-blue-500" />
            <span className="ml-2 text-lg font-bold text-gray-900">Sistema OS</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-1.5 text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-8 mb-16 sm:mb-8 mt-14 sm:mt-0">
        {currentTab === 'orders' && <ServiceOrderForm />}
        {currentTab === 'order-list' && <ServiceOrderList />}
        {currentTab === 'materials' && <MaterialsManagement />}
        {currentTab === 'accounting' && <AccountingDashboard />}
        {currentTab === 'company' && <CompanyInfo />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-5 h-[4.5rem] px-1">
          <button
            onClick={() => setCurrentTab('orders')}
            className={`flex flex-col items-center justify-center py-1 ${
              currentTab === 'orders' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span className="text-[0.65rem] mt-0.5 leading-tight">Nova OS</span>
          </button>
          <button
            onClick={() => setCurrentTab('order-list')}
            className={`flex flex-col items-center justify-center py-1 ${
              currentTab === 'order-list' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <List className="h-5 w-5" />
            <span className="text-[0.65rem] mt-0.5 leading-tight">Lista OS</span>
          </button>
          <button
            onClick={() => setCurrentTab('materials')}
            className={`flex flex-col items-center justify-center py-1 ${
              currentTab === 'materials' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[0.65rem] mt-0.5 leading-tight">Materiais</span>
          </button>
          <button
            onClick={() => setCurrentTab('accounting')}
            className={`flex flex-col items-center justify-center py-1 ${
              currentTab === 'accounting' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span className="text-[0.65rem] mt-0.5 leading-tight">Financeiro</span>
          </button>
          <button
            onClick={() => setCurrentTab('company')}
            className={`flex flex-col items-center justify-center py-1 ${
              currentTab === 'company' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-[0.65rem] mt-0.5 leading-tight">Empresa</span>
          </button>
        </div>
      </nav>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;