import { NextResponse } from 'next/server';
import pool from '../db';
import { checkAuth } from '../apiUtils';

export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    let query = 'SELECT * FROM user_summary WHERE 1=1';
    const params = [];

    if (region) {
      // region 0 = both, so we include it.
      query += ' AND (region = ? OR region = 0)';
      params.push(region);
    }

    const [results] = await pool.query(query, params);
    
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