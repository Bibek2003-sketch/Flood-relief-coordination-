import { Activity, Stethoscope, Plus, HeartPulse } from 'lucide-react';

const MedicalDashboard = () => {
  return (
    <div className="flex-grow bg-gray-50 p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <HeartPulse className="text-emergency-500" /> Medical & Triage Dashboard
        </h1>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2">
          <Plus size={16} /> New Medical Camp
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:animate-float-blink transition-all">
          <div className="text-sm font-medium text-gray-500 mb-1">Active Medical Camps</div>
          <div className="text-3xl font-bold text-primary-600">8</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:animate-float-blink transition-all">
          <div className="text-sm font-medium text-gray-500 mb-1">Doctors Deployed</div>
          <div className="text-3xl font-bold text-safe-500">45</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:animate-float-blink transition-all border-l-4 border-l-emergency-500">
          <div className="text-sm font-medium text-gray-500 mb-1">Critical Patient Requests</div>
          <div className="text-3xl font-bold text-emergency-600">12</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Camps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-primary-900 flex items-center gap-2">
              <Stethoscope size={20} /> Active Medical Camps
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((camp) => (
              <div key={camp} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-md text-gray-900">Relief Camp {camp} Medical Tent</h4>
                    <p className="text-sm text-gray-500">Guwahati Sector {camp}</p>
                  </div>
                  <span className="bg-safe-100 text-safe-700 text-xs px-2 py-1 rounded font-bold">Normal</span>
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-600">
                  <div><strong>Doctors:</strong> 4</div>
                  <div><strong>Beds Available:</strong> 12</div>
                  <div><strong>Hours:</strong> 24/7</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Medical Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-emergency-50 px-6 py-4 border-b border-emergency-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-emergency-900 flex items-center gap-2">
              <Activity size={20} /> Emergency Medical Requests
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((req) => (
              <div key={req} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-md text-gray-900">Medical Evacuation Needed</h4>
                    <p className="text-sm text-gray-500 text-emergency-600 font-semibold">Priority: Critical</p>
                  </div>
                  <button className="bg-emergency-600 text-white px-3 py-1 text-sm rounded hover:bg-emergency-700">Dispatch Ambulance</button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Patient requires immediate dialysis support. Cut off by flood waters.</p>
                <div className="mt-2 text-xs text-gray-500">Loc: Beltola | Contact: 9876543210</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDashboard;
