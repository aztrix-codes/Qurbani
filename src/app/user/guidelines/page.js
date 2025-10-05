'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import './style.css';
import { useTheme } from '../../themeContext'; // Import useTheme

export default function GuidelinesPage() {
  const router = useRouter();
  const { activeTheme } = useTheme(); // Use the theme context

  // Define styles based on the active theme for a cleaner look
  const themeStyles = {
    container: {
      backgroundColor: activeTheme.bgPrimary,
      color: activeTheme.textPrimary,
    },
    title: {
      color: activeTheme.textPrimary,
    },
    card: {
      backgroundColor: activeTheme.bgPrimary, // Use the lightest background color
      borderColor: activeTheme.border,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // A softer shadow
    },
    dosHeader: {
      backgroundColor: `${activeTheme.success}10`, // Lighter shade for header
      borderColor: activeTheme.border,
      color: activeTheme.success,
    },
    dosIcon: {
      color: activeTheme.success,
    },
    dontsHeader: {
      backgroundColor: `${activeTheme.error}10`, // Lighter shade for header
      borderColor: activeTheme.border,
      color: activeTheme.error,
    },
    dontsIcon: {
      color: activeTheme.error,
    },
    generalHeader: {
      backgroundColor: `${activeTheme.info}10`, // Lighter shade for header
      borderColor: activeTheme.border,
      color: activeTheme.info,
    },
    generalIcon: {
      color: activeTheme.info,
    },
    listItemText: {
      color: activeTheme.textSecondary,
    }
  };

  return (
    <div className="flex flex-col p-4 max-w-full min-h-screen" style={themeStyles.container}>
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold" style={themeStyles.title}>User Guidelines</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Do's Section */}
        <div className="guideline-card rounded-xl overflow-hidden border" style={themeStyles.card}>
          <div className="px-6 py-4 border-b" style={themeStyles.dosHeader}>
            <h2 className="text-xl font-semibold flex items-center">
              <CheckCircle2 className="mr-2" size={20} />
              Do's
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Verify receipt numbers before submission</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Double-check names for accurate spelling</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Select the correct Hissa type (Qurbani/Aqeeqah)</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Ensure mobile numbers are correct if provided</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Review all entries before final submission</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Use the edit feature to correct mistakes</span>
              </li>
              <li className="guideline-item flex items-start">
                <CheckCircle2 className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dosIcon} />
                <span style={themeStyles.listItemText}>Try refreshing the page if the interface not loading properly</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Don'ts Section */}
        <div className="guideline-card rounded-xl overflow-hidden border" style={themeStyles.card}>
          <div className="px-6 py-4 border-b" style={themeStyles.dontsHeader}>
            <h2 className="text-xl font-semibold flex items-center">
              <XCircle className="mr-2" size={20} />
              Don'ts
            </h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="guideline-item flex items-start">
                <XCircle className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dontsIcon} />
                <span style={themeStyles.listItemText}>Don't exceed the 7 Hissa limit per receipt</span>
              </li>
              <li className="guideline-item flex items-start">
                <XCircle className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dontsIcon} />
                <span style={themeStyles.listItemText}>Don't use abbreviations for names</span>
              </li>
              <li className="guideline-item flex items-start">
                <XCircle className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dontsIcon} />
                <span style={themeStyles.listItemText}>Don't leave required fields blank</span>
              </li>
              <li className="guideline-item flex items-start">
                <XCircle className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dontsIcon} />
                <span style={themeStyles.listItemText}>Don't share your login credentials</span>
              </li>
              <li className="guideline-item flex items-start">
                <XCircle className="mt-1 mr-3 flex-shrink-0" size={18} style={themeStyles.dontsIcon} />
                <span style={themeStyles.listItemText}>Don't use the system on public computers without logging out</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Guidelines Section */}
      <div className="guideline-card mt-8 rounded-xl overflow-hidden border" style={themeStyles.card}>
        <div className="px-6 py-4 border-b" style={themeStyles.generalHeader}>
          <h2 className="text-xl font-semibold">General Guidelines</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center" style={{color: activeTheme.textPrimary}}>
                <CheckCircle2 className="mr-2" size={18} style={themeStyles.generalIcon} />
                Data Entry
              </h3>
              <ul className="space-y-2" style={themeStyles.listItemText}>
                <li className="pl-6">• Always verify receipt numbers with physical copies</li>
                <li className="pl-6">• Use full names as they appear on official documents</li>
                <li className="pl-6">• Double-check mobile numbers before saving</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3 flex items-center" style={{color: activeTheme.textPrimary}}>
                <XCircle className="mr-2" size={18} style={themeStyles.generalIcon} />
                Common Mistakes
              </h3>
              <ul className="space-y-2" style={themeStyles.listItemText}>
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