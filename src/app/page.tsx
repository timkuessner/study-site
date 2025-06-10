import { ReactElement } from 'react';

export default function Home(): ReactElement {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
      </main>
    </div>
  );
}
