import { AuthGuard } from "./services/auth.guard";

export const authProviders = [
  AuthGuard
];

export const appRoutes = [
  { path: "", redirectTo: "/list", pathMatch: "full" }
];
