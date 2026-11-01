import { Outlet } from "react-router-dom";
import ProfileNav from "./ProfileNav";

export default function Profile() {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full gap-24 max-sm:gap-16 flex pl-24 pr-48 max-md:py-0 max-md:px-4 max-md:flex-col">
        {/* profile navigation */}
        <ProfileNav />

        {/* dynamic content area - nested routes will render here */}
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
