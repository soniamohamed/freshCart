
export interface UserDataResponse {
  message: string
  user: UserData
  token: string
}

export interface UserData {
  name: string
  email: string
  role: string
}
