export type Company = {
  id: string;
  name: string;
  legal_name: string | null;
  gstin: string | null;
  pan: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  financial_year_start: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};
