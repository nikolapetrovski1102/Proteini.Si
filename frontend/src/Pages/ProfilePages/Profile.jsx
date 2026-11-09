import { Outlet } from "react-router-dom";
import ProfileNav from "./ProfileNav";

export function ProfileLayout({ children, showNav = true }) {
  return (
    <div className="home-tint min-h-[60vh] bg-[#f6f5f1]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:py-12">
        {showNav && <ProfileNav />}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <ProfileLayout>
      <Outlet />
    </ProfileLayout>
  );
}
