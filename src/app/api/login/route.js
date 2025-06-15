// app/api/login/route.js
import { NextResponse } from 'next/server';
import pool from '../db';

export async function POST(request) {
  try {
    const { auth, identifier, password } = await request.json();

    if (!auth || !identifier || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let query;
    let params;
    let userType;

    switch (auth.toLowerCase()) {
      case 'admin':
        query = 'SELECT * FROM admin WHERE username = ? AND password = ?';
        params = [identifier, password];
        userType = 'admin';
        break;

      case 'supervisor':
        query = 'SELECT * FROM supervisor WHERE username = ? AND password = ?';
        params = [identifier, password];
        userType = 'supervisor';
        break;

      case 'user':
        // Check if identifier is email or phone
        const isEmail = identifier.includes('@');
        if (isEmail) {
          query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        } else {
          query = 'SELECT * FROM users WHERE phone = ? AND password = ?';
        }
        params = [identifier, password];
        userType = 'user';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid authentication type' },
          { status: 400 }
        );
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Prepare additional data based on user type
    let responseData = {
      userType,
      user: userWithoutPassword,
    };

    // For users, include their customer data
    if (userType === 'user') {
      const [customers] = await pool.query(
        'SELECT * FROM customers WHERE user_name = ? AND status = TRUE',
        [user.name]
      );
      responseData.customers = customers;
    }


    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}