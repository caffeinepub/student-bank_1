// Types for our local data models
export interface StudentRecord {
  id: string;
  name: string;
  dob: string;
  className: string;
  attendanceNumber: string;
  schoolName: string;
  taluka: string;
  district: string;
  createdAt: string;
}

export interface AccountRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  bankName: string;
  accountNumber: string;
  initialAmount: number;
  ifscCode: string;
  currentBalance: number;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  accountId: string;
  accountNumber: string;
  studentName: string;
  date: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
}

export interface BankDetailRecord {
  id: string;
  bankName: string;
  taluka: string;
  district: string;
  ifscCode: string;
  createdAt: string;
}

// Keys
const KEYS = {
  STUDENTS: 'sb_students',
  ACCOUNTS: 'sb_accounts',
  TRANSACTIONS: 'sb_transactions',
  BANK_DETAILS: 'sb_bank_details',
  AUTH: 'sb_auth',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Students
export function getStudents(): StudentRecord[] {
  return safeGet<StudentRecord[]>(KEYS.STUDENTS, []);
}

export function saveStudents(students: StudentRecord[]): void {
  safeSet(KEYS.STUDENTS, students);
}

export function addStudent(student: Omit<StudentRecord, 'id' | 'createdAt'>): StudentRecord {
  const students = getStudents();
  const newStudent: StudentRecord = {
    ...student,
    id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

export function updateStudent(id: string, data: Partial<StudentRecord>): void {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === id);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...data };
    saveStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
}

// Accounts
export function getAccounts(): AccountRecord[] {
  return safeGet<AccountRecord[]>(KEYS.ACCOUNTS, []);
}

export function saveAccounts(accounts: AccountRecord[]): void {
  safeSet(KEYS.ACCOUNTS, accounts);
}

export function addAccount(account: Omit<AccountRecord, 'id' | 'createdAt'>): AccountRecord {
  const accounts = getAccounts();
  const newAccount: AccountRecord = {
    ...account,
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  accounts.push(newAccount);
  saveAccounts(accounts);
  return newAccount;
}

export function updateAccount(id: string, data: Partial<AccountRecord>): void {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...data };
    saveAccounts(accounts);
  }
}

export function deleteAccount(id: string): void {
  const accounts = getAccounts().filter(a => a.id !== id);
  saveAccounts(accounts);
}

export function getAccountByNumber(accountNumber: string): AccountRecord | undefined {
  return getAccounts().find(a => a.accountNumber === accountNumber);
}

// Transactions
export function getTransactions(): TransactionRecord[] {
  return safeGet<TransactionRecord[]>(KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions: TransactionRecord[]): void {
  safeSet(KEYS.TRANSACTIONS, transactions);
}

export function addTransaction(transaction: Omit<TransactionRecord, 'id' | 'createdAt'>): TransactionRecord {
  const transactions = getTransactions();
  const newTransaction: TransactionRecord = {
    ...transaction,
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function getTransactionsByAccount(accountId: string): TransactionRecord[] {
  return getTransactions().filter(t => t.accountId === accountId);
}

// Bank Details
export function getBankDetails(): BankDetailRecord[] {
  return safeGet<BankDetailRecord[]>(KEYS.BANK_DETAILS, []);
}

export function saveBankDetails(details: BankDetailRecord[]): void {
  safeSet(KEYS.BANK_DETAILS, details);
}

export function addBankDetail(detail: Omit<BankDetailRecord, 'id' | 'createdAt'>): BankDetailRecord {
  const details = getBankDetails();
  const newDetail: BankDetailRecord = {
    ...detail,
    id: `bank_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  details.push(newDetail);
  saveBankDetails(details);
  return newDetail;
}

export function updateBankDetail(id: string, data: Partial<BankDetailRecord>): void {
  const details = getBankDetails();
  const idx = details.findIndex(d => d.id === id);
  if (idx !== -1) {
    details[idx] = { ...details[idx], ...data };
    saveBankDetails(details);
  }
}

export function deleteBankDetail(id: string): void {
  const details = getBankDetails().filter(d => d.id !== id);
  saveBankDetails(details);
}

// Auth
export interface AuthSession {
  role: 'admin' | 'user';
  accountNumber?: string;
}

export function getAuthSession(): AuthSession | null {
  return safeGet<AuthSession | null>(KEYS.AUTH, null);
}

export function setAuthSession(session: AuthSession): void {
  safeSet(KEYS.AUTH, session);
}

export function clearAuthSession(): void {
  localStorage.removeItem(KEYS.AUTH);
}

// Compute current balance for an account
export function computeCurrentBalance(accountId: string, initialAmount: number): number {
  const txns = getTransactionsByAccount(accountId);
  let balance = initialAmount;
  for (const t of txns) {
    if (t.type === 'deposit') balance += t.amount;
    else balance -= t.amount;
  }
  return balance;
}
