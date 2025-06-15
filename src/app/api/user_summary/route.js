import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET(request) {
  try {
    const [results] = await pool.query(`
      SELECT * FROM user_summary
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