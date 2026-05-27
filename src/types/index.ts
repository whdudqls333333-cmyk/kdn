export interface Profile {
  id: string
  email: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  created_at: string
  is_notice: boolean
  profiles: Profile | null
}

export interface Comment {
  id: string
  post_id: string
  content: string
  author_id: string
  created_at: string
  profiles: Profile | null
}
