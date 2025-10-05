'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../themeContext';
import { Download, List, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './style.css';

// Shimmer component for loading state
const Shimmer = () => {
    const { activeTheme } = useTheme();
    const shimmerRow = (
        <div className="table-row" style={{ borderBottomColor: activeTheme.border }}>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover }} /></div>
            <div className="table-cell"><div className="shimmer-line" style={{ backgroundColor: activeTheme.hover }} /></div>
        </div>
    );
    return (
        <div className="invoice-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
            <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}>
                <div className="header">
                    <div className="header-left">
                        <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '2rem', width: '250px', borderRadius: '0.5rem' }} />
                        <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '1.25rem', width: '350px', marginTop: '0.5rem', borderRadius: '0.5rem' }} />
                    </div>
                </div>
                <div className="table-container">
                    <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary }}>
                        <div className="table-cell">Date</div>
                        <div className="table-cell">Paid By</div>
                        <div className="table-cell">Shares</div>
                        <div className="table-cell">Total Amount</div>
                        <div className="table-cell">Download</div>
                    </div>
                    <div className="table-body">
                        {Array(5).fill(0).map((_, index) => <React.Fragment key={index}>{shimmerRow}</React.Fragment>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InvoicePage() {
    const { activeTheme } = useTheme();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        try {
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            if (storedUserData) setUserData(storedUserData);
        } catch (e) {
            console.error("Could not parse user data", e);
        }

        const fetchReceipts = async () => {
            try {
                const response = await fetch('/api/receipts');
                if (!response.ok) throw new Error('Failed to fetch receipts');
                const data = await response.json();
                setReceipts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchReceipts();
    }, []);

    const userReceipts = userData
        ? receipts.filter(receipt => receipt.user_name === userData.name)
        : [];
        
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB');

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount || 0);

    const handleDownloadPDF = (receipt) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(activeTheme.textPrimary);
        doc.text("Qurbani Receipt", 105, 20, { align: 'center' });
        
        // Sub-header Info
        doc.setFontSize(11);
        doc.setTextColor(activeTheme.textSecondary);
        doc.text(`Receipt ID: QUR-${receipt.id}`, 20, 40);
        doc.text(`Date: ${formatDate(receipt.created_at)}`, 20, 45);
        
        // Billed To
        doc.text("Billed To:", 20, 60);
        doc.setTextColor(activeTheme.textPrimary);
        doc.setFontSize(12);
        doc.text(receipt.user_name, 20, 66);
        if (receipt.phone) doc.text(receipt.phone, 20, 72);
        
        // Table using autoTable
        doc.autoTable({
            startY: 85,
            head: [['Description', 'Shares (Hissa)', 'Rate per Share', 'Total Amount']],
            body: [
                [
                    'Qurbani Shares',
                    receipt.hissa,
                    formatCurrency(receipt.rate),
                    formatCurrency(receipt.total_amt)
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: activeTheme.accentPrimary },
        });

        const finalY = doc.lastAutoTable.finalY;

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(activeTheme.textSecondary);
        doc.text("Thank you for your contribution!", 105, finalY + 20, { align: 'center' });

        doc.save(`Qurbani-Receipt-${receipt.id}.pdf`);
    };

    if (loading) {
        return <Shimmer />;
    }

    return (
        <div className="invoice-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
            <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgSecondary, borderColor: activeTheme.border }}>
                <div className="header">
                    <div className="header-left">
                        <h1 className="title" style={{ color: activeTheme.textPrimary }}>My Invoices</h1>
                        <p className="subtitle" style={{ color: activeTheme.textSecondary }}>Download a PDF of your submitted receipts.</p>
                    </div>
                </div>

                {error && <p className="error-message" style={{ color: activeTheme.error }}>Error: {error}</p>}

                <div className="table-container">
                    <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary, backgroundColor: activeTheme.bgSecondary }}>
                        <div className="table-cell">Date</div>
                        <div className="table-cell name-cell">Paid By</div>
                        <div className="table-cell">Shares</div>
                        <div className="table-cell">Total Amount</div>
                        <div className="table-cell">Download</div>
                    </div>
                    <div className="table-body">
                        {userReceipts.length > 0 ? (
                            userReceipts.map(receipt => (
                                <div className="table-row" key={receipt.id} style={{ borderBottomColor: activeTheme.border }}>
                                    <div data-label="Date" className="table-cell" style={{ color: activeTheme.textSecondary }}>{formatDate(receipt.created_at)}</div>
                                    <div data-label="Paid By" className="table-cell name-cell" style={{ color: activeTheme.textPrimary }}>{receipt.paid_by}</div>
                                    <div data-label="Shares" className="table-cell" style={{ color: activeTheme.textSecondary }}>{receipt.hissa}</div>
                                    <div data-label="Total Amount" className="table-cell" style={{ color: activeTheme.accentPrimary, fontWeight: 600 }}>{formatCurrency(receipt.total_amt)}</div>
                                    <div data-label="Download" className="table-cell">
                                        <button onClick={() => handleDownloadPDF(receipt)} className="download-btn" style={{color: activeTheme.accentPrimary, borderColor: activeTheme.border}}>
                                            <Download size={16} />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state" style={{ color: activeTheme.textSecondary }}>
                                <FileText size={48} />
                                <p>You have no invoices yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}