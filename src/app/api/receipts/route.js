// app/api/receipts/route.js
import { NextResponse } from 'next/server';
import pool from '../db';

// Helper for auth check
function checkAuth(authHeader) {
  if (!authHeader) return { error: 'Authorization header missing', status: 401 };
  
  const [authType] = authHeader.split(' ');
  if (!['admin', 'supervisor'].includes(authType.toLowerCase())) {
    return { error: 'Unauthorized access', status: 403 };
  }
  return { authorized: true };
}

// Public GET endpoint
export async function GET(request) {
  try {
    const [receipts] = await pool.query(`
      SELECT * FROM receipts
      ORDER BY created_at DESC
    `);
    return NextResponse.json(receipts);

  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

// Authenticated POST endpoint
export async function POST(request) {
  try {
    // Check authentication
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const receiptData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'user_name', 'paid_by', 'collected_by', 
      'img', 'rate', 'hissa', 'total_amt',
      'area_name', 'area_incharge', 'zone_name', 'zone_incharge'
    ];
    
    const missingFields = requiredFields.filter(field => !receiptData[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert new receipt
    const [result] = await pool.query(
      `INSERT INTO receipts SET ?`,
      [{
        user_name: receiptData.user_name,
        phone: receiptData.phone || null,
        email: receiptData.email || null,
        paid_by: receiptData.paid_by,
        collected_by: receiptData.collected_by,
        img: receiptData.img,
        rate: receiptData.rate,
        hissa: receiptData.hissa,
        total_amt: receiptData.total_amt,
        area_name: receiptData.area_name,
        area_incharge: receiptData.area_incharge,
        zone_name: receiptData.zone_name,
        zone_incharge: receiptData.zone_incharge
      }]
    );

    // Return the created receipt
    const [newReceipt] = await pool.query(
      `SELECT * FROM receipts WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newReceipt[0], { status: 201 });

  } catch (error) {
    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}