import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GenderDiscovery from './pages/GenderDiscovery';
import TextSynthesis from './pages/TextSynthesis';
import NeuralTranslate from './pages/NeuralTranslate';
import EmpathyEngine from './pages/EmpathyEngine';
import CognitiveQA from './pages/CognitiveQA';
import ZeroShotLab from './pages/ZeroShotLab';
import DataClusters from './pages/DataClusters';
import DbscanLab from './pages/DbscanLab';
import AssociationRules from './pages/AssociationRules';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gender" element={<GenderDiscovery />} />
          <Route path="/textgen" element={<TextSynthesis />} />
          <Route path="/translate" element={<NeuralTranslate />} />
          <Route path="/sentiment" element={<EmpathyEngine />} />
          <Route path="/qa" element={<CognitiveQA />} />
          <Route path="/zsl" element={<ZeroShotLab />} />
          <Route path="/clustering" element={<DataClusters />} />
          <Route path="/dbscan" element={<DbscanLab />} />
          <Route path="/apriori" element={<AssociationRules />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
