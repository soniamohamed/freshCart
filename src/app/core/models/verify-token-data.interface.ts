export interface VerifyTokenDataResponse {
  message: string;
  decoded: {
    id: string;
    name?: string;
    role?: string;
  };
}
