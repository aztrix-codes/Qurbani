// app/api/customers/route.js
import { NextResponse } from 'next/server';
import pool from '../db';
import { checkAuth, checkLockStatus } from '../apiUtils';

// GET customers
export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    // Security: If user, restrict to their own records
    if (authCheck.type === 'user') {
      if (!authCheck.name) {
        return NextResponse.json({ error: 'User name required in Authorization header' }, { status: 400 });
      }
      query += ' AND user_name = ?';
      params.push(authCheck.name);
    }

    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }
    if (status !== null && status !== undefined) {
      query += ' AND status = ?';
      params.push(status === 'true' || status === '1' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const [customers] = await pool.query(query, params);
    
    return NextResponse.json(customers);

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// CREATE new customer
export async function POST(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const customerData = await request.json();
    
    // Validate required fields
    if (!customerData.receipt || !customerData.name || !customerData.user_name || 
        !customerData.area_name || !customerData.zone_name) {
      return NextResponse.json(
        { error: 'Missing required fields (receipt, name, user_name, area_name, zone_name)' },
        { status: 400 }
      );
    }

    // Security: Users can only submit for themselves
    if (authCheck.type === 'user' && customerData.user_name !== authCheck.name) {
      return NextResponse.json({ error: 'Cannot submit shares for another user' }, { status: 403 });
    }

    // Insert new customer
    const [result] = await pool.query(
      `INSERT INTO customers SET ?`,
      [{
        receipt: customerData.receipt,
        name: customerData.name,
        phone: customerData.phone || null,
        email: customerData.email || null,
        type: customerData.type || 1,
        region: customerData.region || 2,
        user_name: customerData.user_name,
        area_name: customerData.area_name,
        area_incharge: customerData.area_incharge || '',
        zone_name: customerData.zone_name,
        zone_incharge: customerData.zone_incharge || '',
        status: customerData.status !== undefined ? customerData.status : false,
        payment_status: customerData.payment_status !== undefined ? customerData.payment_status : false,
        amount_paid: customerData.amount_paid || 0.00
      }]
    );

    // Return the created customer
    const [newCustomer] = await pool.query(
      `SELECT * FROM customers WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(newCustomer[0], { status: 201 });

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// UPDATE customer
export async function PUT(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const customerData = await request.json();
    
    if (!customerData.id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Build update fields
    const updateFields = {};
    const allowedFields = [
      'receipt', 'name', 'phone', 'email', 'type', 'region',
      'user_name', 'area_name', 'area_incharge', 'zone_name', 'zone_incharge',
      'status', 'payment_status', 'amount_paid'
    ];

    allowedFields.forEach(field => {
      if (customerData[field] !== undefined) {
        updateFields[field] = customerData[field];
      }
    });

    // Validate region if being updated
    if (updateFields.region !== undefined && ![1, 2].includes(updateFields.region)) {
      return NextResponse.json(
        { error: 'Region must be 1 or 2' },
        { status: 400 }
      );
    }

    // Update customer
    await pool.query(
      `UPDATE customers SET ? WHERE id = ?`,
      [updateFields, customerData.id]
    );

    // Return updated customer
    const [updatedCustomer] = await pool.query(
      `SELECT * FROM customers WHERE id = ?`,
      [customerData.id]
    );

    return NextResponse.json(updatedCustomer[0]);

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// BULK UPDATE customer fields
export async function PATCH(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const { ids, payment_status, status, amount_paid } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Array of customer IDs required' }, { status: 400 });
    }

    const updateFields = {};

    if (payment_status !== undefined) {
      updateFields.payment_status = payment_status ? 1 : 0;
    }

    if (status !== undefined) {
      updateFields.status = status ? 1 : 0;
    }

    if (amount_paid !== undefined) {
      const parsedAmount = Number.parseFloat(amount_paid);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return NextResponse.json({ error: 'amount_paid must be a non-negative number' }, { status: 400 });
      }
      updateFields.amount_paid = parsedAmount;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No field to update provided' }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE customers SET ? WHERE id IN (?)`,
      [updateFields, ids]
    );

    return NextResponse.json({ 
      message: `Updated ${result.affectedRows} customers`,
      affectedRows: result.affectedRows 
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: 'Failed to update customers' }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const [customer] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );

    if (customer.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete customer
    await pool.query(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );

    return NextResponse.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
