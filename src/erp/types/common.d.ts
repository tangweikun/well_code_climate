declare interface PaginationResponse<Item> {
  data: {
    total: number;
    rows: Item[];
    [key: string]: any;
  };
  code: number;
  message: string;
}

declare interface Response {
  data: any;
  code: number;
  message: string;
}

declare interface IPagination {
  pageSize: number | undefined;
  total: number;
  current: number;
}

declare type IOption = {
  value: any;
  label: string;
};

declare interface IPaginationParams {
  page: number;
  limit: number;
}

declare module 'recharts';

declare module 'uuid';

declare interface Window {
  // TODO: 可扩展全局变量
}
