import { useState } from 'react';

interface UseSearch {
  (initialState?: object): [object, (name: string, value: any) => void];
}

export const useSearch: UseSearch = (initialState = {}) => {
  const [search, setSearch] = useState<any>(initialState);

  function _handleSearch(name: string, value: any) {
    setSearch((search: any) => ({ ...search, [name]: value }));
  }

  return [search, _handleSearch];
};
