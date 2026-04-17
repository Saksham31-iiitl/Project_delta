import { Link } from "react-router-dom";
import { PageWrapper } from "@components/layout/PageWrapper.jsx";

export default function NotFoundPage() {
  return (
    <PageWrapper className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-brand-600">
        Go home
      </Link>
    </PageWrapper>
  );
}
