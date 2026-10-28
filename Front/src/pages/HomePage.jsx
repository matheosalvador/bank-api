import { NavLink, Outlet } from "react-router";

export default function HomePage() {
    return (
        <>
            <header>
                <nav>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                </nav>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}
