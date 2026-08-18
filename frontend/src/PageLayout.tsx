import type { ReactNode } from "react";
import Header from "./components/Header";
import UserAside from "./components/UserAside";
import { useSharedData } from "./dataContext";

// Shared template for every page: the header (with nav + member switcher)
// on top, the page content in <main id="main">, and the user reservations +
// checkouts aside on the right. All pages render their body via children.
export function PageLayout({ children }: { children: ReactNode }) {
  const { currentMember, userData } = useSharedData();
  return (
    <>
      <Header currentMember={currentMember} />
      <div className="flex">
        <main id="main">{children}</main>
        <UserAside data={userData} />
      </div>
    </>
  );
}

export default PageLayout;
