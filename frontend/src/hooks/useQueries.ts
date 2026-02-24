import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TransactionType } from '../backend';
import type { Student, Account, Transaction, BankDetail, UserProfile } from '../backend';

// ─── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<string>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string; dateOfBirth: string; studentClass: string;
      rollNumber: string; schoolName: string; taluka: string; district: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStudent(data.name, data.dateOfBirth, data.studentClass,
        data.rollNumber, data.schoolName, data.taluka, data.district);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string; name: string; dateOfBirth: string; studentClass: string;
      rollNumber: string; schoolName: string; taluka: string; district: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStudent(data.id, data.name, data.dateOfBirth, data.studentClass,
        data.rollNumber, data.schoolName, data.taluka, data.district);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteStudent(id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); },
  });
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useGetAllAccounts() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAccounts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      studentName: string; studentClass: string; bankName: string;
      accountNumber: string; initialAmount: number; ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAccount(data.studentName, data.studentClass, data.bankName,
        data.accountNumber, data.initialAmount, data.ifscCode);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string; studentName: string; studentClass: string; bankName: string;
      accountNumber: string; initialAmount: number; ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAccount(data.id, data.studentName, data.studentClass, data.bankName,
        data.accountNumber, data.initialAmount, data.ifscCode);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount(id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounts'] }); },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetAllTransactions() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      accountNumber: string; studentName: string; initialAmount: number;
      date: string; transactionType: TransactionType; amount: number;
      reason: string; totalAmount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTransaction(data.accountNumber, data.studentName, data.initialAmount,
        data.date, data.transactionType, data.amount, data.reason, data.totalAmount);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: string; accountNumber: string; studentName: string; initialAmount: number;
      date: string; transactionType: TransactionType; amount: number;
      reason: string; totalAmount: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTransaction(data.id, data.accountNumber, data.studentName,
        data.initialAmount, data.date, data.transactionType, data.amount, data.reason, data.totalAmount);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteTransaction(id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); },
  });
}

// ─── Bank Details ─────────────────────────────────────────────────────────────

export function useGetAllBankDetails() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<BankDetail[]>({
    queryKey: ['bankDetails'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBankDetails();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { bankName: string; taluka: string; district: string; ifscCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBankDetail(data.bankName, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bankDetails'] }); },
  });
}

export function useUpdateBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; bankName: string; taluka: string; district: string; ifscCode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBankDetail(data.id, data.bankName, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bankDetails'] }); },
  });
}

export function useDeleteBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBankDetail(id);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bankDetails'] }); },
  });
}

// ─── Passbook ─────────────────────────────────────────────────────────────────

export function useGetPassbook(accountNumber: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<[Account, Transaction[]]>({
    queryKey: ['passbook', accountNumber],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPassbook(accountNumber);
    },
    enabled: !!actor && !actorFetching && !!accountNumber,
    retry: false,
  });
}

// ─── Search Transactions ──────────────────────────────────────────────────────

export function useSearchTransactions() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { accountNumber: string; dateFrom: string; dateTo: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.searchTransactions(params.accountNumber, params.dateFrom, params.dateTo);
    },
  });
}
