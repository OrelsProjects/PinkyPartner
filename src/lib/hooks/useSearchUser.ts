import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AccountabilityPartner } from "../../models/appUser";

interface SearchUserHook {
  searchResult: AccountabilityPartner[];
  loading: boolean;
  error: string | null;
  searchUsers: (query: string) => void;
  fetchUsers: () => void;
  loadMore: () => void;
}

const useSearchUser = (): SearchUserHook => {
  const [searchResult, setSearchResult] = useState<AccountabilityPartner[]>([]);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const lastSearchTimestamp = useRef<number>(0);
  const loading = useRef<boolean>(false);
  const debouncedFetch = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }

    loading.current = true;

    debouncedFetch.current = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => {
      if (debouncedFetch.current) {
        clearTimeout(debouncedFetch.current);
      }
    };
  }, [query, page]);

  const fetchUsers = async () => {
    try {
      if (!query) {
        setSearchResult([]);
        loading.current = false;
        return;
      }

      const now = Date.now();
      loading.current = true;
      lastSearchTimestamp.current = now;
      setError(null);

      const response = await axios.get<AccountabilityPartner[]>(
        `/api/user/search/${query}/${page}`,
      );
      const data = response.data;

      if (lastSearchTimestamp.current !== now) return;

      setSearchResult(data);
    } catch (error) {
      setError("An error occurred while fetching users.");
    } finally {
      loading.current = false;
    }
  };

  const searchUsers = (query: string) => {
    setSearchResult([]);
    setQuery(query);
    setPage(1);
  };

  const loadMore = () => {
    setPage(page + 1);
  };

  return {
    searchResult,
    loading: loading.current,
    error,
    searchUsers,
    fetchUsers,
    loadMore,
  };
};

export default useSearchUser;
