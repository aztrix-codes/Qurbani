import { NextResponse } from 'next/server';
import pool from './db';

export function checkAuth(authHeader) {
  if (!authHeader) return { error: 'Authorization header missing', status: 401 };
  
  const [authType, ...data] = authHeader.split(' ');
  const type = authType.toLowerCase();

  if (!['admin', 'supervisor', 'user'].includes(type)) {
    return { error: 'Unauthorized access', status: 403 };
  }

  return { 
    authorized: true, 
    type: type,
    name: data.join(' ') // Optional: The rest of the header can be the user's name
  };
}

export async function checkLockStatus() {
  try {
    const [results] = await pool.query('SELECT lock_status FROM admin LIMIT 1');
    if (results.length > 0 && results[0].lock_status === 1) {
      return { locked: true, error: 'System is currently locked by Administrator', status: 423 };
    }
    return { locked: false };
  } catch (error) {
    console.error('Error checking lock status:', error);
    return { locked: false }; 
  }
}
