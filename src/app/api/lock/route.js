import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET(request) {
  try {
    const [results] = await pool.query(`
      SELECT lock_status FROM admin WHERE id = 1
    `);
        
    return NextResponse.json(results);
   
  } catch (error) {
    console.error('Error fetching lock:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch lock status',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { lock_status } = body;

    // Validate the input
    if (lock_status === undefined || lock_status === null) {
      return NextResponse.json(
        { error: 'lock_status is required' },
        { status: 400 }
      );
    }

    // Ensure lock_status is either 0 or 1
    const lockValue = lock_status ? 1 : 0;

    // Update the lock_status where id = 1
    const [result] = await pool.query(
      'UPDATE admin SET lock_status = ? WHERE id = 1',
      [lockValue]
    );

    // Check if any row was affected
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'No admin record found with id = 1' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      { 
        message: 'Lock status updated successfully',
        lock_status: lockValue
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating lock status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update lock status',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}