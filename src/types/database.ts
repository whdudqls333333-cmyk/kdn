export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          email?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          is_notice: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          is_notice?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          content?: string
          is_notice?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          content: string
          author_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          content: string
          author_id: string
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
    }
  }
}
