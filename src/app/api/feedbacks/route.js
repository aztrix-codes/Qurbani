// app/api/feedback/route.js
import { NextResponse } from 'next/server';
import pool from '../db';

export async function GET(request) {
  try {
    // Get all feedback with sorting by newest first
    const [feedback] = await pool.query(`
      SELECT * FROM feedback
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json(feedback);

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const feedbackData = await request.json();
    
    // Validate required fields
    if (!feedbackData.name || !feedbackData.feedback) {
      return NextResponse.json(
        { error: 'Missing required fields (name, feedback)' },
        { status: 400 }
      );
    }

    // Insert new feedback
    const [result] = await pool.query(
      `INSERT INTO feedback SET ?`,
      [{
        name: feedbackData.name,
        feedback: feedbackData.feedback
      }]
    );

    // Get the newly created feedback
    const [newFeedback] = await pool.query(
      `SELECT * FROM feedback WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newFeedback[0], { status: 201 });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // First check if feedback exists
    const [feedback] = await pool.query(
      'SELECT * FROM feedback WHERE id = ?',
      [id]
    );

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Delete feedback
    await pool.query(
      'DELETE FROM feedback WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Feedback deleted successfully' });

  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}