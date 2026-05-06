import { NextResponse } from 'next/server';
import pool from '../db';
import { checkAuth, checkLockStatus } from '../apiUtils';
import { notifyReceiptGenerated } from '../emailNotifications';

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const parsePositiveNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const roundCurrency = (value) => Math.round(value * 100) / 100;
const createHttpError = (message, status) => Object.assign(new Error(message), { status });

const extractBase64Image = (value) => {
  if (!isNonEmptyString(value)) return null;

  if (value.startsWith('data:image/')) {
    const [, base64Data] = value.split(',');
    return base64Data || null;
  }

  return null;
};

const uploadReceiptImage = async (imageValue) => {
  if (!isNonEmptyString(imageValue)) {
    throw createHttpError('Receipt image is required', 400);
  }

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  const base64Data = extractBase64Image(imageValue);
  if (!base64Data) {
    throw createHttpError('Unsupported receipt image format', 400);
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw createHttpError('Receipt image upload is not configured', 500);
  }

  const formData = new FormData();
  formData.append('image', base64Data);
  formData.append('key', apiKey);

  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw createHttpError('Failed to upload receipt image', 502);
  }

  const data = await response.json();
  if (!data?.data?.url) {
    throw createHttpError('Receipt image upload did not return a URL', 502);
  }

  return data.data.url;
};

const validateReceiptPayload = (receiptData) => {
  const missingFields = [];

  ['user_name', 'paid_by', 'collected_by', 'img', 'area_name', 'zone_name'].forEach(
    (field) => {
      if (!isNonEmptyString(receiptData[field])) {
        missingFields.push(field);
      }
    }
  );

  if (missingFields.length > 0) {
    return {
      error: `Missing required fields: ${missingFields.join(', ')}`,
      status: 400,
    };
  }

  const rate = parsePositiveNumber(receiptData.rate);
  const hissa = parsePositiveInteger(receiptData.hissa);
  const totalAmt = parsePositiveNumber(receiptData.total_amt);
  const region = Number.parseInt(receiptData.region, 10);
  const customerIds = Array.isArray(receiptData.customer_ids)
    ? [...new Set(receiptData.customer_ids.map((id) => Number.parseInt(id, 10)).filter(Number.isInteger))]
    : [];

  if (!rate) {
    return { error: 'Rate must be a positive number', status: 400 };
  }

  if (!hissa) {
    return { error: 'Hissa must be a positive whole number', status: 400 };
  }

  if (!totalAmt) {
    return { error: 'Total amount must be a positive number', status: 400 };
  }

  if (![1, 2].includes(region)) {
    return { error: 'Region must be 1 or 2', status: 400 };
  }

  if (customerIds.length !== hissa) {
    return {
      error: 'Customer selection does not match the paying share count',
      status: 400,
    };
  }

  return {
    value: {
      userName: receiptData.user_name.trim(),
      phone: isNonEmptyString(receiptData.phone) ? receiptData.phone.trim() : null,
      email: isNonEmptyString(receiptData.email) ? receiptData.email.trim() : null,
      paidBy: receiptData.paid_by.trim(),
      collectedBy: receiptData.collected_by.trim(),
      img: receiptData.img,
      rate: roundCurrency(rate),
      hissa,
      totalAmt: roundCurrency(totalAmt),
      areaName: receiptData.area_name.trim(),
      areaIncharge:
        receiptData.area_incharge === undefined || receiptData.area_incharge === null
          ? ''
          : String(receiptData.area_incharge).trim(),
      zoneName: receiptData.zone_name.trim(),
      zoneIncharge:
        receiptData.zone_incharge === undefined || receiptData.zone_incharge === null
          ? ''
          : String(receiptData.zone_incharge).trim(),
      region,
      customerIds,
    },
  };
};

