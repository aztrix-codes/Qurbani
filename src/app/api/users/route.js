// app/api/users/route.js
import { NextResponse } from 'next/server';
import pool from '../db';
import { checkAuth, checkLockStatus } from '../apiUtils';

export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');

    let query = 'SELECT id, name, area_name, zone_name, regions_incharge_of, phone, email, created_at, area_incharge, zone_incharge, rate_r1, rate_r2, publish FROM users WHERE 1=1';
    const params = [];

    if (region) {
      // 0 means incharge of all regions
      query += ' AND (regions_incharge_of = ? OR regions_incharge_of = 0)';
      params.push(region);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);
    return NextResponse.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const userData = await request.json();
    
    // Validate required fields
    if (!userData.name || !userData.phone || !userData.email || !userData.password) {
      return NextResponse.json(
        { error: 'Missing required fields (name, phone, email, password)' },
        { status: 400 }
      );
    }

    // Removed hashing: const hashedPassword = bcrypt.hashSync(userData.password, 10);

    // Insert new user with plain text password
    const [result] = await pool.query(
      `INSERT INTO users SET ?`,
      [{
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password, // Store plain text password
        pfp: userData.pfp || null,
        area_name: userData.area_name || '',
        area_incharge: userData.area_incharge || '',
        zone_name: userData.zone_name || '',
        zone_incharge: userData.zone_incharge || '',
        regions_incharge_of: userData.regions_incharge_of !== undefined ? userData.regions_incharge_of : 2,
        rate_r1: userData.rate_r1 !== undefined ? userData.rate_r1 : 0,
        rate_r2: userData.rate_r2 !== undefined ? userData.rate_r2 : 0,
        publish: userData.publish !== undefined ? userData.publish : 1
      }]
    );

    // Get the newly created user (without password)
    const [newUser] = await pool.query(
      `SELECT 
        id, name, phone, email, pfp, 
        area_name, area_incharge, 
        zone_name, zone_incharge, 
        regions_incharge_of, rate_r1, rate_r2, 
        publish, created_at, updated_at
      FROM users WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newUser[0], { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    // Check for duplicate entry error (MySQL error code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { error: 'Email or phone number already exists.' },
            { status: 409 } // 409 Conflict
        );
    }
    return NextResponse.json(
      { error: 'Internal server error during user creation' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const userData = await request.json();
    
    // Validate required fields
    if (!userData.id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update fields dynamically
    const updateFields = {};
    const allowedFields = [
      'name', 'phone', 'email', 'pfp', 
      'area_name', 'area_incharge', 'zone_name', 'zone_incharge',
      'regions_incharge_of', 'rate_r1', 'rate_r2', 'publish'
    ];

    allowedFields.forEach(field => {
      // Check if the field exists in userData and is not explicitly null
      // Allow empty strings for fields like pfp, area_name etc.
      if (userData.hasOwnProperty(field) && userData[field] !== null) {
          updateFields[field] = userData[field];
      }
    });

    // Handle password update separately (store plain text)
    if (userData.password && userData.password.trim() !== '') {
      // Removed hashing: const hashedPassword = bcrypt.hashSync(userData.password, 10);
      updateFields.password = userData.password; // Store plain text password
    }

    // Special validation for regions_incharge_of
    if (updateFields.regions_incharge_of !== undefined && 
        ![0, 1, 2].includes(updateFields.regions_incharge_of)) {
      return NextResponse.json(
        { error: 'regions_incharge_of must be 0, 1, or 2' },
        { status: 400 }
      );
    }
    
    // Ensure there are fields to update
    if (Object.keys(updateFields).length === 0) {
        return NextResponse.json(
            { error: 'No valid fields provided for update' },
            { status: 400 }
        );
    }

    // Update user data
    await pool.query(
      `UPDATE users SET ? WHERE id = ?`,
      [updateFields, userData.id]
    );

    // Get the updated user (without password)
    const [updatedUser] = await pool.query(
      `SELECT 
        id, name, phone, email, pfp, 
        area_name, area_incharge, 
        zone_name, zone_incharge, 
        regions_incharge_of, rate_r1, rate_r2, 
        publish, created_at, updated_at
      FROM users WHERE id = ?`,
      [userData.id]
    );
    
    if (updatedUser.length === 0) {
        return NextResponse.json(
            { error: 'User not found after update' },
            { status: 404 }
        );
    }

    return NextResponse.json(updatedUser[0]);

  } catch (error) {
    console.error('Error updating user:', error);
     // Check for duplicate entry error (MySQL error code 1062)
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
            { error: 'Email or phone number already exists for another user.' },
            { status: 409 } // 409 Conflict
        );
    }
    return NextResponse.json(
      { error: 'Internal server error during user update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // First check if user exists
    const [user] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error during user deletion' },
      { status: 500 }
    );
  }
}

