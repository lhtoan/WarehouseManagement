const API_URL = 'http://localhost:3000';

export async function fetchRevenueToday() {
  const res = await fetch(`${API_URL}/revenuebyday`);
  if (!res.ok) throw new Error('Failed to fetch revenue');
  return res.json();
}

export async function fetchTotalBillsToday() {
  const res = await fetch(`${API_URL}/totalbillstoday`);
  if (!res.ok) throw new Error('Failed to fetch bills');
  return res.json();
}
