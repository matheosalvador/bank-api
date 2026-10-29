import { NavLink, Outlet } from "react-router";

export default function Dashboard() {
    return (
        <>
            <header>
                <nav>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}
