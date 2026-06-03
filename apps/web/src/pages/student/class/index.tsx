import { Outlet, useOutletContext } from "react-router-dom";

const ClassIndex = () => {
  const context = useOutletContext<{ openMobileNav?: () => void }>();

  return (
    <div>
      <Outlet context={context} />
    </div>
  );
};

export default ClassIndex;
