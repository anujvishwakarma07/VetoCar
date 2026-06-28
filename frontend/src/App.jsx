import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './components/DashboardView.jsx';
import ContractAnalyser from './components/ContractAnalyser.jsx';
import VinLookup from './components/VinLookup.jsx';
import NegotiationCoach from './components/NegotiationCoach.jsx';
import Footer from './components/Footer.jsx';
import AuthView from './components/AuthView.jsx';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contractResult, setContractResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Auto-restore session from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.username, id: payload.id });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);
  
  // Lifted Chat memory states (Preserves conversation across tab switching!)
  const [chatMessages, setChatMessages] = useState([
    { 
      role: 'bot', 
      text: 'Hello! I am your AI Car Negotiation Coach.\n\nI can help you review dealer pricing sheets, draft professional emails to salespeople, or advice you on specific terms like acquisition fees, doc fees, and money factors.\n\nIf you have uploaded a contract in the Contract Analyzer tab, I will automatically use its numbers to give you custom negotiation counter-offers!' 
    }
  ]);
  const [chatHistory, setChatHistory] = useState([]);

  if (!isAuthenticated) {
    return (
      <AuthView 
        setIsAuthenticated={setIsAuthenticated} 
        setUser={setUser} 
      />
    );
  }

  return (
    <div className="dashboard-layout">
      <div className="mobile-header">
        <Sparkles size={18} style={{ color: 'var(--primary)' }} />
        <span>CarLease AI</span>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsAuthenticated={setIsAuthenticated} 
        setUser={setUser}
      />

      <div className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView setActiveTab={setActiveTab} />
        )}
        
        {activeTab === 'analyzer' && (
          <ContractAnalyser 
            contractResult={contractResult} 
            setContractResult={setContractResult} 
            setChatMessages={setChatMessages}
          />
        )}
        
        {activeTab === 'vin' && (
          <VinLookup />
        )}
        
        {activeTab === 'coach' && (
          <NegotiationCoach 
            contractResult={contractResult} 
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
