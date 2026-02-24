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
    age: bigint;
    gpa: number;
    name: string;
}
export interface BankDetail {
    id: string;
    branch: string;
    accountId: string;
    icon: string;
    bankName: string;
}
export interface Account {
    id: string;
    studentId: string;
    balance: number;
    accountNumber: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export interface Transaction {
    id: string;
    accountId: string;
    date: string;
    amount: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAccount(accountNumber: string, balance: number, studentId: string): Promise<Account>;
    createBankDetail(bankName: string, branch: string, icon: string, accountId: string): Promise<BankDetail>;
    createStudent(name: string, age: bigint, gpa: number): Promise<Student>;
    createTransaction(amount: number, date: string, accountId: string): Promise<Transaction>;
    deleteAccount(id: string): Promise<void>;
    deleteBankDetail(id: string): Promise<void>;
    deleteStudent(id: string): Promise<void>;
    deleteTransaction(id: string): Promise<void>;
    getAccount(id: string): Promise<Account>;
    getAccountsByStudent(studentId: string): Promise<Array<Account>>;
    getAllAccounts(): Promise<Array<Account>>;
    getAllBankDetails(): Promise<Array<BankDetail>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBankDetail(id: string): Promise<BankDetail>;
    getBankDetailsByAccount(accountId: string): Promise<Array<BankDetail>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStudent(id: string): Promise<Student>;
    getTransaction(id: string): Promise<Transaction>;
    getTransactionsByAccount(accountId: string): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAccount(id: string, accountNumber: string, balance: number, studentId: string): Promise<Account>;
    updateBankDetail(id: string, bankName: string, branch: string, icon: string, accountId: string): Promise<BankDetail>;
    updateStudent(id: string, name: string, age: bigint, gpa: number): Promise<Student>;
    updateTransaction(id: string, amount: number, date: string, accountId: string): Promise<Transaction>;
}
