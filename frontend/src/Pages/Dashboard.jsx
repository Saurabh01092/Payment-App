import { useEffect, useState } from "react"
import Appbar from "../Components/Appbar"
import Balance from "../Components/Balance"
import Users from "../Components/Users"
import axios from "axios"

const Dashboard = () => {

  const [balance, setBalance] = useState("");

  const fetchBalance = async () => {

    const response = await axios.get(
        "http://localhost:3000/api/v1/account/balance",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
    setBalance(response.data.balance);
  }

  useEffect(() => {
    fetchBalance();
  }, []);

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}
export default Dashboard
