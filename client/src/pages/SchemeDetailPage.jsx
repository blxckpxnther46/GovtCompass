import React from 'react';
import { useParams } from 'react-router-dom';

export default function SchemeDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800">Scheme Detail: {id}</h1>
    </div>
  );
}
