'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../themeContext';
import { Save, X, Loader } from 'lucide-react';
import axios from 'axios';
import './style.css';

const hissaOptions = [
  { value: 1, label: "Qurbani" },
  { value: 2, label: "Aqeeqah (Boy)" },
  { value: 3, label: "Aqeeqah (Girl)" }
];

// Helper to create a clean, default card state
const createInitialCards = () => Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  type: 1, // Default to Qurbani
  text: "",
  isPaired: false,
  pairId: null,
}));

export default function AddSharesPage() {
  const { activeTheme } = useTheme();
  const [hissaCards, setHissaCards] = useState(createInitialCards());
  const [region, setRegion] = useState(2);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('userData'));
      if (storedUserData) {
        setUserData(storedUserData);
        // Set default region based on user's permissions
        if (storedUserData.regions_incharge_of === 1) {
            setRegion(1); // Mumbai only
        } else {
            setRegion(2); // OOM or Both, default to OOM
        }
      } else {
        router.replace('/auth/user');
      }
    } catch (e) {
      console.error("Could not parse user data", e);
      router.replace('/auth/user');
    }
  }, [router]);

  const getHissaWeight = (type) => (type === 2 ? 2 : 1);

  const calculateTotalWeight = useCallback((cards) => {
    return cards.reduce((total, card) => {
        if (card.text.trim() && !card.isPaired) {
            return total + getHissaWeight(card.type);
        }
        return total;
    }, 0);
  }, []);
  
  const totalUsedHissas = calculateTotalWeight(hissaCards);


  const handleTypeChange = (id, newTypeStr) => {
    const newType = Number(newTypeStr);
    setError(null);

    setHissaCards(prev => {
        const cards = JSON.parse(JSON.stringify(prev)); // Deep copy
        const currentCard = cards.find(c => c.id === id);
        
        // Clear old pairs originating from this card
        const newCards = cards.map(c => c.pairId === id ? {...createInitialCards()[c.id-1]} : c);
        const cardToUpdate = newCards.find(c => c.id === id);
        
        cardToUpdate.type = newType;
        
        if (newType === 2) {
            const nextCardIndex = newCards.findIndex(c => c.id > id && !c.text.trim() && !c.isPaired);
            if (nextCardIndex !== -1) {
                newCards[nextCardIndex] = {
                    ...newCards[nextCardIndex], text: cardToUpdate.text, type: 2, isPaired: true, pairId: id,
                };
            } else {
                setError("No available slot next to this card for an Aqeeqah (Boy) pair. Please clear the next card.");
                return prev; // Revert change if no space
            }
        }
        
        // Final check on total weight
        if (calculateTotalWeight(newCards) > 7) {
            setError("This change would exceed the 7 hissa limit.");
            return prev;
        }

        return newCards;
    });
  };

    const handleTextChange = (id, text) => {
        setHissaCards(prev => {
            const newCards = [...prev];
            const mainCard = newCards.find(c => c.id === id);
            if (mainCard) mainCard.text = text;

            // If it's an Aqeeqah boy, mirror the text to its pair
            if (mainCard && mainCard.type === 2) {
                const pairedCard = newCards.find(c => c.pairId === id);
                if (pairedCard) pairedCard.text = text;
            }
            return newCards;
        });
    };

  const handleClearCard = (id) => {
    setHissaCards(prev => {
        const newCards = JSON.parse(JSON.stringify(prev));
        const cardToClear = newCards.find(c => c.id === id);
        
        // If the card has a pair, clear the pair too
        const pairedCard = newCards.find(c => c.pairId === id);
        if(pairedCard) {
            Object.assign(pairedCard, createInitialCards()[pairedCard.id - 1]);
        }
        
        // Reset the card itself
        Object.assign(cardToClear, createInitialCards()[id - 1]);
        return newCards;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess('');

    if (!receiptNumber) { setError("Receipt number is required."); return; }
    
    const validCards = hissaCards.filter(c => c.text.trim() && !c.isPaired);
    if (validCards.length === 0) { setError("At least one hissa must have a name."); return; }

    if (totalUsedHissas > 7) { setError("Total hissas cannot exceed 7."); return; }

    setIsSubmitting(true);
    
    const customerPromises = validCards.map(card => {
        const customerData = {
            receipt: receiptNumber, name: card.text, phone: mobileNumber || null,
            type: card.type, region: region, user_name: userData.name,
            area_name: userData.area_name, area_incharge: userData.area_incharge,
            zone_name: userData.zone_name, zone_incharge: userData.zone_incharge,
            status: false, payment_status: false, amount_paid: 0.00
        };
        const count = getHissaWeight(card.type);
        return Array(count).fill(0).map(() => axios.post('/api/customers', customerData));
    }).flat();

    try {
        await Promise.all(customerPromises);
        setSuccess('Shares submitted successfully!');
        setHissaCards(createInitialCards());
        setReceiptNumber("");
        setMobileNumber("");
        setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
        console.error("Submission error:", err);
        setError(err.response?.data?.error || err.message || "An unknown error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className="add-shares-container" style={{ backgroundColor: activeTheme.bgPrimary }}>
      <div className="main-content">
        <div className="header-section">
          <div className="header-left">
            <h1 className="title" style={{ color: activeTheme.textPrimary }}>Add New Shares</h1>
            <p className="subtitle" style={{ color: activeTheme.textSecondary }}>Fill the details for a receipt and add up to 7 hissas.</p>
          </div>
          <button 
            className="button save-button"
            onClick={handleSubmit}
            disabled={isSubmitting || totalUsedHissas === 0}
            style={{ backgroundColor: activeTheme.accentPrimary, color: activeTheme.bgPrimary }}
          >
            {isSubmitting ? <Loader size={20} className="spinner" /> : <Save size={20} />}
            <span>{isSubmitting ? 'Saving...' : `Save ${totalUsedHissas} Hissa(s)`}</span>
          </button>
        </div>
        
        <div className="input-section">
          <select 
            className="form-input"
            value={region}
            onChange={(e) => setRegion(Number(e.target.value))}
            style={{ backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border }}
          >
            {userData?.regions_incharge_of !== 1 && <option value={2}>Out of Mumbai</option>}
            {userData?.regions_incharge_of !== 2 && <option value={1}>Mumbai</option>}
          </select>
          
          <input 
            type="number" 
            placeholder="Enter Receipt Number *" 
            className="form-input"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            required
            style={{ backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border }}
          />
          
          <input 
            type="tel" 
            placeholder="Enter Mobile Number (Optional)" 
            className="form-input"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            style={{ backgroundColor: activeTheme.bgSecondary, color: activeTheme.textPrimary, borderColor: activeTheme.border }}
          />
        </div>
        
        <div className="hissa-counter" style={{ color: activeTheme.textSecondary }}>
          <span>Hissas Used: {totalUsedHissas} / 7</span>
        </div>
        
        <div className="cards-container">
          {hissaCards.map((card) => {
            const isAqeeqahBoy = card.type === 2;
            const cardStyles = {
              backgroundColor: activeTheme.bgSecondary,
              borderColor: activeTheme.border,
              borderLeftColor: card.isPaired ? activeTheme.neutralMedium : (isAqeeqahBoy ? activeTheme.info : activeTheme.accentPrimary),
            };
            
            return (
              <div key={card.id} className="hissa-card" style={cardStyles}>
                <div className="hissa-card-header">
                  <h3 style={{ color: activeTheme.textSecondary }}>
                    Hissa {card.id}
                  </h3>
                  {card.text.trim() && !card.isPaired && (
                    <button className="close-button" onClick={() => handleClearCard(card.id)} aria-label="Clear Hissa">
                      <X size={18} style={{ color: activeTheme.textSecondary }}/>
                    </button>
                  )}
                </div>
                
                <select 
                  value={card.type}
                  onChange={(e) => handleTypeChange(card.id, e.target.value)}
                  className="form-input"
                  required
                  disabled={card.isPaired}
                   style={{ 
                       backgroundColor: card.isPaired ? activeTheme.hover : activeTheme.bgPrimary, 
                       color: card.isPaired ? activeTheme.textSecondary : activeTheme.textPrimary, 
                       borderColor: activeTheme.border 
                    }}
                >
                  {hissaOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                
                <input 
                  type="text" 
                  value={card.text}
                  onChange={(e) => handleTextChange(card.id, e.target.value)}
                  placeholder={"Enter name *"}
                  className="form-input"
                  maxLength={250}
                  required
                  disabled={card.isPaired}
                  style={{ 
                      backgroundColor: card.isPaired ? activeTheme.hover : activeTheme.bgPrimary, 
                      color: card.isPaired ? activeTheme.textSecondary : activeTheme.textPrimary, 
                      borderColor: activeTheme.border 
                    }}
                />
              </div>
            );
          })}
        </div>
        
        {error && <div className="feedback-message error-message" style={{ backgroundColor: `${activeTheme.error}20`, color: activeTheme.error }}>{error}</div>}
        {success && <div className="feedback-message success-message" style={{ backgroundColor: `${activeTheme.success}20`, color: activeTheme.success }}>{success}</div>}
        
      </div>
    </div>
  );
}

