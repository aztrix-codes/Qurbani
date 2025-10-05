'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import './style.css';

export default function GuidelinesPage() {
  const router = useRouter();



  return (
    <div className="fixed-color-theme flex flex-col p-4 max-w-full min-h-screen">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Guidelines</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Do's Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h2 className="text-xl font-semibold text-green-800 flex items-center">
              <CheckCircle2 className="mr-2 text-green-600" size={20} />
              Do&apos;s
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Verify receipt numbers before submission</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Double-check names for accurate spelling</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Select the correct Hissa type (Qurbani/Aqeeqah)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Ensure mobile numbers are correct if provided</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Review all entries before final submission</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Use the edit feature to correct mistakes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="mt-1 mr-3 text-green-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Try refreshing the page if the interface not loading properly</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Don'ts Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <h2 className="text-xl font-semibold text-red-800 flex items-center">
              <XCircle className="mr-2 text-red-600" size={20} />
              Don&apos;ts
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <XCircle className="mt-1 mr-3 text-red-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Don&apos;t exceed the 7 Hissa limit per receipt</span>
              </li>
              <li className="flex items-start">
                <XCircle className="mt-1 mr-3 text-red-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Don&apos;t use abbreviations for names</span>
              </li>
              <li className="flex items-start">
                <XCircle className="mt-1 mr-3 text-red-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Don&apos;t leave required fields blank</span>
              </li>
              <li className="flex items-start">
                <XCircle className="mt-1 mr-3 text-red-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Don&apos;t share your login credentials</span>
              </li>
              <li className="flex items-start">
                <XCircle className="mt-1 mr-3 text-red-500 flex-shrink-0" size={18} />
                <span className="text-gray-700">Don&apos;t use the system on public computers without logging out</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Guidelines Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800">General Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <CheckCircle2 className="mr-2 text-blue-500" size={18} />
                Data Entry
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-6">• Always verify receipt numbers with physical copies</li>
                <li className="pl-6">• Use full names as they appear on official documents</li>
                <li className="pl-6">• Double-check mobile numbers before saving</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <XCircle className="mr-2 text-blue-500" size={18} />
                Common Mistakes
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-6">• Mixing up Qurbani and Aqeeqah entries</li>
                <li className="pl-6">• Entering incorrect receipt numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}