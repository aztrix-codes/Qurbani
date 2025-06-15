// app/api/customers/route.js
import { NextResponse } from 'next/server';
import pool from '../db';



// GET all customers
export async function GET(request) {
  try {
    const [customers] = await pool.query(`
      SELECT * FROM customers
      ORDER BY created_at DESC
    `);
    
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
    const customerData = await request.json();
    
    // Validate required fields
    if (!customerData.receipt || !customerData.name || !customerData.user_name || 
        !customerData.area_name || !customerData.zone_name) {
      return NextResponse.json(
        { error: 'Missing required fields (receipt, name, user_name, area_name, zone_name)' },
        { status: 400 }
      );
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

// DELETE customer
export async function DELETE(request) {
  try {
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