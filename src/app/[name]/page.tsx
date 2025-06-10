'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function StudyPage() {
  const params = useParams();
  const name = params.name;
  const [isStudying, setIsStudying] = useState(false);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">{name} Study Tracker</h1>
      <button
        onClick={() => setIsStudying(!isStudying)}
        className={`px-6 py-3 rounded-lg transition-colors ${
          isStudying 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {isStudying ? 'Stop Studying' : 'Start Studying'}
      </button>
      <p className="mt-4 text-gray-600">
        Status: {isStudying ? 'Currently studying' : 'Not studying'}
      </p>
    </div>
  );
}
