import { useEffect, useState } from "react";
import { useDataContext } from "../context/Data";
export const Main = () => {
  const { servicesData } = useDataContext();

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (servicesData.length > 0) {
      setLoading(true);
    }
  }, [servicesData]);
  return loading ? <div>Loading</div> : <div>{servicesData[0]._id}</div>;
};
