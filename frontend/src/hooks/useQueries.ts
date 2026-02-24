// This file is intentionally minimal since all data is stored in localStorage.
// Backend calls are not used for the core Student Bank functionality.
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useBackendStatus() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['backendStatus'],
    queryFn: async () => {
      if (!actor) return null;
      return true;
    },
    enabled: !!actor && !isFetching,
  });
}
