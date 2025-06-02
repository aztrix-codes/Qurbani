import { NextResponse } from 'next/server';
import pool from '@/app/api/db';

export async function GET(request) {
  try {
    const [results] = await pool.query(`
      SELECT 
        zone_name,
        zone_incharge,
        area_name,
        area_incharge,
        region1_total,
        region1_divided_by_7,
        region1_paid,
        region1_pending,
        region1_amount_expected,
        region1_amount_collected,
        region2_total,
        region2_paid,
        region2_pending,
        region2_amount_expected,
        region2_amount_collected,
        total_animals,
        paid,
        pending,
        total_amount_expected,
        total_amount_collected
      FROM animal_count
      ORDER BY zone_name, area_name
    `);
    
    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching animal count data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch animal count statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}