// GET receipts
export async function GET(request) {
  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    let query = 'SELECT * FROM receipts';
    const params = [];

    if (authCheck.type === 'user') {
      if (!authCheck.name) {
        return NextResponse.json({ error: 'User name required in Authorization header' }, { status: 400 });
      }
      query += ' WHERE user_name = ?';
      params.push(authCheck.name);
    }

    query += ' ORDER BY created_at DESC';

    const [receipts] = await pool.query(query, params);
    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

// Authenticated POST endpoint
export async function POST(request) {
  let connection;

  try {
    const authCheck = checkAuth(request.headers.get('authorization'));
    if (authCheck.error) return NextResponse.json(authCheck, { status: authCheck.status });

    const lockCheck = await checkLockStatus();
    if (lockCheck.locked) return NextResponse.json(lockCheck, { status: lockCheck.status });

    const receiptData = await request.json();
    const validation = validateReceiptPayload(receiptData);

    if (validation.error) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const payload = validation.value;

    if (authCheck.type === 'user' && payload.userName !== authCheck.name) {
      return NextResponse.json({ error: 'Cannot submit receipts for another user' }, { status: 403 });
    }

    const expectedTotal = roundCurrency(payload.hissa * payload.rate);
    if (Math.abs(payload.totalAmt - expectedTotal) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match the selected shares and rate' },
        { status: 400 }
      );
    }

    const imageUrl = await uploadReceiptImage(payload.img);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [customers] = await connection.query(
      `SELECT id, user_name, area_name, area_incharge, zone_name, zone_incharge, region, status, payment_status
       FROM customers
       WHERE id IN (?)
       FOR UPDATE`,
      [payload.customerIds]
    );

    if (customers.length !== payload.customerIds.length) {
      throw createHttpError('Some selected customers could not be found', 400);
    }

    const customerIdsInDb = new Set(customers.map((customer) => customer.id));
    const hasUnknownIds = payload.customerIds.some((id) => !customerIdsInDb.has(id));
    if (hasUnknownIds) {
      throw createHttpError('Customer selection is invalid', 400);
    }

    const invalidCustomer = customers.find((customer) => {
      if (customer.status !== 1) return true;
      if (customer.payment_status === 1) return true;
      if (customer.region !== payload.region) return true;
      if (customer.user_name !== payload.userName) return true;
      if (customer.area_name !== payload.areaName) return true;
      if (customer.zone_name !== payload.zoneName) return true;
      if ((customer.area_incharge || '') !== payload.areaIncharge) return true;
      if ((customer.zone_incharge || '') !== payload.zoneIncharge) return true;
      return false;
    });

    if (invalidCustomer) {
      throw createHttpError('Selected customers are no longer eligible for receipt generation', 409);
    }

    const [result] = await connection.query(
      `INSERT INTO receipts SET ?`,
      [
        {
          user_name: payload.userName,
          phone: payload.phone,
          email: payload.email,
          paid_by: payload.paidBy,
          collected_by: payload.collectedBy,
          img: imageUrl,
          rate: payload.rate,
          hissa: payload.hissa,
          total_amt: expectedTotal,
          area_name: payload.areaName,
          area_incharge: payload.areaIncharge,
          zone_name: payload.zoneName,
          zone_incharge: payload.zoneIncharge,
        },
      ]
    );

    const [updateResult] = await connection.query(
      `UPDATE customers
       SET payment_status = 1, amount_paid = ?
       WHERE id IN (?)`,
      [payload.rate, payload.customerIds]
    );

    if (updateResult.affectedRows !== payload.customerIds.length) {
      throw createHttpError('Failed to update all selected customer payments', 500);
    }

    await connection.commit();

    const [newReceipt] = await pool.query(
      `SELECT * FROM receipts WHERE id = ?`,
      [result.insertId]
    );

    const [recipientUsers] = await pool.query(
      `SELECT email FROM users WHERE name = ? LIMIT 1`,
      [payload.userName]
    );

    await notifyReceiptGenerated({
      receipt: {
        ...newReceipt[0],
        recipient_email: recipientUsers[0]?.email || newReceipt[0]?.email || payload.email,
      },
      actorType: authCheck.type,
    });

    return NextResponse.json(newReceipt[0], { status: 201 });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Error creating receipt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create receipt' },
      { status: error.status || 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
