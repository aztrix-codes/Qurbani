import nodemailer from 'nodemailer';

const EMAIL_ENABLED = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';

const FIELD_LABELS = {
  name: 'Name',
  phone: 'Phone',
  email: 'Email',
  password: 'Password',
  area_name: 'Area',
  area_incharge: 'Area Incharge',
  zone_name: 'Zone',
  zone_incharge: 'Zone Incharge',
  regions_incharge_of: 'Region',
  rate_r1: 'Mumbai Rate',
  rate_r2: 'Out of Mumbai Rate',
  publish: 'Published Status',
};

let transporter;

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCurrency = (value) => {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? `Rs. ${amount.toFixed(2)}` : 'Rs. 0.00';
};

const formatRegion = (value) => {
  const region = Number.parseInt(value, 10);
  if (region === 0) return 'Both';
  if (region === 1) return 'Mumbai';
  if (region === 2) return 'Out of Mumbai';
  return 'Not set';
};

const formatBoolean = (value) => (Number(value) === 1 || value === true ? 'Yes' : 'No');

const formatFieldValue = (field, value) => {
  if (field === 'regions_incharge_of' || field === 'region') return formatRegion(value);
  if (field === 'rate_r1' || field === 'rate_r2' || field === 'amount_paid' || field === 'total_amt' || field === 'rate') {
    return formatCurrency(value);
  }
  if (field === 'publish' || field === 'status' || field === 'payment_status') return formatBoolean(value);
  return value === undefined || value === null || value === '' ? 'Not set' : String(value);
};

const actorLabel = (actorType) => {
  if (actorType === 'admin') return 'Admin';
  if (actorType === 'supervisor') return 'Supervisor';
  if (actorType === 'user') return 'User';
  return 'System';
};

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

const missingSmtpConfig = () =>
  ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].filter(
    (key) => !process.env[key]
  );

