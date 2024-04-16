export default interface AppUser {
  userId: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
}
