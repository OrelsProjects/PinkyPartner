import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { AccountabilityPartner } from "../../models/appUser";

interface SearchUserHook {
  searchResult: AccountabilityPartner[];
  status: "idle" | "loading" | "success" | "error" | "no-results";
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
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "no-results"
  >("idle");
  const debouncedFetch = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }

    if (!query) {
      setSearchResult([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");

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
        setStatus("idle");
        return;
      }

      const now = Date.now();
      setStatus("loading");
      lastSearchTimestamp.current = now;
      setError(null);

      const response = await axios.get<AccountabilityPartner[]>(
        `/api/user/search/${query}/${page}`,
      );
      const data = response.data;

      if (lastSearchTimestamp.current !== now) return;
      const newStatus = data.length > 0 ? "success" : "no-results";
      setStatus(newStatus);
      setSearchResult(data);
    } catch (error: any) {
      setError(
        `An error occurred while fetching users. ${error.response.data.error}`,
      );
      setStatus("error");
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
    status,
    error,
    searchUsers,
    fetchUsers,
    loadMore,
  };
};

export default useSearchUser;
