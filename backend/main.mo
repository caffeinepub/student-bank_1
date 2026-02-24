import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Data types
  public type Student = {
    id : Text;
    name : Text;
    age : Nat;
    gpa : Float;
  };

  public type Account = {
    id : Text;
    accountNumber : Text;
    balance : Float;
    studentId : Text;
  };

  public type Transaction = {
    id : Text;
    amount : Float;
    date : Text;
    accountId : Text;
  };

  public type BankDetail = {
    id : Text;
    bankName : Text;
    branch : Text;
    icon : Text;
    accountId : Text;
  };

  // State
  let students = Map.empty<Text, Student>();
  let accounts = Map.empty<Text, Account>();
  let transactions = Map.empty<Text, Transaction>();
  let bankDetails = Map.empty<Text, BankDetail>();

  // User Profile CRUD
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Students CRUD
  public shared ({ caller }) func createStudent(name : Text, age : Nat, gpa : Float) : async Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create students");
    };
    let id = "student" # name;
    let newStudent : Student = {
      id;
      name;
      age;
      gpa;
    };
    students.add(id, newStudent);
    newStudent;
  };

  public query ({ caller }) func getStudent(id : Text) : async Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student };
    };
  };

  public shared ({ caller }) func updateStudent(id : Text, name : Text, age : Nat, gpa : Float) : async Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (_) {
        let updatedStudent : Student = {
          id;
          name;
          age;
          gpa;
        };
        students.add(id, updatedStudent);
        updatedStudent;
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete students");
    };
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list students");
    };
    students.values().toArray();
  };

  // Accounts CRUD
  public shared ({ caller }) func createAccount(accountNumber : Text, balance : Float, studentId : Text) : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create accounts");
    };
    if (not students.containsKey(studentId)) {
      Runtime.trap("Student does not exist");
    };
    let id = "account" # accountNumber;
    let newAccount : Account = {
      id;
      accountNumber;
      balance;
      studentId;
    };
    accounts.add(id, newAccount);
    newAccount;
  };

  public query ({ caller }) func getAccount(id : Text) : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view accounts");
    };
    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
  };

  public shared ({ caller }) func updateAccount(id : Text, accountNumber : Text, balance : Float, studentId : Text) : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update accounts");
    };
    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (_) {
        let updatedAccount : Account = {
          id;
          accountNumber;
          balance;
          studentId;
        };
        accounts.add(id, updatedAccount);
        updatedAccount;
      };
    };
  };

  public shared ({ caller }) func deleteAccount(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete accounts");
    };
    if (not accounts.containsKey(id)) {
      Runtime.trap("Account not found");
    };
    accounts.remove(id);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list accounts");
    };
    accounts.values().toArray();
  };

  // Transactions CRUD
  public shared ({ caller }) func createTransaction(amount : Float, date : Text, accountId : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create transactions");
    };
    if (not accounts.containsKey(accountId)) {
      Runtime.trap("Account does not exist");
    };
    let id = "transaction" # accountId;
    let newTransaction : Transaction = {
      id;
      amount;
      date;
      accountId;
    };
    transactions.add(id, newTransaction);
    newTransaction;
  };

  public query ({ caller }) func getTransaction(id : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) { transaction };
    };
  };

  public shared ({ caller }) func updateTransaction(id : Text, amount : Float, date : Text, accountId : Text) : async Transaction {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (_) {
        let updatedTransaction : Transaction = {
          id;
          amount;
          date;
          accountId;
        };
        transactions.add(id, updatedTransaction);
        updatedTransaction;
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };
    if (not transactions.containsKey(id)) {
      Runtime.trap("Transaction not found");
    };
    transactions.remove(id);
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list transactions");
    };
    transactions.values().toArray();
  };

  // Bank Details CRUD
  public shared ({ caller }) func createBankDetail(bankName : Text, branch : Text, icon : Text, accountId : Text) : async BankDetail {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bank details");
    };
    if (not accounts.containsKey(accountId)) {
      Runtime.trap("Account does not exist");
    };
    let id = "bankDetail" # bankName;
    let newBankDetail : BankDetail = {
      id;
      bankName;
      branch;
      icon;
      accountId;
    };
    bankDetails.add(id, newBankDetail);
    newBankDetail;
  };

  public query ({ caller }) func getBankDetail(id : Text) : async BankDetail {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bank details");
    };
    switch (bankDetails.get(id)) {
      case (null) { Runtime.trap("Bank detail not found") };
      case (?bankDetail) { bankDetail };
    };
  };

  public shared ({ caller }) func updateBankDetail(id : Text, bankName : Text, branch : Text, icon : Text, accountId : Text) : async BankDetail {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update bank details");
    };
    switch (bankDetails.get(id)) {
      case (null) { Runtime.trap("Bank detail not found") };
      case (_) {
        let updatedBankDetail : BankDetail = {
          id;
          bankName;
          branch;
          icon;
          accountId;
        };
        bankDetails.add(id, updatedBankDetail);
        updatedBankDetail;
      };
    };
  };

  public shared ({ caller }) func deleteBankDetail(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bank details");
    };
    if (not bankDetails.containsKey(id)) {
      Runtime.trap("Bank detail not found");
    };
    bankDetails.remove(id);
  };

  public query ({ caller }) func getAllBankDetails() : async [BankDetail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list bank details");
    };
    bankDetails.values().toArray();
  };

  // Filtering functions
  public query ({ caller }) func getAccountsByStudent(studentId : Text) : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter accounts by student");
    };
    accounts.values().toArray().filter(func(account) { account.studentId == studentId });
  };

  public query ({ caller }) func getTransactionsByAccount(accountId : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter transactions by account");
    };
    transactions.values().toArray().filter(func(transaction) { transaction.accountId == accountId });
  };

  public query ({ caller }) func getBankDetailsByAccount(accountId : Text) : async [BankDetail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter bank details by account");
    };
    bankDetails.values().toArray().filter(func(bankDetail) { bankDetail.accountId == accountId });
  };
};
