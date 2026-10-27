/** The authenticated user's minimal profile, independent of the API's response shape. */
export interface AuthUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}
