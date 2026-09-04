import { MOCK_FEES } from '../data/mockData';

let feeRecords = [...MOCK_FEES];
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getFeesByStudent(studentId) {
  await delay();
  const numId = Number(studentId);
  const records = feeRecords.filter((f) => f.student_id === numId);
  const list = records.length > 0 ? records : feeRecords.filter((f) => f.student_id === 1);
  const total = list.reduce((acc, f) => acc + (f.amount || 0), 0);
  const paid = list.reduce((acc, f) => acc + (f.amount_paid || 0), 0);
  const due = list.reduce((acc, f) => acc + (f.amount_due || 0), 0);

  return {
    success: true,
    data: {
      summary: { total_fees: total, total_paid: paid, total_due: due },
      records: list,
    },
  };
}

export async function getAllFees(params = {}) {
  await delay();
  let filtered = [...feeRecords];
  if (params.status) {
    filtered = filtered.filter((f) => f.status === params.status);
  }
  const totalCollected = filtered.reduce((acc, f) => acc + (f.amount_paid || 0), 0);
  const totalOutstanding = filtered.reduce((acc, f) => acc + (f.amount_due || 0), 0);

  return {
    success: true,
    count: filtered.length,
    summary: {
      total_records: filtered.length,
      total_collected: totalCollected,
      total_outstanding: totalOutstanding,
    },
    data: filtered,
  };
}

export async function createFee(data) {
  await delay();
  const newFee = {
    id: Date.now(),
    ...data,
    amount_paid: 0,
    amount_due: data.amount,
    status: 'pending',
  };
  feeRecords.unshift(newFee);
  return { success: true, message: 'Fee record created successfully', data: newFee };
}

export async function updateFee(id, data) {
  await delay();
  const idx = feeRecords.findIndex((f) => f.id === Number(id));
  if (idx !== -1) {
    const updated = { ...feeRecords[idx], ...data };
    if (updated.amount_paid >= updated.amount) {
      updated.status = 'paid';
      updated.amount_due = 0;
    } else if (updated.amount_paid > 0) {
      updated.status = 'partial';
      updated.amount_due = updated.amount - updated.amount_paid;
    }
    feeRecords[idx] = updated;
    return { success: true, message: 'Fee updated successfully', data: updated };
  }
  return { success: false, message: 'Fee record not found' };
}
