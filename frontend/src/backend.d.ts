import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Student {
    id: string;
    dateOfBirth: string;
    name: string;
    district: string;
    taluka: string;
    accounts: Array<Account>;
    rollNumber: string;
    transactions: Array<Transaction>;
    studentClass: string;
    schoolName: string;
}
export interface BankDetail {
    id: string;
    ifscCode: string;
    bankName: string;
    district: string;
    taluka: string;
}
export interface Account {
    id: string;
    studentName: string;
    ifscCode: string;
    bankName: string;
    initialAmount: number;
    accountNumber: string;
    transactions: Array<Transaction>;
    studentClass: string;
}
export interface UserProfile {
    name: string;
    accountNumber: string;
}
export interface Transaction {
    id: string;
    transactionType: TransactionType;
    studentName: string;
    date: string;
    totalAmount: number;
    initialAmount: number;
    accountNumber: string;
    amount: number;
    reason: string;
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminLogin(username: string, password: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAccount(studentName: string, studentClass: string, bankName: string, accountNumber: string, initialAmount: number, ifscCode: string): Promise<Account>;
    createBankDetail(bankName: string, taluka: string, district: string, ifscCode: string): Promise<BankDetail>;
    createStudent(name: string, dateOfBirth: string, studentClass: string, rollNumber: string, schoolName: string, taluka: string, district: string): Promise<Student>;
    createTransaction(accountNumber: string, studentName: string, initialAmount: number, date: string, transactionType: TransactionType, amount: number, reason: string, totalAmount: number): Promise<Transaction>;
    deleteAccount(id: string): Promise<void>;
    deleteBankDetail(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    getAccount(id: string): Promise<Account>;
    getAccountsByStudent(studentName: string): Promise<Array<Account>>;
    getAllAccounts(): Promise<Array<Account>>;
    getAllBankDetails(): Promise<Array<BankDetail>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBankDetail(id: string): Promise<BankDetail>;
    getBankDetailsByDistrict(district: string): Promise<Array<BankDetail>>;
    getBankDetailsByTaluka(taluka: string): Promise<Array<BankDetail>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPassbook(accountNumber: string): Promise<[Account, Array<Transaction>]>;
    getStudent(id: string): Promise<Student>;
    getTransaction(id: string): Promise<Transaction>;
    getTransactionsByAccount(accountNumber: string): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTransactions(accountNumber: string, dateFrom: string, dateTo: string): Promise<{
        studentName: string;
        ifscCode: string;
        bankName: string;
        transactions: Array<Transaction>;
    }>;
    updateAccount(id: string, studentName: string, studentClass: string, bankName: string, accountNumber: string, initialAmount: number, ifscCode: string): Promise<Account>;
    updateBankDetail(id: string, bankName: string, taluka: string, district: string, ifscCode: string): Promise<BankDetail>;
    updateStudent(id: string, name: string, dateOfBirth: string, studentClass: string, rollNumber: string, schoolName: string, taluka: string, district: string): Promise<Student>;
    updateTransaction(id: string, accountNumber: string, studentName: string, initialAmount: number, date: string, transactionType: TransactionType, amount: number, reason: string, totalAmount: number): Promise<Transaction>;
}
