export interface CategoriesDataResponse {
  results: number
  metadata: Metadata
  data: CategoriesData[]
}

export interface Metadata {
  currentPage: number
  numberOfPages: number
  limit: number
}

export interface CategoriesData {
  _id: string
  name: string
  slug: string
  image: string
  createdAt: string
  updatedAt: string
}

