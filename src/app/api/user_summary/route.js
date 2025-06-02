import { NextResponse } from 'next/server';
import pool from '@/app/api/db';

export async function GET(request) {
  try {
    const [results] = await pool.query(`
      SELECT 
        id,
        name,
        phone,
        email,
        area_name,
        area_incharge,
        zone_name,
        zone_incharge,
        regions_incharge_of,
        rate_r1,
        rate_r2,
        total_customers,
        paid_customers,
        pending_customers,
        total_amount_expected,
        total_amount_collected,
        publish
      FROM user_summary
      ORDER BY name
    `);
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching user summary data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user summaries',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}