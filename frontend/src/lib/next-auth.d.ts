import "next-auth";

declare module "next-auth" {
  interface Session {
    user: User;
  }
  interface User {
    id: string;
    username: string;
    email:string
    image:string
    name:string
    emailVerified:boolean
    
  }
}
