'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../themeContext';
import { FileText, Eye, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import './style.css';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB');

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
}).format(amount || 0);

const PrintableReceipt = React.forwardRef(({ receipt }, ref) => {
    if (!receipt) return null;
    return (
        <div ref={ref} className="bill-container">
            <header className="bill-header">
                <h2>Qurbani Inc.</h2>
                <p>123 Charity Lane, Mumbai</p>
                <p>+91 98765 43210</p>
            </header>
            <div className="bill-separator"></div>
            <section className="bill-info">
                <p><span>Receipt ID:</span> <span>QUR-{receipt.id}</span></p>
                <p><span>Date:</span> <span>{formatDate(receipt.created_at)}</span></p>
            </section>
            <div className="bill-separator"></div>
            <section className="bill-info">
                <p><span>Billed To:</span> <span>{receipt.user_name}</span></p>
                {receipt.phone && <p><span>Phone:</span> <span>{receipt.phone}</span></p>}
            </section>
            <div className="bill-separator"></div>
            <section className="bill-items">
                <table>
                    <thead>
                        <tr>
                            <th>ITEM</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Qurbani Shares ({receipt.hissa}x)</td>
                            <td>{formatCurrency(receipt.total_amt)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <div className="bill-separator"></div>
            <section className="bill-total">
                <p><span>Subtotal</span> <span>{formatCurrency(receipt.total_amt)}</span></p>
                <p className="grand-total"><span>TOTAL</span> <span>{formatCurrency(receipt.total_amt)}</span></p>
            </section>
            <div className="bill-separator"></div>
            <footer className="bill-footer">
                <p>Thank you for your contribution!</p>
            </footer>
        </div>
    );
});
PrintableReceipt.displayName = 'PrintableReceipt';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

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
            <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgPrimary, borderColor: activeTheme.border }}>
                <div className="header">
                    <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '2rem', width: '250px', borderRadius: '0.5rem', marginBottom: '0.5rem' }} />
                    <div className="shimmer-line" style={{ backgroundColor: activeTheme.hover, height: '1.25rem', width: '350px', borderRadius: '0.5rem' }} />
                </div>
                <div className="table-container">
                    <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary, backgroundColor: activeTheme.bgSecondary }}>
                        <div className="table-cell">Date</div>
                        <div className="table-cell">Paid By</div>
                        <div className="table-cell">Shares</div>
                        <div className="table-cell">Total Amount</div>
                        <div className="table-cell">Actions</div>
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingReceipt, setViewingReceipt] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    const modalReceiptRef = useRef();

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    const handlePrint = useReactToPrint({
        content: () => modalReceiptRef.current,
        documentTitle: `Qurbani-Receipt-${viewingReceipt?.id || ''}`,
    });
    
    useEffect(() => {
        try {
            const storedUserData = JSON.parse(localStorage.getItem('userData'));
            if (storedUserData) setUserData(storedUserData);
        } catch (e) { console.error("Could not parse user data", e); }

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

    const handleViewClick = (receipt) => {
        setViewingReceipt(receipt);
        setIsModalOpen(true);
    };
    
    if (loading) { return <Shimmer />; }

    return (
        <div className="invoice-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="modal-preview-container">
                    <PrintableReceipt ref={modalReceiptRef} receipt={viewingReceipt} />
                </div>
                <div className="modal-actions">
                    <button onClick={() => setIsModalOpen(false)} className="modal-btn" style={{ borderColor: activeTheme.border, color: activeTheme.textSecondary }}>
                        Close
                    </button>
                    <button onClick={handlePrint} className="modal-btn modal-btn-print" style={{ backgroundColor: activeTheme.accentPrimary, borderColor: activeTheme.accentPrimary }}>
                        <Printer size={16} />
                        <span>Print / Save PDF</span>
                    </button>
                </div>
            </Modal>

            <div className="content-wrapper" style={{ backgroundColor: activeTheme.bgPrimary, borderColor: activeTheme.border }}>
                <div className="header">
                    <h1 className="title" style={{ color: activeTheme.textPrimary }}>My Invoices</h1>
                    <p className="subtitle" style={{ color: activeTheme.textSecondary }}>View or download a PDF of your receipts.</p>
                </div>

                {error && <p className="error-message" style={{ color: activeTheme.error }}>Error: {error}</p>}

                <div className="table-container">
                    {userReceipts.length > 0 ? (
                        <>
                            <div className="table-header" style={{ borderBottomColor: activeTheme.border, color: activeTheme.textSecondary, backgroundColor: activeTheme.bgSecondary }}>
                                <div className="table-cell">Date</div>
                                <div className="table-cell">Paid By</div>
                                <div className="table-cell">Shares</div>
                                <div className="table-cell">Total Amount</div>
                                <div className="table-cell">Actions</div>
                            </div>
                            <div className="table-body">
                                {userReceipts.map(receipt => (
                                    <div 
                                        className="table-row" 
                                        key={receipt.id} 
                                        style={{ 
                                            borderBottomColor: activeTheme.border,
                                            backgroundColor: isMobile ? activeTheme.bgSecondary : 'transparent',
                                            borderColor: isMobile ? activeTheme.border : 'transparent',
                                        }}
                                    >
                                        <div data-label="Date" className="table-cell" style={{ color: activeTheme.textSecondary }}>{formatDate(receipt.created_at)}</div>
                                        <div data-label="Paid By" className="table-cell name-cell" style={{ color: activeTheme.textPrimary }}>{receipt.paid_by}</div>
                                        <div data-label="Shares" className="table-cell" style={{ color: activeTheme.textSecondary }}>{receipt.hissa}</div>
                                        <div data-label="Total Amount" className="table-cell" style={{ color: activeTheme.accentPrimary, fontWeight: 600 }}>{formatCurrency(receipt.total_amt)}</div>
                                        <div data-label="Actions" className="table-cell">
                                            <button onClick={() => handleViewClick(receipt)} className="action-btn" style={{ color: activeTheme.textPrimary, borderColor: activeTheme.border }}>
                                                <Eye size={16} />
                                                <span>View / Print</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state" style={{ color: activeTheme.textSecondary, borderColor: activeTheme.border }}>
                            <FileText size={48} />
                            <p>You have no invoices yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}