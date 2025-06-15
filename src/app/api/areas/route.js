import { NextResponse } from 'next/server';
import pool from '../db';

function checkAuth(authHeader) {
  if (!authHeader) {
    return { error: 'Authorization header missing', status: 401 };
  }
  const [authType] = authHeader.split(' ');
  if (!['admin', 'supervisor'].includes(authType.toLowerCase())) {
    return { error: 'Unauthorized access', status: 403 };
  }
  return { authorized: true };
}

export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const [areas] = await pool.query(`
      SELECT a.*, z.incharge as zone_incharge_original 
      FROM areas a
      LEFT JOIN zones z ON a.zone_name = z.name
      ORDER BY a.name ASC
    `);
    return NextResponse.json(areas);

  } catch (error) {
    console.error('Error fetching areas:', error);
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

    const areaData = await request.json();
    
    if (!areaData.name || !areaData.incharge || !areaData.zone_name || !areaData.phone || !areaData.email) {
      return NextResponse.json(
        { error: 'Missing required fields (name, incharge, zone_name, phone, email)' },
        { status: 400 }
      );
    }

    // Verify zone exists
    const [zone] = await pool.query(
      'SELECT incharge FROM zones WHERE name = ?',
      [areaData.zone_name]
    );

    if (zone.length === 0) {
      return NextResponse.json(
        { error: 'Specified zone does not exist' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO areas SET ?`,
      [{
        name: areaData.name,
        incharge: areaData.incharge,
        zone_name: areaData.zone_name,
        zone_incharge: zone[0].incharge,
        phone: areaData.phone,
        email: areaData.email,
        publish: areaData.publish !== undefined ? areaData.publish : true
      }]
    );

    const [newArea] = await pool.query(
      `SELECT * FROM areas WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newArea[0], { status: 201 });

  } catch (error) {
    console.error('Error creating area:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const areaData = await request.json();
    
    if (!areaData.id) {
      return NextResponse.json(
        { error: 'Area ID is required' },
        { status: 400 }
      );
    }

    const updateFields = {};
    const allowedFields = ['name', 'incharge', 'zone_name', 'phone', 'email', 'publish'];

    allowedFields.forEach(field => {
      if (areaData[field] !== undefined) {
        updateFields[field] = areaData[field];
      }
    });

    // If zone_name is being updated, get new zone_incharge
    if (updateFields.zone_name) {
      const [zone] = await pool.query(
        'SELECT incharge FROM zones WHERE name = ?',
        [updateFields.zone_name]
      );

      if (zone.length === 0) {
        return NextResponse.json(
          { error: 'Specified zone does not exist' },
          { status: 400 }
        );
      }
      updateFields.zone_incharge = zone[0].incharge;
    }

    await pool.query(
      `UPDATE areas SET ? WHERE id = ?`,
      [updateFields, areaData.id]
    );

    const [updatedArea] = await pool.query(
      `SELECT * FROM areas WHERE id = ?`,
      [areaData.id]
    );

    return NextResponse.json(updatedArea[0]);

  } catch (error) {
    console.error('Error updating area:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Area ID is required' },
        { status: 400 }
      );
    }

    // Check if area exists
    const [area] = await pool.query(
      'SELECT * FROM areas WHERE id = ?',
      [id]
    );

    if (area.length === 0) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    // Check if area has users
    const [users] = await pool.query(
      'SELECT id FROM users WHERE area_name = ?',
      [area[0].name]
    );

    if (users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete area with assigned users' },
        { status: 400 }
      );
    }

    await pool.query(
      'DELETE FROM areas WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Area deleted successfully' });

  } catch (error) {
    console.error('Error deleting area:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}