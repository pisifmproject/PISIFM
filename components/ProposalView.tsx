import React from 'react';
import { Server, Shield, Layers, Smartphone, Database, Lock } from 'lucide-react';

const ProposalView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 transition-colors">Technical Proposal</h2>
        <p className="text-gray-500 dark:text-slate-400 mt-2">PEAK: Project Engineering Analysis & Performance Review</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">1. System Architecture</h3>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-gray-900 dark:text-slate-200">Recommendation: Modular Monolith</strong>
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
            For a department-level system, a full Microservices architecture introduces unnecessary complexity (latency, orchestration). A Modular Monolith allows us to keep distinct modules (HR, Projects, Inventory) within a single deployable unit while enforcing strict boundary separation in the code. This ensures easy future extraction into microservices if scaling is needed, without the initial overhead.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Server size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">2. Backend Technology</h3>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-gray-900 dark:text-slate-200">Recommendation: Python / Django Rest Framework (DRF)</strong>
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-slate-400 text-sm space-y-1">
            <li><strong className="text-gray-900 dark:text-slate-200">Speed:</strong> Django's "batteries-included" approach accelerates admin panel and ORM creation.</li>
            <li><strong className="text-gray-900 dark:text-slate-200">Data Handling:</strong> Excellent for the complex calculations required in Module 10/11 (KPIs) and Excel parsing (Mod 7).</li>
            <li><strong className="text-gray-900 dark:text-slate-200">Security:</strong> Built-in protection against SQL injection and XSS.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Smartphone size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">3. Frontend Strategy</h3>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-gray-900 dark:text-slate-200">Recommendation: React (TypeScript) + Tailwind CSS</strong>
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-slate-400 text-sm space-y-1">
            <li><strong className="text-gray-900 dark:text-slate-200">Mobile-First:</strong> Tailwind's utility classes make responsive design native to the workflow.</li>
            <li><strong className="text-gray-900 dark:text-slate-200">Offline Mode:</strong> React's Service Workers (PWA) enable Module 26 (Offline Data Submission) by caching forms and syncing when connectivity returns.</li>
            <li><strong className="text-gray-900 dark:text-slate-200">Component Library:</strong> High reusability for standard forms (Mod 15-18).</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">4. Security & RBAC</h3>
          </div>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-gray-900 dark:text-slate-200">Strategy: JWT + Role Middleware</strong>
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-slate-400 text-sm space-y-1">
            <li><strong className="text-gray-900 dark:text-slate-200">Authentication:</strong> OAuth2/JWT for stateless, secure API sessions.</li>
            <li><strong className="text-gray-900 dark:text-slate-200">RBAC:</strong> Middleware to intercept every request and validate `User.Role` against the requested resource (Mod 1).</li>
            <li><strong className="text-gray-900 dark:text-slate-200">Audit Trail:</strong> Global event listener on the backend (Signals in Django) to log every `POST/PUT/DELETE` action to the Audit Table (Mod 25).</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors">
        <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Integration Highlight: Auto-KPI Calculation</h4>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          The system demonstrates productivity automation by linking Module 4 (Daily Reports) directly to Module 11 (Performance). When a Technician submits a delayed report, the backend automatically decrements their 'Discipline' score in the draft KPI record, eliminating manual HR data entry.
        </p>
      </div>
    </div>
  );
};

export default ProposalView;