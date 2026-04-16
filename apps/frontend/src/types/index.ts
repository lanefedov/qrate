export interface User {
  _id: string;
  email: string;
  fullName: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Customer {
  _id: string;
  userId: string;
  fullName: string;
  organization: string;
  position?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Worker {
  name: string;
  salary: number;
  hours: number;
  fundHours: number;
}

export interface CalculationInput {
  materialsCost: number;
  equipmentCost: number;
  additionalCost: number;
  otherCost: number;
  workers: Worker[];
  bonusRate: number;
  taxRate: number;
  travelCost: number;
  estimateCost: number;
  overheadRate: number;
}

export interface CostBreakdown {
  materialsCost: number;
  equipmentCost: number;
  additionalCost: number;
  otherCost: number;
  laborCost: number;
  laborWithCoefficients: number;
  travelCost: number;
  estimateCost: number;
  subtotal: number;
  overheadAmount: number;
  totalNic: number;
}

export interface CalculationResult {
  nic: number;
  breakdown: CostBreakdown;
}

export type OrderStatus = 'draft' | 'calculated' | 'completed';

export interface Order {
  _id: string;
  userId: string;
  customerId: string;
  orderNumber: string;
  orderName: string;
  testType: string;
  requestDate: string;
  status: OrderStatus;
  calculationInput?: CalculationInput;
  calculationResult?: CalculationResult;
  pdfPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  calculatedOrders: number;
}

export interface TestTypeDefaultParams {
  materialsCost?: number;
  equipmentCost?: number;
  bonusRate?: number;
  taxRate?: number;
  overheadRate?: number;
}

export interface TestType {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  defaultParams?: TestTypeDefaultParams;
  isActive: boolean;
  createdAt: string;
}
