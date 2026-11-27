import { Metadata } from "next";
import DevCheatClientView from "./dev-cheat-client-view";

export const metadata: Metadata = {
    title: "Developer Cheat Panel | SIMTA Pendikom",
    description: "Halaman pengujian dan bypass status sementara untuk simulasi alur sistem skripsi."
};

export default function DevCheatPage() {
    return <DevCheatClientView />;
}
