import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Float "mo:core/Float";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
    accountNumber : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Data types
  public type Student = {
    id : Text;
    name : Text;
    dateOfBirth : Text;
    studentClass : Text;
    rollNumber : Text;
    schoolName : Text;
    taluka : Text;
    district : Text;
    transactions : [Transaction];
    accounts : [Account];
  };

  public type Account = {
    id : Text;
    studentName : Text;
    studentClass : Text;
    bankName : Text;
    accountNumber : Text;
    initialAmount : Float;
    ifscCode : Text;
    transactions : [Transaction];
  };

  public type TransactionType = {
    #deposit;
    #withdrawal;
  };

  public type Transaction = {
    id : Text;
    accountNumber : Text;
    studentName : Text;
    initialAmount : Float;
    date : Text;
    transactionType : TransactionType;
    amount : Float;
    reason : Text;
    totalAmount : Float;
  };

  public type BankDetail = {
    id : Text;
    bankName : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  // State
  let students = Map.empty<Text, Student>();
  let accounts = Map.empty<Text, Account>();
  let transactions = Map.empty<Text, Transaction>();
  let bankDetails = Map.empty<Text, BankDetail>();

  // --- User Profile functions (required by frontend) ---
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // --- Students CRUD (admin only) ---
  public shared ({ caller }) func createStudent(
    name : Text,
    dateOfBirth : Text,
    studentClass : Text,
    rollNumber : Text,
    schoolName : Text,
    taluka : Text,
    district : Text
  ) : async Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create students");
    };
    let id = "student-" # name;
    let newStudent : Student = {
      id;
      name;
      dateOfBirth;
      studentClass;
      rollNumber;
      schoolName;
      taluka;
      district;
      transactions = [];
      accounts = [];
    };
    students.add(id, newStudent);
    newStudent;
  };

  public query ({ caller }) func getStudent(id : Text) : async Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student };
    };
  };

  public shared ({ caller }) func updateStudent(
    id : Text,
    name : Text,
    dateOfBirth : Text,
    studentClass : Text,
    rollNumber : Text,
    schoolName : Text,
    taluka : Text,
    district : Text
  ) : async Student {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (_) {
        let updatedStudent : Student = {
          id;
          name;
          dateOfBirth;
          studentClass;
          rollNumber;
          schoolName;
          taluka;
          district;
          transactions = [];
          accounts = [];
        };
        students.add(id, updatedStudent);
        updatedStudent;
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    if (not students.containsKey(id)) {
      Runtime.trap("Student not found");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list students");
    };
    students.values().toArray();
  };

  // --- Accounts CRUD (admin only) ---
  public shared ({ caller }) func createAccount(
    studentName : Text,
    studentClass : Text,
    bankName : Text,
    accountNumber : Text,
    initialAmount : Float,
    ifscCode : Text
  ) : async Account {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create accounts");
    };
    let id = "account-" # accountNumber;
    let newAccount : Account = {
      id;
      studentName;
      studentClass;
      bankName;
      accountNumber;
      initialAmount;
      ifscCode;
      transactions = [];
    };
    accounts.add(id, newAccount);
    newAccount;
  };

  public query ({ caller }) func getAccount(id : Text) : async Account {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view accounts");
    };
    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
  };

  public shared ({ caller }) func updateAccount(
    id : Text,
    studentName : Text,
    studentClass : Text,
    bankName : Text,
    accountNumber : Text,
    initialAmount : Float,
    ifscCode : Text
  ) : async Account {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update accounts");
    };
    switch (accounts.get(id)) {
      case (null) { Runtime.trap("Account not found") };
      case (_) {
        let updatedAccount : Account = {
          id;
          studentName;
          studentClass;
          bankName;
          accountNumber;
          initialAmount;
          ifscCode;
          transactions = [];
        };
        accounts.add(id, updatedAccount);
        updatedAccount;
      };
    };
  };

  public shared ({ caller }) func deleteAccount(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete accounts");
    };
    if (not accounts.containsKey(id)) {
      Runtime.trap("Account not found");
    };
    accounts.remove(id);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list accounts");
    };
    accounts.values().toArray();
  };

  // --- Transactions CRUD (admin only) ---
  public shared ({ caller }) func createTransaction(
    accountNumber : Text,
    studentName : Text,
    initialAmount : Float,
    date : Text,
    transactionType : TransactionType,
    amount : Float,
    reason : Text,
    totalAmount : Float
  ) : async Transaction {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create transactions");
    };
    let id = "transaction-" # accountNumber # "-" # date;
    let newTransaction : Transaction = {
      id;
      accountNumber;
      studentName;
      initialAmount;
      date;
      transactionType;
      amount;
      reason;
      totalAmount;
    };
    transactions.add(id, newTransaction);
    newTransaction;
  };

  public query ({ caller }) func getTransaction(id : Text) : async Transaction {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?transaction) { transaction };
    };
  };

  public shared ({ caller }) func updateTransaction(
    id : Text,
    accountNumber : Text,
    studentName : Text,
    initialAmount : Float,
    date : Text,
    transactionType : TransactionType,
    amount : Float,
    reason : Text,
    totalAmount : Float
  ) : async Transaction {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update transactions");
    };
    switch (transactions.get(id)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (_) {
        let updatedTransaction : Transaction = {
          id;
          accountNumber;
          studentName;
          initialAmount;
          date;
          transactionType;
          amount;
          reason;
          totalAmount;
        };
        transactions.add(id, updatedTransaction);
        updatedTransaction;
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete transactions");
    };
    if (not transactions.containsKey(id)) {
      Runtime.trap("Transaction not found");
    };
    transactions.remove(id);
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list transactions");
    };
    transactions.values().toArray();
  };

  // --- Bank Details CRUD ---
  // Write operations: admin only
  // Read operations: admin and authenticated users
  public shared ({ caller }) func createBankDetail(bankName : Text, taluka : Text, district : Text, ifscCode : Text) : async BankDetail {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create bank details");
    };
    let id = "bank-" # bankName;
    let newBankDetail : BankDetail = {
      id;
      bankName;
      taluka;
      district;
      ifscCode;
    };
    bankDetails.add(id, newBankDetail);
    newBankDetail;
  };

  public query ({ caller }) func getBankDetail(id : Text) : async BankDetail {
    // Readable by admin and authenticated users (not guests)
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view bank details");
    };
    switch (bankDetails.get(id)) {
      case (null) { Runtime.trap("Bank detail not found") };
      case (?bankDetail) { bankDetail };
    };
  };

  public shared ({ caller }) func updateBankDetail(id : Text, bankName : Text, taluka : Text, district : Text, ifscCode : Text) : async BankDetail {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update bank details");
    };
    switch (bankDetails.get(id)) {
      case (null) { Runtime.trap("Bank detail not found") };
      case (_) {
        let updatedBankDetail : BankDetail = {
          id;
          bankName;
          taluka;
          district;
          ifscCode;
        };
        bankDetails.add(id, updatedBankDetail);
        updatedBankDetail;
      };
    };
  };

  public shared ({ caller }) func deleteBankDetail(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete bank details");
    };
    if (not bankDetails.containsKey(id)) {
      Runtime.trap("Bank detail not found");
    };
    bankDetails.remove(id);
  };

  // Bank details list: readable by everyone (guests included) per plan
  public query func getAllBankDetails() : async [BankDetail] {
    bankDetails.values().toArray();
  };

  // --- Passbook (accessible by admin and authenticated users) ---
  // Users can only view their own passbook; admins can view any
  public query ({ caller }) func getPassbook(accountNumber : Text) : async (Account, [Transaction]) {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);

    if (not isAdmin and not isUser) {
      Runtime.trap("Unauthorized: Must be logged in to view passbook");
    };

    // If user (non-admin), verify they are accessing their own account
    if (not isAdmin) {
      // Check that the caller's profile matches the requested account number
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for this user");
        };
        case (?profile) {
          if (profile.accountNumber != accountNumber) {
            Runtime.trap("Unauthorized: Users can only view their own passbook");
          };
        };
      };
    };

    let accountId = "account-" # accountNumber;
    switch (accounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) {
        let accountTransactions = transactions.values().toArray().filter(
          func(t : Transaction) : Bool { t.accountNumber == accountNumber }
        );
        (account, accountTransactions);
      };
    };
  };

  // --- Filtering functions ---

  // Admin only: get accounts by student name
  public query ({ caller }) func getAccountsByStudent(studentName : Text) : async [Account] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can filter accounts by student");
    };
    accounts.values().toArray().filter(
      func(account : Account) : Bool { account.studentName == studentName }
    );
  };

  // Admin or authenticated user (user can only query their own account)
  public query ({ caller }) func getTransactionsByAccount(accountNumber : Text) : async [Transaction] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isUser = AccessControl.hasPermission(accessControlState, caller, #user);

    if (not isAdmin and not isUser) {
      Runtime.trap("Unauthorized: Must be logged in to view transactions");
    };

    if (not isAdmin) {
      switch (userProfiles.get(caller)) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for this user");
        };
        case (?profile) {
          if (profile.accountNumber != accountNumber) {
            Runtime.trap("Unauthorized: Users can only view their own transactions");
          };
        };
      };
    };

    transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool { transaction.accountNumber == accountNumber }
    );
  };

  // Bank detail filters: readable by everyone
  public query func getBankDetailsByDistrict(district : Text) : async [BankDetail] {
    bankDetails.values().toArray().filter(
      func(bank : BankDetail) : Bool { bank.district == district }
    );
  };

  public query func getBankDetailsByTaluka(taluka : Text) : async [BankDetail] {
    bankDetails.values().toArray().filter(
      func(bank : BankDetail) : Bool { bank.taluka == taluka }
    );
  };

  // History search: admin only
  public query ({ caller }) func searchTransactions(
    accountNumber : Text,
    dateFrom : Text,
    dateTo : Text,
  ) : async {
    studentName : Text;
    bankName : Text;
    ifscCode : Text;
    transactions : [Transaction];
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can search transaction history");
    };

    let filteredTransactions = transactions.values().toArray().filter(
      func(transaction : Transaction) : Bool {
        transaction.accountNumber == accountNumber
        and (dateFrom == "" or transaction.date >= dateFrom)
        and (dateTo == "" or transaction.date <= dateTo)
      }
    );

    let accountId = "account-" # accountNumber;
    switch (accounts.get(accountId)) {
      case (null) {
        {
          studentName = "";
          bankName = "";
          ifscCode = "";
          transactions = filteredTransactions;
        };
      };
      case (?account) {
        {
          studentName = account.studentName;
          bankName = account.bankName;
          ifscCode = account.ifscCode;
          transactions = filteredTransactions;
        };
      };
    };
  };

  // Admin login: caller must be authenticated (non-anonymous) via Internet Identity first,
  // then provide valid admin credentials to be granted the admin role.
  public shared ({ caller }) func adminLogin(username : Text, password : Text) : async () {
    // Reject anonymous callers: Internet Identity authentication is required before calling this
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must authenticate with Internet Identity before admin login");
    };

    if (username != "admin") {
      Runtime.trap("Invalid username: Expected 'admin'");
    };

    // For demo purposes, password check is hardcoded
    if (password != "admin") {
      Runtime.trap("Invalid password: Incorrect admin password");
    };

    // Assign admin role only if not already assigned
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      // Elevate the current authenticated principal to admin role
      AccessControl.initialize(accessControlState, caller, "adminToken", "adminToken");
    };
  };
};
