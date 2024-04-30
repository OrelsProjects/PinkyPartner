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
  const status = useRef<
    "idle" | "loading" | "success" | "error" | "no-results"
  >("idle");
  const debouncedFetch = useRef<NodeJS.Timeout>();

  useEffect(() => {
    console.log("status", status.current);
  }, [status.current]);

  useEffect(() => {
    if (debouncedFetch.current) {
      clearTimeout(debouncedFetch.current);
    }

    if (!query) {
      setSearchResult([]);
      status.current = "idle";
      return;
    }

    status.current = "loading";

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
        status.current = "idle";
        return;
      }

      const now = Date.now();
      status.current = "loading";
      lastSearchTimestamp.current = now;
      setError(null);

      const response = await axios.get<AccountabilityPartner[]>(
        `/api/user/search/${query}/${page}`,
      );
      const data = response.data;

      if (lastSearchTimestamp.current !== now) return;
      status.current = data.length > 0 ? "success" : "no-results";
      setSearchResult(data);
    } catch (error: any) {
      setError(
        `An error occurred while fetching users. ${error.response.data.error}`,
      );
      status.current = "error";
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
    status: status.current,
    error,
    searchUsers,
    fetchUsers,
    loadMore,
  };
};

export default useSearchUser;
