import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import QuestionnairePage from './pages/QuestionnairePage.jsx';
import RecommendationsPage from './pages/RecommendationsPage.jsx';
import SchemeDetailPage from './pages/SchemeDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/questionnaire" element={<QuestionnairePage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/scheme/:id" element={<SchemeDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
