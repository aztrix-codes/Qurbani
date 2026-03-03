import { NextResponse } from "next/server";
import pool from '../db';
import { checkAuth } from '../apiUtils';

export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const [results] = await pool.query(`
      SELECT * FROM dashboard
    `);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch animal count statistics",
        details: process.env.NODE_ENV === "development" ? error.message : null,
      },
      { status: 500 }
    );
  }
}
