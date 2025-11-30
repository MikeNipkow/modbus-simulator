import useDevices from "@/hooks/useDevices";

export function Test() {
    const { data: devices, error, isLoading } = useDevices();

    return (
        <>
            {JSON.stringify(devices[0])}
        </>
    );
}