// app/api/admin/costs/route.js
import { NextResponse } from 'next/server';
import pool from '../db';
import { checkAuth } from '../apiUtils';

// GET Mumbai costs
export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });
    const [results] = await pool.query(`
      SELECT 
        id,
        mumbai_cost,
        out_of_mumbai_cost 
      FROM admin
      LIMIT 1
    `);
    
    if (results.length === 0) {
      return NextResponse.json(
        { error: 'No admin record found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(results[0]);

  } catch (error) {
    console.error('Error fetching Mumbai costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    );
  }
}

// UPDATE Mumbai costs
export async function PUT(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    if (authCheck.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { id, mumbai_cost, out_of_mumbai_cost } = await request.json();
    
    if (!id || mumbai_cost === undefined || out_of_mumbai_cost === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (id, mumbai_cost, out_of_mumbai_cost)' },
        { status: 400 }
      );
    }

    if (isNaN(mumbai_cost)) {
      return NextResponse.json(
        { error: 'mumbai_cost must be a number' },
        { status: 400 }
      );
    }

    if (isNaN(out_of_mumbai_cost)) {
      return NextResponse.json(
        { error: 'out_of_mumbai_cost must be a number' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE admin SET 
        mumbai_cost = ?,
        out_of_mumbai_cost = ?
      WHERE id = ?`,
      [mumbai_cost, out_of_mumbai_cost, id]
    );

    return NextResponse.json({ 
      message: 'Costs updated successfully',
      mumbai_cost,
      out_of_mumbai_cost
    });

  } catch (error) {
    console.error('Error updating costs:', error);
    return NextResponse.json(
      { error: 'Failed to update cost data' },
      { status: 500 }
    );
  }
}