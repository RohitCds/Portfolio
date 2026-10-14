import { withAuth } from "next-auth/middleware";

// Admin editors require a signed-in session; everyone else is sent to the login page
export default withAuth({ pages: { signIn: "/admin-login-9271" } });

export const config = {
  matcher: ["/about/edit", "/skills/edit", "/projects/edit", "/projects/new", "/projects/manage"],
};
