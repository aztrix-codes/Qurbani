import { NextResponse } from 'next/server';
import pool from '@/app/api/db';

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

    const [zones] = await pool.query(`
      SELECT * FROM zones
      ORDER BY name ASC
    `);
    return NextResponse.json(zones);

  } catch (error) {
    console.error('Error fetching zones:', error);
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

    const zoneData = await request.json();
    
    if (!zoneData.name || !zoneData.incharge || !zoneData.phone || !zoneData.email) {
      return NextResponse.json(
        { error: 'Missing required fields (name, incharge, phone, email)' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO zones SET ?`,
      [{
        name: zoneData.name,
        incharge: zoneData.incharge,
        phone: zoneData.phone,
        email: zoneData.email,
        publish: zoneData.publish !== undefined ? zoneData.publish : true
      }]
    );

    const [newZone] = await pool.query(
      `SELECT * FROM zones WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newZone[0], { status: 201 });

  } catch (error) {
    console.error('Error creating zone:', error);
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

    const zoneData = await request.json();
    
    if (!zoneData.id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const updateFields = {};
    const allowedFields = ['name', 'incharge', 'phone', 'email', 'publish'];

    allowedFields.forEach(field => {
      if (zoneData[field] !== undefined) {
        updateFields[field] = zoneData[field];
      }
    });

    await pool.query(
      `UPDATE zones SET ? WHERE id = ?`,
      [updateFields, zoneData.id]
    );

    const [updatedZone] = await pool.query(
      `SELECT * FROM zones WHERE id = ?`,
      [zoneData.id]
    );

    return NextResponse.json(updatedZone[0]);

  } catch (error) {
    console.error('Error updating zone:', error);
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
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    // Check if zone exists
    const [zone] = await pool.query(
      'SELECT * FROM zones WHERE id = ?',
      [id]
    );

    if (zone.length === 0) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    // Check if zone has areas
    const [areas] = await pool.query(
      'SELECT id FROM areas WHERE zone_name = ?',
      [zone[0].name]
    );

    if (areas.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete zone with assigned areas' },
        { status: 400 }
      );
    }

    await pool.query(
      'DELETE FROM zones WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Zone deleted successfully' });

  } catch (error) {
    console.error('Error deleting zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}