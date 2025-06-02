// app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/app/api/db';

// --- GET Handler (Existing) ---
export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const [authType] = authHeader.split(' ');
    // Allow admin or supervisor to fetch user details for editing
    if (!['admin', 'supervisor'].includes(authType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID parameter is missing' },
        { status: 400 }
      );
    }

    // Get the specific user by ID, including the password
    const [users] = await pool.query(
      `SELECT 
        id, name, phone, email, password, pfp, 
        area_name, area_incharge, 
        zone_name, zone_incharge, 
        regions_incharge_of, rate_r1, rate_r2, 
        publish, created_at, updated_at
      FROM users
      WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return the full user object, including the password
    return NextResponse.json(users[0]);

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// --- PUT Handler (Added) ---
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const [authType] = authHeader.split(' ');
    // Allow admin or supervisor to update users
    if (!['admin', 'supervisor'].includes(authType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'User ID parameter is missing' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
        name, phone, email, password, pfp, 
        area_name, area_incharge, zone_name, zone_incharge, 
        regions_incharge_of, rate_r1, rate_r2, publish 
    } = body;

    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];

    if (name !== undefined) { updateFields.push('name = ?'); queryParams.push(name); }
    if (phone !== undefined) { updateFields.push('phone = ?'); queryParams.push(phone); }
    if (email !== undefined) { updateFields.push('email = ?'); queryParams.push(email); }
    // Update password only if a non-empty string is provided
    if (password !== undefined && password !== '') { 
        updateFields.push('password = ?'); 
        queryParams.push(password); // Store plain text as requested
    }
    if (pfp !== undefined) { updateFields.push('pfp = ?'); queryParams.push(pfp); }
    if (area_name !== undefined) { updateFields.push('area_name = ?'); queryParams.push(area_name); }
    if (area_incharge !== undefined) { updateFields.push('area_incharge = ?'); queryParams.push(area_incharge); }
    if (zone_name !== undefined) { updateFields.push('zone_name = ?'); queryParams.push(zone_name); }
    if (zone_incharge !== undefined) { updateFields.push('zone_incharge = ?'); queryParams.push(zone_incharge); }
    if (regions_incharge_of !== undefined) { updateFields.push('regions_incharge_of = ?'); queryParams.push(regions_incharge_of); }
    if (rate_r1 !== undefined) { updateFields.push('rate_r1 = ?'); queryParams.push(rate_r1); }
    if (rate_r2 !== undefined) { updateFields.push('rate_r2 = ?'); queryParams.push(rate_r2); }
    if (publish !== undefined) { updateFields.push('publish = ?'); queryParams.push(publish); }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields provided for update' },
        { status: 400 }
      );
    }

    // Add the user ID to the end of the query parameters for the WHERE clause
    queryParams.push(id);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    const [result] = await pool.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Error updating user:', error);
    // Check for duplicate email/phone errors if necessary (e.g., error.code === 'ER_DUP_ENTRY')
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { error: 'Email or phone number already exists.' },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// --- DELETE Handler (Added for completeness, assuming needed) ---
export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const [authType] = authHeader.split(' ');
    // Allow admin or supervisor to delete users
    if (!['admin', 'supervisor'].includes(authType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'User ID parameter is missing' },
        { status: 400 }
      );
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

