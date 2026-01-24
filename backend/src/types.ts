import 'express-session'

declare module 'express-session' {
  export interface SessionData {
    user?: {
      user_id: string
      username: string
    }
  }
}
