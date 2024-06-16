import Header from "./Header";
import CartOverview from "../features/cart/CartOverview";
import { Outlet, useNavigation } from "react-router-dom";
import Loader from "./Loader";

function AppLayout() {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    // console.log(navigation);
    return (
        <div className="grid grid-rows-[auto_1fr_auto] gap-4  h-screen  ">
            {isLoading && <Loader />}
            <Header />
            <div className="2xl:overflow-scroll ">
                <main className=" max-w-3xl mx-auto">
                    <Outlet />
                </main>
            </div>
            <CartOverview />
        </div>
    )
}
export default AppLayout;