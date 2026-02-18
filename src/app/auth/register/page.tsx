// Redirect to the proper sign-up page
import { redirect } from "next/navigation";

export default function Register() {
  redirect("/auth/sign-up");
}