const renderEmail = ({ title, intro, rows = [], footer }) => {
  const renderedRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #d9e2dc;font-weight:600;background:#f4faf6;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border:1px solid #d9e2dc;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#18382d;">
      <h2 style="margin:0 0 12px;">${escapeHtml(title)}</h2>
      <p>${escapeHtml(intro)}</p>
      ${rows.length ? `<table style="border-collapse:collapse;width:100%;max-width:680px;">${renderedRows}</table>` : ''}
      <p style="margin-top:18px;color:#5f716a;">${escapeHtml(footer || 'This is an automated update from the Qurbani Collection system.')}</p>
    </div>
  `;
};

const renderText = ({ title, intro, rows = [], footer }) => [
  title,
  '',
  intro,
  '',
  ...rows.map(([label, value]) => `${label}: ${value}`),
  '',
  footer || 'This is an automated update from the Qurbani Collection system.',
].join('\n');

export async function sendNotificationEmail({ to, subject, title, intro, rows, footer }) {
  if (!to) {
    return { skipped: true, reason: 'Recipient email is missing' };
  }

  if (!EMAIL_ENABLED) {
    return { skipped: true, reason: 'Email notifications are disabled' };
  }

  const missing = missingSmtpConfig();
  if (missing.length > 0) {
    console.warn(`Email notification skipped. Missing SMTP config: ${missing.join(', ')}`);
    return { skipped: true, reason: `Missing SMTP config: ${missing.join(', ')}` };
  }

  const message = { title, intro, rows, footer };

  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text: renderText(message),
      html: renderEmail(message),
    });

    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email notification failed:', error);
    return { failed: true, reason: error.message };
  }
}

export function getChangedUserFields(previousUser, nextUser, fields) {
  return fields.filter((field) => {
    const previousValue = previousUser?.[field] ?? '';
    const nextValue = nextUser?.[field] ?? '';
    return String(previousValue) !== String(nextValue);
  });
}

export async function notifyUserCreated({ user, password, actorType }) {
  return sendNotificationEmail({
    to: user.email,
    subject: 'Your Qurbani account has been created',
    title: 'Account Created',
    intro: `${actorLabel(actorType)} created your Qurbani collection account.`,
    rows: [
      ['Name', user.name],
      ['Phone', user.phone],
      ['Email', user.email],
      ['Password', password],
      ['Area', user.area_name],
      ['Zone', user.zone_name],
      ['Region', formatRegion(user.regions_incharge_of)],
      ['Mumbai Rate', formatCurrency(user.rate_r1)],
      ['Out of Mumbai Rate', formatCurrency(user.rate_r2)],
    ],
  });
}

export async function notifyUserUpdated({ previousUser, user, changedFields, actorType, password }) {
  const rows = changedFields.map((field) => [
    FIELD_LABELS[field] || field,
    field === 'password'
      ? password || 'Password was updated'
      : `${formatFieldValue(field, previousUser?.[field])} -> ${formatFieldValue(field, user?.[field])}`,
  ]);

  if (rows.length === 0) {
    return { skipped: true, reason: 'No changed fields' };
  }

  return sendNotificationEmail({
    to: user.email || previousUser?.email,
    subject: 'Your Qurbani account has been updated',
    title: 'Account Updated',
    intro: `${actorLabel(actorType)} updated your account details.`,
    rows,
  });
}

export async function notifyUserDeleted({ user, actorType }) {
  return sendNotificationEmail({
    to: user.email,
    subject: 'Your Qurbani account has been removed',
    title: 'Account Removed',
    intro: `${actorLabel(actorType)} removed your Qurbani collection account.`,
    rows: [
      ['Name', user.name],
      ['Phone', user.phone],
      ['Area', user.area_name],
      ['Zone', user.zone_name],
    ],
  });
}

export async function notifySharesSubmitted({ user, customers }) {
  const firstCustomer = customers[0] || {};
  const hissaCount = customers.length;

  return sendNotificationEmail({
    to: user?.email,
    subject: 'Shares submitted successfully',
    title: 'Shares Submitted',
    intro: 'Your share entries were submitted and are now pending admin approval.',
    rows: [
      ['Submitted By', firstCustomer.user_name],
      ['Receipt Number', firstCustomer.receipt],
      ['Total Hissa', hissaCount],
      ['Area', firstCustomer.area_name],
      ['Zone', firstCustomer.zone_name],
      ['Region', formatRegion(firstCustomer.region)],
    ],
  });
}

export async function notifyCustomerStatusUpdated({ groupedUpdates, updateFields, actorType }) {
  const statusRows = [];

  if (updateFields.status !== undefined) {
    statusRows.push(['Record Approval Status', formatBoolean(updateFields.status)]);
  }

  if (updateFields.payment_status !== undefined) {
    statusRows.push(['Payment Status', formatBoolean(updateFields.payment_status)]);
  }

  if (updateFields.amount_paid !== undefined) {
    statusRows.push(['Amount Paid Per Hissa', formatCurrency(updateFields.amount_paid)]);
  }

  return Promise.all(
    groupedUpdates.map((group) =>
      sendNotificationEmail({
        to: group.email,
        subject: 'Your Qurbani records have been updated',
        title: 'Records Updated',
        intro: `${actorLabel(actorType)} updated ${group.count} of your submitted hissa record(s).`,
        rows: [
          ['Submitted By', group.userName],
          ['Receipt Numbers', group.receipts.join(', ')],
          ['Hissa Records Updated', group.count],
          ['Area', group.areaName],
          ['Zone', group.zoneName],
          ...statusRows,
        ],
      })
    )
  );
}

export async function notifyReceiptGenerated({ receipt, actorType }) {
  return sendNotificationEmail({
    to: receipt.recipient_email || receipt.email,
    subject: 'Payment receipt generated',
    title: 'Payment Receipt Generated',
    intro: `${actorLabel(actorType)} collected payment and generated a receipt.`,
    rows: [
      ['Receipt ID', receipt.id],
      ['Submitted By', receipt.user_name],
      ['Paid By', receipt.paid_by],
      ['Collected By', receipt.collected_by],
      ['Hissa Paid', receipt.hissa],
      ['Rate Per Hissa', formatCurrency(receipt.rate)],
      ['Total Amount', formatCurrency(receipt.total_amt)],
      ['Area', receipt.area_name],
      ['Zone', receipt.zone_name],
    ],
  });
}
